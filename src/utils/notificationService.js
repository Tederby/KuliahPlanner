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
 * Format a Date object as YYYY-MM-DD string.
 */
const toDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const BRIEF_DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BRIEF_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/**
 * Build smart briefing content for a specific date.
 * Returns { title, body, largeBody, summaryText } for an expandable notification.
 *
 * @param {string} dateStr - Target date in YYYY-MM-DD format
 * @param {Array} calendarEvents - All calendar event instances
 * @param {Array} tasks - All tasks (raw, not calendar events)
 * @param {Array} courses - All courses
 */
const buildBriefingContent = (dateStr, calendarEvents, tasks, courses) => {
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayName = BRIEF_DAY_NAMES[dateObj.getDay()];
  const dateLabel = `${dayName}, ${dateObj.getDate()} ${BRIEF_MONTH_NAMES[dateObj.getMonth()]}`;

  // ── Collect classes for this day ──────────────────────────────────
  const dayClasses = calendarEvents
    .filter((ev) => ev.type === 'course' && ev.date === dateStr && ev.startTime)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // ── Collect upcoming deadlines within 7 days from this date ──────
  const targetMs = dateObj.getTime();
  const weekLaterMs = targetMs + 7 * 24 * 60 * 60 * 1000;

  const upcomingTasks = tasks
    .filter((t) => !t.completed && t.deadline)
    .map((t) => {
      const dlDate = new Date(t.deadline);
      const dlMs = dlDate.getTime();
      if (isNaN(dlMs)) return null;
      // Calculate day difference from the briefing date (midnight)
      const diffDays = Math.ceil((dlMs - targetMs) / (24 * 60 * 60 * 1000));
      return { ...t, dlMs, diffDays };
    })
    .filter((t) => t && t.dlMs >= targetMs && t.dlMs <= weekLaterMs)
    .sort((a, b) => a.dlMs - b.dlMs);

  // ── Build class section ──────────────────────────────────────────
  let classSection = '';
  if (dayClasses.length > 0) {
    const classLines = dayClasses.map((c) => {
      const room = c.location || '';
      const roomText = room ? ` (${room})` : '';
      return `• ${c.startTime} — ${c.name}${roomText}`;
    });
    classSection = `📚 ${dayClasses.length} Kelas Hari Ini:\n${classLines.join('\n')}`;
  } else {
    classSection = '☕ Tidak ada kelas hari ini.';
  }

  // ── Build deadline section ───────────────────────────────────────
  let deadlineSection = '';
  if (upcomingTasks.length > 0) {
    const maxShow = 5;
    const deadlineLines = upcomingTasks.slice(0, maxShow).map((t) => {
      const course = t.courseId ? courses.find((c) => c.id === t.courseId) : null;
      const courseLabel = course ? ` [${course.name}]` : '';
      let timeLabel = '';
      if (t.diffDays <= 0) {
        const timePart = t.deadline.split('T')[1] || '';
        timeLabel = `HARI INI${timePart ? ` ${timePart}` : ''} ⏰`;
      } else if (t.diffDays === 1) {
        const timePart = t.deadline.split('T')[1] || '';
        timeLabel = `BESOK${timePart && timePart !== '23:59' ? ` ${timePart}` : ''}`;
      } else {
        timeLabel = `${t.diffDays} hari lagi`;
      }
      return `• ${t.title}${courseLabel} — ${timeLabel}`;
    });
    deadlineSection = `⚠️ Deadline Terdekat:\n${deadlineLines.join('\n')}`;
    if (upcomingTasks.length > maxShow) {
      deadlineSection += `\n  ...dan ${upcomingTasks.length - maxShow} tugas lainnya`;
    }
  }

  // ── Assemble notification fields ─────────────────────────────────
  const hasClasses = dayClasses.length > 0;

  const title = hasClasses
    ? `🌅 ${dateLabel} — ${dayClasses.length} Kelas Hari Ini`
    : `🌅 ${dateLabel} — Hari Bebas!`;

  // Short body (collapsed notification — 1 line summary)
  const bodyParts = [];
  if (hasClasses) {
    const lastEnd = dayClasses[dayClasses.length - 1].endTime || '';
    bodyParts.push(`${dayClasses.length} kelas (${dayClasses[0].startTime}${lastEnd ? `–${lastEnd}` : ''})`);
  }
  if (upcomingTasks.length > 0) {
    bodyParts.push(`${upcomingTasks.length} deadline minggu ini`);
  }
  const body = bodyParts.join(' · ') || 'Tidak ada jadwal & deadline minggu ini ✓';

  // Large body (expanded notification — BigTextStyle on Android)
  const sections = [classSection];
  if (deadlineSection) sections.push(deadlineSection);
  const largeBody = sections.join('\n\n');

  // Summary text (footer)
  const summaryText = upcomingTasks.length > 0
    ? `📊 ${upcomingTasks.length} tugas aktif minggu ini`
    : 'Tidak ada deadline minggu ini ✓';

  return { title, body, largeBody, summaryText };
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

    // 3. Schedule Smart Daily Briefings (7 days ahead, per-day with dynamic content)
    if (settings.dailyBriefing !== false) {
      const [briefHour, briefMin] = (settings.dailyBriefingTime || '07:00')
        .split(':')
        .map((n) => Number(n) || 0);

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const briefDate = new Date();
        briefDate.setDate(briefDate.getDate() + dayOffset);
        const briefDateStr = toDateStr(briefDate);

        const briefTime = new Date(
          briefDate.getFullYear(), briefDate.getMonth(), briefDate.getDate(),
          briefHour, briefMin, 0, 0
        );

        // Only schedule if the notification time is in the future
        if (briefTime.getTime() > now + 10000) {
          const content = buildBriefingContent(briefDateStr, calendarEvents, tasks, courses);

          notificationsToSchedule.push({
            id: toNotificationId(`daily_briefing_${briefDateStr}`),
            title: content.title,
            body: content.body,
            largeBody: content.largeBody,
            summaryText: content.summaryText,
            channelId: CHANNEL_ID,
            schedule: {
              at: briefTime,
              allowWhileIdle: true,
            },
          });
        }
      }
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
