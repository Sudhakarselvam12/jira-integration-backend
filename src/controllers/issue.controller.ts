import { Request, Response } from 'express';
import { projectService } from '../services/issue.service';

export const getAllIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    const issues = await projectService.getAllIssues();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });  
  }
};
