/**
 * Utility functions and color palette for course color coding and scheduling checks.
 */

export const COURSE_COLOR_PALETTE = [
  { id: 'indigo', name: 'Indigo', hex: '#6366f1' },
  { id: 'emerald', name: 'Emerald', hex: '#10b981' },
  { id: 'amber', name: 'Amber', hex: '#f59e0b' },
  { id: 'rose', name: 'Rose', hex: '#f43f5e' },
  { id: 'sky', name: 'Sky Blue', hex: '#0284c7' },
  { id: 'purple', name: 'Purple', hex: '#9333ea' },
  { id: 'teal', name: 'Teal', hex: '#0d9488' },
  { id: 'orange', name: 'Orange', hex: '#ea580c' },
];

/**
 * Returns the color hex for a given course.
 * If the course has no explicit color, picks a deterministic color from the palette.
 */
export const getCourseColor = (course, fallbackIndex = 0) => {
  if (course?.color) return course.color;
  const seed = typeof course?.id === 'number' ? Math.abs(course.id) : fallbackIndex;
  return COURSE_COLOR_PALETTE[seed % COURSE_COLOR_PALETTE.length].hex;
};

/**
 * Automatically chooses the next best color for a new course:
 * prioritizes colors from the palette not yet used, or rotates sequentially.
 */
export const getNextAvailableColor = (existingCourses = []) => {
  const usedColors = new Set(existingCourses.map((c) => c.color).filter(Boolean));
  const unused = COURSE_COLOR_PALETTE.find((item) => !usedColors.has(item.hex));
  if (unused) return unused.hex;
  return COURSE_COLOR_PALETTE[existingCourses.length % COURSE_COLOR_PALETTE.length].hex;
};

/**
 * Calculates end time string (HH:mm) given start time, SKS, and minutes per SKS.
 */
export const calculateCourseEndTime = (startTime, sks, sksMinutes = 50) => {
  if (!startTime) return '';
  const [hours, minutes] = startTime.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return '';
  const totalMinutes = hours * 60 + minutes + (Number(sks) || 0) * (Number(sksMinutes) || 50);
  const endHours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const endMins = (totalMinutes % 60).toString().padStart(2, '0');
  return `${endHours}:${endMins}`;
};

/**
 * Checks whether a candidate course time overlaps with any existing course on the same day.
 * Returns { hasClash: boolean, clashingCourse: object | null }
 */
export const checkCourseClash = (candidate, existingCourses = [], excludeCourseId = null, sksMinutes = 50) => {
  if (!candidate?.day || !candidate?.startTime || !candidate?.sks) {
    return { hasClash: false, clashingCourse: null };
  }

  const [candH, candM] = candidate.startTime.split(':').map(Number);
  if (isNaN(candH) || isNaN(candM)) return { hasClash: false, clashingCourse: null };

  const candStart = candH * 60 + candM;
  const candEnd = candStart + Number(candidate.sks) * Number(sksMinutes);

  for (const course of existingCourses) {
    if (excludeCourseId && course.id === excludeCourseId) continue;
    if (course.day !== candidate.day) continue;
    if (!course.startTime || !course.sks) continue;

    const [cH, cM] = course.startTime.split(':').map(Number);
    if (isNaN(cH) || isNaN(cM)) continue;

    const cStart = cH * 60 + cM;
    const cEnd = cStart + Number(course.sks) * Number(sksMinutes);

    // Overlap condition: start A < end B AND end A > start B
    if (candStart < cEnd && candEnd > cStart) {
      return { hasClash: true, clashingCourse: course };
    }
  }

  return { hasClash: false, clashingCourse: null };
};
