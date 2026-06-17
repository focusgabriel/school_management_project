import { UserRepository } from './user.repository';
import { StudentRepository } from './student.repository';
import { TeacherRepository } from './teacher.repository';
import { ClassRepository } from './class.repository';
import { SubjectRepository } from './subject.repository';
import { EnrollmentRepository } from './enrollment.repository';
import { AttendanceRepository } from './attendance.repository';
import { ExamRepository } from './exam.repository';
import { GradeRepository } from './grade.repository';
import { FeeRepository } from './fee.repository';
import { TimetableRepository } from './timetable.repository';
import { AnnouncementRepository } from './announcement.repository';
import { AuditLogRepository } from './audit-log.repository';

export const repositories = {
  user: new UserRepository(),
  student: new StudentRepository(),
  teacher: new TeacherRepository(),
  class: new ClassRepository(),
  subject: new SubjectRepository(),
  enrollment: new EnrollmentRepository(),
  attendance: new AttendanceRepository(),
  exam: new ExamRepository(),
  grade: new GradeRepository(),
  fee: new FeeRepository(),
  timetable: new TimetableRepository(),
  announcement: new AnnouncementRepository(),
  auditLog: new AuditLogRepository(),
};

export type Repositories = typeof repositories;

export {
  UserRepository,
  StudentRepository,
  TeacherRepository,
  ClassRepository,
  SubjectRepository,
  EnrollmentRepository,
  AttendanceRepository,
  ExamRepository,
  GradeRepository,
  FeeRepository,
  TimetableRepository,
  AnnouncementRepository,
  AuditLogRepository,
};