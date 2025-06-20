import 'reflect-metadata';
import { DataSource } from 'typeorm';
// import { Project } from './models/Project';
// import { Issue } from './models/Issue';
// import { IssueHistory } from './models/IssueHistory';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'jira_tool',
  synchronize: false,
  migrations: ['src/migrations/*.ts'],
  logging: true,
  // entities: [Project, Issue, IssueHistory],
});