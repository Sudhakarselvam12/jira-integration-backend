import { AppDataSource } from '../db-config';
import { Issue } from '../models/Issue';

const projectRepo = AppDataSource.getRepository(Issue);

export const projectService = {
  async getAllIssues(): Promise<Issue[]> {
    return projectRepo.find();
  },
};
