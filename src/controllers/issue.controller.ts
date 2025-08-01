import { Request, Response } from 'express';
import { issueService } from '../services/issue.service';
import { projectService } from '../services/project.service';
import { syncMetadataService } from '../services/sync-metadata.service';

export const getAllIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jiraId, title, project, type, status, priority, reporter } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const issues = await issueService.getAllIssues({
      jiraId: jiraId as string || '',
      title: title as string || '',
      project: project as string || '',
      types: type as string || '',
      status: status as string || '',
      priority: priority as string || '',
      reporter: reporter as string || '',
    });
    if (!issues || issues.length === 0) {
      res.json({});
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

    const lastSyncedAt = await syncMetadataService.getLastSync('issue');

    res.json({
      data: result,
      count: total,
      lastSyncedAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getFilterValues = async (req: Request, res: Response): Promise<void> => {
  try {
    const filterValues = await issueService.getFilterValues();

    res.json(filterValues);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
    return;
  }
}

export const getIssuesCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await issueService.getIssuesCount();

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
