export const validateCourse = (course) => {
  if (!course.name?.trim()) return 'Nama matkul wajib diisi';
  if (course.sks < 1 || course.sks > 6) return 'SKS harus antara 1-6';
  if (!course.startTime) return 'Jam mulai wajib diisi';
  if (!course.day) return 'Hari wajib dipilih';
  return null;
};

export const validateTask = (task) => {
  if (!task.title?.trim()) {
    return task.type === 'event' ? 'Nama acara wajib diisi' : 'Judul tugas wajib diisi';
  }
  if (!task.deadlineDate) {
    return task.type === 'event' ? 'Tanggal acara wajib diisi' : 'Tanggal deadline wajib diisi';
  }
  if (task.type !== 'event' && !task.courseId) {
    return 'Pilih matkul untuk tugas ini';
  }
  return null;
};

export const validateConfig = (config) => {
  if (!config.semesterStart) return 'Tanggal mulai semester wajib';

  // Convert to numbers with fallback, treat null/undefined/empty as invalid
  const sksMinutes = Number(config.sksMinutes);
  const totalMeetings = Number(config.totalMeetings);
  const meetingsBeforeUTS = Number(config.meetingsBeforeUTS);
  const utsWeeks = Number(config.utsWeeks);
  const meetingsBeforeUAS = Number(config.meetingsBeforeUAS);
  const uasWeeks = Number(config.uasWeeks);

  // Individual field range validation
  if (isNaN(sksMinutes) || sksMinutes < 30) return 'Durasi 1 SKS minimal 30 menit';
  if (isNaN(totalMeetings) || totalMeetings < 1) return 'Target pertemuan minimal 1';
  if (isNaN(meetingsBeforeUTS) || meetingsBeforeUTS < 1) return 'Pertemuan sebelum UTS minimal 1';
  if (isNaN(utsWeeks) || utsWeeks < 1) return 'Minggu UTS minimal 1';
  if (isNaN(meetingsBeforeUAS) || meetingsBeforeUAS < 1) return 'Pertemuan sebelum UAS minimal 1';
  if (isNaN(uasWeeks) || uasWeeks < 1) return 'Minggu UAS minimal 1';

  // Cross-field validation
  if (meetingsBeforeUTS >= meetingsBeforeUAS) {
    return `Pertemuan sebelum UTS (${meetingsBeforeUTS}) harus lebih kecil dari pertemuan sebelum UAS (${meetingsBeforeUAS})`;
  }
  if (meetingsBeforeUAS > totalMeetings) {
    return `Pertemuan sebelum UAS (${meetingsBeforeUAS}) tidak boleh melebihi target pertemuan total (${totalMeetings})`;
  }

  return null;
};
