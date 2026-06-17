import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from './env.config';
import { createChildLogger } from './logger.config';
import * as schema from '../models';

const logger = createChildLogger('database');

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected database pool error');
});

export const db = drizzle(pool, {
  schema,
  logger: env.NODE_ENV === 'development',
});

export type Database = typeof db;

export const getDb = (): Database => db;