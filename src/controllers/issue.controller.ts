import { Request, Response } from 'express';
import { issueService } from '../services/issue.service';
import { projectService } from '../services/project.service';

export const getAllIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const issues = await issueService.getAllIssues();
    if (!issues || issues.length === 0) {
      res.status(404).json({ message: 'No issues found' });
      return;
    }
    let result = await Promise.all(issues.map(async (issue) => {
      const projectDetails = await projectService.getProjectById(issue.projectId);
      return {
        ...issue,
        project: projectDetails.name,
      };
    }));

    const total = result.length;
    result = result.slice(offset, offset + limit);

    res.json({
      data: result,
      count: total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
