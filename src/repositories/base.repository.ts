import { eq, and, desc, asc, sql, SQL, count, PgTable, PgColumn } from 'drizzle-orm';
import { db, Database } from '../config/database.config';
import { createChildLogger } from '../config/logger.config';

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export abstract class BaseRepository<T extends PgTable> {
  protected logger = createChildLogger(this.constructor.name);
  protected db: Database;

  constructor(protected table: T) {
    this.db = db;
  }

  protected buildWhereClause(filters: Record<string, unknown>): SQL | undefined {
    const conditions: SQL[] = [];
    
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        const column = (this.table as Record<string, PgColumn>)[key];
        if (column) {
          conditions.push(eq(column, value as string));
        }
      }
    }
    
    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  protected buildOrderBy(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): SQL | undefined {
    if (!sortBy) return undefined;
    
    const column = (this.table as Record<string, PgColumn>)[sortBy];
    if (!column) return undefined;
    
    return sortOrder === 'asc' ? asc(column) : desc(column);
  }

  async findAll(options?: PaginationOptions & { filters?: Record<string, unknown> }) {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const offset = (page - 1) * limit;
      
      const where = options?.filters ? this.buildWhereClause(options.filters) : undefined;
      const orderBy = this.buildOrderBy(options?.sortBy, options?.sortOrder);

      const [items, totalResult] = await Promise.all([
        this.db
          .select()
          .from(this.table)
          .where(where)
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset),
        this.db
          .select({ count: count() })
          .from(this.table)
          .where(where),
      ]);

      return {
        items,
        total: totalResult[0]?.count || 0,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error({ error }, 'Error in findAll');
      throw error;
    }
  }

  async findById(id: string) {
    try {
      const idColumn = (this.table as Record<string, PgColumn>)['id'];
      const result = await this.db
        .select()
        .from(this.table)
        .where(eq(idColumn, id))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      this.logger.error({ error, id }, 'Error in findById');
      throw error;
    }
  }

  async findOne(filters: Record<string, unknown>) {
    try {
      const where = this.buildWhereClause(filters);
      const result = await this.db
        .select()
        .from(this.table)
        .where(where)
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      this.logger.error({ error, filters }, 'Error in findOne');
      throw error;
    }
  }

  async create(data: Record<string, unknown>) {
    try {
      const result = await this.db
        .insert(this.table)
        .values(data as any)
        .returning();
      
      this.logger.debug({ id: result[0]?.id }, 'Record created');
      return result[0];
    } catch (error) {
      this.logger.error({ error, data }, 'Error in create');
      throw error;
    }
  }

  async update(id: string, data: Record<string, unknown>) {
    try {
      const idColumn = (this.table as Record<string, PgColumn>)['id'];
      const result = await this.db
        .update(this.table)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(idColumn, id))
        .returning();
      
      this.logger.debug({ id }, 'Record updated');
      return result[0] || null;
    } catch (error) {
      this.logger.error({ error, id, data }, 'Error in update');
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const idColumn = (this.table as Record<string, PgColumn>)['id'];
      const result = await this.db
        .delete(this.table)
        .where(eq(idColumn, id))
        .returning();
      
      this.logger.debug({ id }, 'Record deleted');
      return result[0] || null;
    } catch (error) {
      this.logger.error({ error, id }, 'Error in delete');
      throw error;
    }
  }

  async exists(filters: Record<string, unknown>): Promise<boolean> {
    const result = await this.findOne(filters);
    return result !== null;
  }

  async count(filters?: Record<string, unknown>): Promise<number> {
    const where = filters ? this.buildWhereClause(filters) : undefined;
    const result = await this.db
      .select({ count: count() })
      .from(this.table)
      .where(where);
    
    return result[0]?.count || 0;
  }
}