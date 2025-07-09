import { Request, Response } from 'express';
import { projectService } from '../services/project.service';

export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await projectService.getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
