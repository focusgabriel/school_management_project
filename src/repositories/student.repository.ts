import { eq, and, desc, sql } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { students } from '../models/student.model';
import { users } from '../models/user.model';
import { classes } from '../models/class.model';
import { db } from '../config/database.config';

export class StudentRepository extends BaseRepository<typeof students> {
  constructor() {
    super(students);
  }

  async findByIdWithUser(id: string) {
    const result = await db
      .select({
        student: students,
        user: users,
        class: classes,
      })
      .from(students)
      .leftJoin(users, eq(students.userId, users.id))
      .leftJoin(classes, eq(students.currentClassId, classes.id))
      .where(eq(students.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  async findByUserId(userId: string) {
    const result = await db
      .select()
      .from(students)
      .where(eq(students.userId, userId))
      .limit(1);
    
    return result[0] || null;
  }

  async findByClassId(classId: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    const [items, totalResult] = await Promise.all([
      db
        .select({
          student: students,
          user: users,
        })
        .from(students)
        .leftJoin(users, eq(students.userId, users.id))
        .where(eq(students.currentClassId, classId))
        .orderBy(users.lastName)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(students)
        .where(eq(students.currentClassId, classId)),
    ]);

    return {
      items,
      total: totalResult[0]?.count || 0,
      page,
      limit,
    };
  }

  async findByAdmissionNumber(admissionNumber: string) {
    const result = await db
      .select()
      .from(students)
      .where(eq(students.admissionNumber, admissionNumber))
      .limit(1);
    
    return result[0] || null;
  }

  async getStatistics() {
    const result = await db
      .select({
        totalStudents: sql<number>`count(*)`,
        activeStudents: sql<number>`count(*) filter (where ${students.isActive} = true)`,
      })
      .from(students);
    
    return result[0];
  }
}