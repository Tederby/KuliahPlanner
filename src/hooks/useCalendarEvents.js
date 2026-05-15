import { useMemo } from 'react';
import { getDayIndex, addDays, formatDateStr } from '../utils/dateUtils';

const calculateEndTime = (start, sks, sksMinutes) => {
  if (!start) return '';
  const [hours, minutes] = start.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + sks * sksMinutes;
  const endHours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const endMins = (totalMinutes % 60).toString().padStart(2, '0');
  return `${endHours}:${endMins}`;
};

export const useCalendarEvents = ({ courses, config, stashes, reschedules, tasks }) => {
  const generatedInstances = useMemo(() => {
    try {
      if (courses.length === 0) return [];

      const instances = [];
      const semesterStartDate = new Date(config.semesterStart);
      const semesterStartDayIndex =
        semesterStartDate.getDay() === 0 ? 6 : semesterStartDate.getDay() - 1;

      courses.forEach((course) => {
        const courseDayIndex = getDayIndex(course.day);
        let daysUntilFirstClass = courseDayIndex - semesterStartDayIndex;
        if (daysUntilFirstClass < 0) daysUntilFirstClass += 7;

        let runningDate = addDays(config.semesterStart, daysUntilFirstClass);
        let meetingCount = 1;
        let weekCounter = 1;

        while (meetingCount <= config.totalMeetings) {
          const isStashed = stashes.some(
            (s) => s.courseId === course.id && s.originalDate === runningDate
          );
          const isRescheduledOriginal = reschedules.some(
            (r) =>
              r.courseId === course.id &&
              (r.originalDate === runningDate || r.newDate === runningDate)
          );

          if (!isStashed && !isRescheduledOriginal) {
            const endTime = calculateEndTime(course.startTime, course.sks, config.sksMinutes);
            instances.push({
              instanceId: `${course.id}-${runningDate}`,
              type: 'course',
              ...course,
              date: runningDate,
              endTime,
              meetingNum: meetingCount,
              weekNum: weekCounter,
            });
          }

          meetingCount++;

          if (meetingCount - 1 === config.meetingsBeforeUTS) {
            for (let i = 0; i < config.utsWeeks; i++) {
              runningDate = addDays(runningDate, 7);
              weekCounter++;
            }
          }
          if (meetingCount - 1 === config.meetingsBeforeUAS) {
            for (let i = 0; i < config.uasWeeks; i++) {
              runningDate = addDays(runningDate, 7);
              weekCounter++;
            }
          }

          runningDate = addDays(runningDate, 7);
          weekCounter++;
        }
      });

      return instances;
    } catch (e) {
      console.error('Error generating instances:', e);
      return [];
    }
  }, [courses, config, stashes]);

  const rescheduledInstances = useMemo(() => {
    return reschedules
      .map((rs) => {
        const course = courses.find((c) => c.id === rs.courseId);
        if (!course) return null;
        return {
          instanceId: `resched-${rs.id}`,
          type: 'course',
          ...course,
          date: rs.newDate,
          startTime: rs.newTime,
          endTime: calculateEndTime(rs.newTime, course.sks, config.sksMinutes),
          meetingNum: rs.meetingNum ?? '?',
          weekNum: rs.weekNum ?? '?',
          isRescheduled: true,
          originalDate: rs.originalDate,
          rescheduleId: rs.id,
        };
      })
      .filter(Boolean);
  }, [reschedules, courses, config.sksMinutes]);

  const allCalendarEvents = useMemo(() => {
    const taskEvents = tasks
      .filter((t) => !t.completed)
      .map((t) => {
        const datePart = t.deadline.split('T')[0];
        const timePart = t.deadline.split('T')[1] || '23:59';
        return {
          instanceId: `task-${t.id}`,
          type: 'task',
          title: t.title,
          date: datePart,
          startTime: timePart,
          urgency: t.urgency,
          rawTask: t,
        };
      });
    return [...generatedInstances, ...rescheduledInstances, ...taskEvents];
  }, [generatedInstances, rescheduledInstances, tasks]);

  return { allCalendarEvents, generatedInstances, rescheduledInstances };
};
