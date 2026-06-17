import { repositories } from '../repositories';
import { PasswordUtil } from '../utils/password.util';
import { ApiError } from '../utils/api-error.util';
import { createChildLogger } from '../config/logger.config';
import type { CreateTeacherInput, UpdateTeacherInput } from '../schemas/teacher.schema';
import type { PaginationQuery } from '../utils/pagination.util';

const logger = createChildLogger('TeacherService');

export class TeacherService {
  async create(input: CreateTeacherInput) {
    const existing = await repositories.teacher.findOne({ employeeId: input.employeeId });
    if (existing) {
      throw ApiError.conflict('Teacher with this employee ID already exists');
    }

    const teacher = await repositories.teacher.create(input);
    logger.info({ teacherId: teacher.id, employeeId: teacher.employeeId }, 'Teacher created');
    return teacher;
  }

  async findAll(query: PaginationQuery & { department?: string; designation?: string }) {
    const filters: Record<string, unknown> = {};
    if (query.department) filters.department = query.department;
    if (query.designation) filters.designation = query.designation;

    return repositories.teacher.findAll({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder,
      filters,
    });
  }

  async findById(id: string) {
    const teacher = await repositories.teacher.findById(id);
    if (!teacher) {
      throw ApiError.notFound('Teacher not found');
    }
    return teacher;
  }

  async update(id: string, input: UpdateTeacherInput) {
    const teacher = await repositories.teacher.findById(id);
    if (!teacher) {
      throw ApiError.notFound('Teacher not found');
    }

    const updated = await repositories.teacher.update(id, input);
    logger.info({ teacherId: id }, 'Teacher updated');
    return updated;
  }

  async delete(id: string) {
    const teacher = await repositories.teacher.findById(id);
    if (!teacher) {
      throw ApiError.notFound('Teacher not found');
    }

    await repositories.teacher.delete(id);
    logger.info({ teacherId: id }, 'Teacher deleted');
    return { message: 'Teacher deleted successfully' };
  }
}

export const teacherService = new TeacherService();