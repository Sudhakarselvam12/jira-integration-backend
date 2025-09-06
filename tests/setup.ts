import { AppDataSource } from '../src/db-config';

beforeAll(async () => {
  if(!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
  }
});

afterAll(async () => {
  if(AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});