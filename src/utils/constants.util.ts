export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
  HALF_DAY: 'half_day',
} as const;

export const FEE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  PARTIAL: 'partial',
  WAIVED: 'waived',
} as const;

export const EXAM_TYPES = {
  MIDTERM: 'midterm',
  FINAL: 'final',
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  PROJECT: 'project',
  PRACTICAL: 'practical',
  UNIT_TEST: 'unit_test',
} as const;

export const ACADEMIC_TERMS = {
  TERM_1: 'term_1',
  TERM_2: 'term_2',
  TERM_3: 'term_3',
  ANNUAL: 'annual',
} as const;

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes
export const PASSWORD_RESET_EXPIRY_HOURS = 1;
export const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;