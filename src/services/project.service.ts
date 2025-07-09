import { AppDataSource } from '../db-config';
import { Project } from '../models/Project';

const projectRepo = AppDataSource.getRepository(Project);

export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    const result = await projectRepo.find();
    return result;
  },
};
