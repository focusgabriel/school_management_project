import { repositories } from '../repositories';
import { emailService } from './email.service';
import { PasswordUtil } from '../utils/password.util';
import { ApiError } from '../utils/api-error.util';
import { createChildLogger } from '../config/logger.config';
import type { CreateStudentInput, UpdateStudentInput } from '../schemas/student.schema';
import type { PaginationQuery } from '../utils/pagination.util';

const logger = createChildLogger('StudentService');

export class StudentService {
  async create(input: CreateStudentInput, createAccount = true) {
    const existingStudent = await repositories.student.findByAdmissionNumber(input.admissionNumber);
    if (existingStudent) {
      throw ApiError.conflict('Student with this admission number already exists');
    }

    let userId = input.userId;

    if (createAccount && !input.userId) {
      const user = await repositories.user.findOne({
        email: `${input.admissionNumber.toLowerCase()}@student.school.edu`,
      });

      if (!user) {
        const tempPassword = PasswordUtil.generateRandomPassword();
        const hashedPassword = await PasswordUtil.hash(tempPassword);
        const newUser = await repositories.user.create({
          email: `${input.admissionNumber.toLowerCase()}@student.school.edu`,
          password: hashedPassword,
          firstName: 'Student',
          lastName: input.admissionNumber,
          role: 'student',
          status: 'active',
        });
        userId = newUser.id;
      } else {
        userId = user.id;
      }
    }

    const student = await repositories.student.create({
      ...input,
      userId,
    });

    logger.info({ studentId: student.id, admissionNumber: student.admissionNumber }, 'Student created');

    return student;
  }

  async findAll(query: PaginationQuery & { classId?: string; status?: string }) {
    const filters: Record<string, unknown> = {};
    if (query.classId) filters.currentClassId = query.classId;
    if (query.status) filters.status = query.status;

    return repositories.student.findAll({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder,
      filters,
    });
  }

  async findById(id: string) {
    const student = await repositories.student.findByIdWithUser(id);
    if (!student) {
      throw ApiError.notFound('Student not found');
    }
    return student;
  }

  async findByUserId(userId: string) {
    const student = await repositories.student.findByUserId(userId);
    if (!student) {
      throw ApiError.notFound('Student not found');
    }
    return student;
  }

  async update(id: string, input: UpdateStudentInput) {
    const student = await repositories.student.findById(id);
    if (!student) {
      throw ApiError.notFound('Student not found');
    }

    const updated = await repositories.student.update(id, input);
    logger.info({ studentId: id }, 'Student updated');
    return updated;
  }

  async delete(id: string) {
    const student = await repositories.student.findById(id);
    if (!student) {
      throw ApiError.notFound('Student not found');
    }

    await repositories.student.delete(id);
    logger.info({ studentId: id }, 'Student deleted');
    return { message: 'Student deleted successfully' };
  }

  async findByClass(classId: string, page = 1, limit = 50) {
    return repositories.student.findByClassId(classId, page, limit);
  }

  async getStatistics() {
    return repositories.student.getStatistics();
  }
}

export const studentService = new StudentService();