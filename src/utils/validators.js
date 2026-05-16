export const validateCourse = (course) => {
  if (!course.name?.trim()) return 'Nama matkul wajib diisi';
  if (course.sks < 1 || course.sks > 6) return 'SKS harus antara 1-6';
  if (!course.startTime) return 'Jam mulai wajib diisi';
  if (!course.day) return 'Hari wajib dipilih';
  return null;
};

export const validateTask = (task) => {
  if (!task.title?.trim()) return 'Judul tugas wajib diisi';
  if (!task.deadlineDate) return 'Tanggal deadline wajib diisi';
  if (!task.courseId) return 'Pilih matkul untuk tugas ini';
  return null;
};

export const validateConfig = (config) => {
  if (!config.semesterStart) return 'Tanggal mulai semester wajib';
  if (config.sksMinutes !== null && config.sksMinutes !== undefined && config.sksMinutes < 30) return 'SKS minutes minimal 30 menit';
  if (config.totalMeetings !== null && config.totalMeetings !== undefined && config.totalMeetings < 1) return 'Total pertemuan minimal 1';
  if (config.meetingsBeforeUTS !== null && config.meetingsBeforeUTS !== undefined && config.meetingsBeforeUTS < 1) return 'Pertemuan sebelum UTS minimal 1';
  if (config.utsWeeks !== null && config.utsWeeks !== undefined && config.utsWeeks < 1) return 'Minggu UTS minimal 1';
  if (config.meetingsBeforeUAS !== null && config.meetingsBeforeUAS !== undefined && config.meetingsBeforeUAS < 1) return 'Pertemuan sebelum UAS minimal 1';
  if (config.uasWeeks !== null && config.uasWeeks !== undefined && config.uasWeeks < 1) return 'Minggu UAS minimal 1';
  return null;
};
