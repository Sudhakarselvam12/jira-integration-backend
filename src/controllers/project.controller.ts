import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { projectService } from '../services/project.service';
import { syncMetadataService } from '../services/sync-metadata.service';
import { formatDate } from '../common/helper';

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

export const getProjectsForExport = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await projectService.getAllProjects();
    if (!projects || projects.length === 0) {
      res.status(404).json({ message: 'No projects found' });
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Projects');

    worksheet.columns = [
      { header: 'Jira ID', key: 'jiraId', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Key', key: 'jiraProjectKey', width: 15 },
      { header: 'Lead', key: 'lead', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    projects.forEach((project) => {
      worksheet.addRow({
        id: project.id,
        jiraId: project.jiraId,
        name: project.name,
        jiraProjectKey: project.jiraProjectKey,
        lead: project.lead,
        status: project.status,
        createdAt: formatDate(project.createdAt.toISOString()),
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

export const getProjectsCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await projectService.getProjectsCount();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
