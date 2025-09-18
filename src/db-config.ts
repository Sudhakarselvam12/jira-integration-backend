import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Project } from './models/Project';
import { Issue } from './models/Issue';
import { AuditTrail } from './models/AuditTrail';
import { SyncMetadata } from './models/SyncMetadata';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

dotenv.config({path: envFile});

const isCompiled = __dirname.includes('dist');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'jira_tool',
  synchronize: false,
  migrations: [isCompiled ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
  logging: true,
  entities: [Project, Issue, AuditTrail, SyncMetadata],
});