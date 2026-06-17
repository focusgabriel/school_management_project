import { repositories } from '../repositories';
import { ApiError } from '../utils/api-error.util';
import { createChildLogger } from '../config/logger.config';
import type { CreateClassInput, UpdateClassInput } from '../schemas/class.schema';
import type { PaginationQuery } from '../utils/pagination.util';

const logger = createChildLogger('ClassService');

export class ClassService {
  async create(input: CreateClassInput) {
    const existing = await repositories.class.findOne({ code: input.code });
    if (existing) {
      throw ApiError.conflict('Class with this code already exists');
    }

    const cls = await repositories.class.create(input);
    logger.info({ classId: cls.id, code: cls.code }, 'Class created');
    return cls;
  }

  async findAll(query: PaginationQuery & { academicYear?: string; status?: string }) {
    const filters: Record<string, unknown> = {};
    if (query.academicYear) filters.academicYear = query.academicYear;
    if (query.status) filters.status = query.status;

    return repositories.class.findAll({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy || 'name',
      sortOrder: query.sortOrder,
      filters,
    });
  }

  async findById(id: string) {
    const cls = await repositories.class.findById(id);
    if (!cls) {
      throw ApiError.notFound('Class not found');
    }
    return cls;
  }

  async update(id: string, input: UpdateClassInput) {
    const cls = await repositories.class.findById(id);
    if (!cls) {
      throw ApiError.notFound('Class not found');
    }

    const updated = await repositories.class.update(id, input);
    logger.info({ classId: id }, 'Class updated');
    return updated;
  }

  async delete(id: string) {
    const cls = await repositories.class.findById(id);
    if (!cls) {
      throw ApiError.notFound('Class not found');
    }

    await repositories.class.delete(id);
    logger.info({ classId: id }, 'Class deleted');
    return { message: 'Class deleted successfully' };
  }
}

export const classService = new ClassService();