import { Request, Response } from 'express';
import { projectService } from '../services/project.service';
import { syncMetadataService } from '../services/sync-metadata.service';

export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    let projects = await projectService.getAllProjects();
    if (!projects || projects.length === 0) {
      res.status(404).json({ message: 'No issues found' });
      return;
    }

    const total = projects.length;
    projects = projects.slice(offset, offset + limit);

    const lastSyncedAt = await syncMetadataService.getLastSync('project');

    res.json({
      data: projects,
      count: total,
      lastSyncedAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getProjectsCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await projectService.getProjectsCount();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
