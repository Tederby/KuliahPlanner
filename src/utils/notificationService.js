import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const CHANNEL_ID = 'kuliahplanner_reminders';

/**
 * Generate a 32-bit integer ID for Capacitor Local Notifications.
 * Android requires notification IDs to be 32-bit signed integers (> 0).
 */
export const toNotificationId = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash % 2000000000) + 1;
};

/**
 * Request notification permissions across native and web platforms.
 */
export const requestNotificationPermission = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions();
      if (status.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        return req.display === 'granted';
      }
      return true;
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') return true;
      if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }
    }
    return false;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return false;
  }
};

/**
 * Ensure notification channel is created for Android 8.0+
 */
export const initNotificationChannel = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Pengingat Kuliah & Tugas',
      description: 'Notifikasi jadwal kelas, deadline tugas, dan briefing harian',
      importance: 4, // High importance (heads-up notification)
      visibility: 1, // Public on lockscreen
      vibration: true,
      lights: true,
      lightColor: '#f97316',
    });
  } catch (err) {
    console.warn('Failed to create notification channel:', err);
  }
};

/**
 * Send an immediate test notification to verify audio, vibration, and banner.
 */
export const sendTestNotification = async () => {
  const granted = await requestNotificationPermission();
  if (!granted) {
    throw new Error('Izin notifikasi belum diberikan di pengaturan perangkat / browser.');
  }

  await initNotificationChannel();

  if (Capacitor.isNativePlatform()) {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 999999,
          title: '🔔 Notifikasi KuliahPlanner Berfungsi!',
          body: 'Pengingat jadwal kelas dan deadline tugas kamu siap aktif di HP ini.',
          channelId: CHANNEL_ID,
          schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
        },
      ],
    });
    return true;
  }

  // Web Notification fallback
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('🔔 Notifikasi KuliahPlanner Berfungsi!', {
      body: 'Pengingat jadwal kelas dan deadline tugas kamu siap aktif di browser ini.',
      icon: '/favicon.ico',
    });
    return true;
  }

  return false;
};

/**
 * Reschedule all upcoming local notifications based on current data and settings.
 *
 * @param {Object} options
 * @param {Array} options.calendarEvents - instances from useCalendarEvents
 * @param {Array} options.tasks - list of tasks
 * @param {Array} options.courses - list of courses
 * @param {Object} options.settings - notification settings { enabled, classLeadMinutes, dailyBriefing, dailyBriefingTime, taskReminders }
 */
export const syncLocalNotifications = async ({ calendarEvents = [], tasks = [], courses = [], settings = {} }) => {
  if (!Capacitor.isNativePlatform()) return;

  const isEnabled = settings.enabled !== false;
  if (!isEnabled) {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch (e) {
      console.warn('Error clearing notifications:', e);
    }
    return;
  }

  try {
    await initNotificationChannel();

    // Cancel previously scheduled notifications to prevent duplicates
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const notificationsToSchedule = [];
    const now = Date.now();
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
    const maxFutureTime = now + twoWeeksMs;

    // 1. Schedule Class Reminders (H-x minutes)
    const leadMinutes = Number(settings.classLeadMinutes ?? 15);
    if (leadMinutes > 0) {
      const upcomingClasses = calendarEvents.filter(
        (ev) => ev.type === 'course' && ev.date && ev.startTime
      );

      for (const ev of upcomingClasses) {
        // Parse date (YYYY-MM-DD) and startTime (HH:mm)
        const [year, month, day] = ev.date.split('-').map(Number);
        const [hour, minute] = ev.startTime.split(':').map(Number);
        const classDate = new Date(year, month - 1, day, hour, minute, 0, 0);

        const notifyTime = classDate.getTime() - leadMinutes * 60 * 1000;
        // Schedule only if in future and within the next 2 weeks
        if (notifyTime > now + 10000 && notifyTime <= maxFutureTime) {
          const course = courses.find((c) => c.id === ev.courseId || c.id === ev.id);
          const room = ev.location || course?.location || '';
          const roomText = room ? ` di ${room}` : '';
          const meetingText = ev.meetingNum ? ` (Pertemuan ${ev.meetingNum})` : '';

          notificationsToSchedule.push({
            id: toNotificationId(`class_${ev.instanceId || `${ev.id}_${ev.date}`}_${leadMinutes}`),
            title: `📚 Kelas ${ev.name || course?.name} dalam ${leadMinutes} menit`,
            body: `Pukul ${ev.startTime}${ev.endTime ? ` - ${ev.endTime}` : ''}${roomText}${meetingText}`,
            channelId: CHANNEL_ID,
            schedule: {
              at: new Date(notifyTime),
              allowWhileIdle: true,
            },
          });
        }
      }
    }

    // 2. Schedule Task Deadline Reminders
    if (settings.taskReminders !== false) {
      const uncompletedTasks = tasks.filter((t) => !t.completed && t.deadline);

      for (const t of uncompletedTasks) {
        const deadlineDate = new Date(t.deadline);
        const deadlineMs = deadlineDate.getTime();

        if (isNaN(deadlineMs)) continue;

        // Reminder H-3 hours (180 mins)
        const threeHoursBefore = deadlineMs - 3 * 60 * 60 * 1000;
        if (threeHoursBefore > now + 10000 && threeHoursBefore <= maxFutureTime) {
          const course = courses.find((c) => c.id === t.courseId);
          notificationsToSchedule.push({
            id: toNotificationId(`task_3h_${t.id}`),
            title: `⚠️ Deadline Tugas Mendekat: ${t.title}`,
            body: `Tersisa 3 jam lagi! ${course ? `[${course.name}]` : ''}`,
            channelId: CHANNEL_ID,
            schedule: {
              at: new Date(threeHoursBefore),
              allowWhileIdle: true,
            },
          });
        }
      }
    }

    // 3. Schedule Daily Morning Briefing (07:00 AM)
    if (settings.dailyBriefing !== false) {
      const [briefHour, briefMin] = (settings.dailyBriefingTime || '07:00')
        .split(':')
        .map((n) => Number(n) || 0);

      notificationsToSchedule.push({
        id: toNotificationId('daily_morning_briefing'),
        title: '🌅 Rencana Kuliah & Tugas Hari Ini',
        body: 'Buka KuliahPlanner untuk melihat jadwal kelas dan deadline tugas hari ini.',
        channelId: CHANNEL_ID,
        schedule: {
          on: { hour: briefHour, minute: briefMin },
          allowWhileIdle: true,
        },
      });
    }

    // Cap notifications at 60 to avoid OS limits
    const finalBatch = notificationsToSchedule.slice(0, 60);

    if (finalBatch.length > 0) {
      await LocalNotifications.schedule({ notifications: finalBatch });
    }
  } catch (err) {
    console.warn('Error scheduling local notifications:', err);
  }
};
