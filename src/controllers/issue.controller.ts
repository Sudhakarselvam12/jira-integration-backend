import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { issueService } from '../services/issue.service';
import { projectService } from '../services/project.service';
import { syncMetadataService } from '../services/sync-metadata.service';
import { formatDate } from '../common/helper';

export const getIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jiraId, title, project, type, status, priority, reporter } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const issues = await issueService.getIssues({
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
};

export const getIssuesCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await issueService.getIssuesCount();

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getIssuesForExport = async (req: Request, res: Response): Promise<void> => {
  try {
    const issues = await issueService.getAllIssues();
    if (!issues || issues.length === 0) {
      res.status(404).json({ message: 'No issues found' });
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Issues');

    worksheet.columns = [
      { header: 'Jira ID', key: 'jiraId', width: 15 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Priority', key: 'priority', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Project', key: 'project', width: 20 },
      { header :'Assignee', key: 'assignee', width: 20 },
      { header: 'Reporter', key: 'reporter', width: 20 },
      { header: 'Estimated Time', key: 'estimatedTime', width: 15 },
      { header: 'Time Spent', key: 'timeSpent', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 },
    ];

    issues.forEach((issue) => {
      worksheet.addRow({
        jiraId: issue.jiraId,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        priority: issue.priority,
        status: issue.status,
        project: issue.project.name || '-',
        assignee: issue.assignee || '-',
        reporter: issue.reporter || '-',
        estimatedTime: issue.estimatedTime || 0,
        timeSpent: issue.spentTime || 0,
        createdAt: formatDate(issue.createdAt.toISOString()),
        updatedAt: formatDate(issue.updatedAt.toISOString()),
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=issues.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }
  catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
