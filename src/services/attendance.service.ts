import { repositories } from '../repositories';
import { ApiError } from '../utils/api-error.util';
import { createChildLogger } from '../config/logger.config';
import { db } from '../config/database.config';
import { attendance } from '../models/attendance.model';
import { eq, and } from 'drizzle-orm';

const logger = createChildLogger('AttendanceService');

interface MarkAttendanceInput {
  studentId: string;
  classId?: string;
  date: string;
  status: string;
  remarks?: string;
  subjectId?: string;
}

export class AttendanceService {
  async markAttendance(data: MarkAttendanceInput, markedBy?: string) {
    const existing = await repositories.attendance.findOne({
      studentId: data.studentId,
      date: new Date(data.date),
    });

    if (existing) {
      const updated = await repositories.attendance.update(existing.id, {
        ...data,
        markedBy,
        updatedAt: new Date(),
      });
      logger.info({ attendanceId: existing.id }, 'Attendance updated');
      return updated;
    }

    const record = await repositories.attendance.create({
      ...data,
      markedBy,
    });

    logger.info({ attendanceId: record.id }, 'Attendance marked');
    return record;
  }

  async markBulkAttendance(records: MarkAttendanceInput[], markedBy?: string) {
    const results = await db.transaction(async (tx) => {
      const created = [];
      for (const record of records) {
        const entry = await tx
          .insert(attendance)
          .values({ ...record, markedBy })
          .returning();
        created.push(entry[0]);
      }
      return created;
    });

    logger.info({ count: results.length, markedBy }, 'Bulk attendance marked');
    return results;
  }

  async getStudentAttendance(studentId: string, startDate?: string, endDate?: string) {
    return repositories.attendance.findAll({
      page: 1,
      limit: 100,
      filters: { studentId },
    });
  }

  async getClassAttendance(classId: string, date: string) {
    return repositories.attendance.findAll({
      page: 1,
      limit: 100,
      filters: { classId },
    });
  }

  async getAttendanceSummary(studentId: string, startDate?: string, endDate?: string) {
    const allRecords = await this.getStudentAttendance(studentId, startDate, endDate);
    const records = allRecords.items as any[];

    const summary = {
      total: records.length,
      present: records.filter((r) => r.status === 'present').length,
      absent: records.filter((r) => r.status === 'absent').length,
      late: records.filter((r) => r.status === 'late').length,
      excused: records.filter((r) => r.status === 'excused').length,
      percentage: records.length > 0
        ? ((records.filter((r) => r.status === 'present').length / records.length) * 100).toFixed(2)
        : '0',
    };

    return summary;
  }
}

export const attendanceService = new AttendanceService();