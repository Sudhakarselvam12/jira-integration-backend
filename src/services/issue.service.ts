import { AppDataSource } from '../db-config';
import { AuditTrail } from '../models/AuditTrail';
import { Issue } from '../models/Issue';
import { Project } from '../models/Project';
import { JiraIssue } from '../types/jira.types';

const issueRepo = AppDataSource.getRepository(Issue);
const auditRepo = AppDataSource.getRepository(AuditTrail);
const projectRepo = AppDataSource.getRepository(Project);

type IssueFilter = {
  jiraId: string;
  title: string;
  types: string;
  priority: string;
  status: string;
  project: string;
  reporter: string;
};

export const issueService = {
  async getIssuesCount(): Promise<number> {
    return await issueRepo.count();
  },

  async getAllIssues(): Promise<Issue[]> {
    const query = issueRepo
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.project', 'project');
    return query.getMany();
  },

  async getIssues(filters: IssueFilter): Promise<Issue[]> {
    const query = issueRepo
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.project', 'project');

    if (filters.jiraId) {
      query.andWhere('issue.jiraId LIKE :jiraId', { jiraId: `%${filters.jiraId}%` });
    }
    if (filters.title) {
      query.andWhere('issue.title LIKE :title', { title: `%${filters.title}%` });
    }
    if (filters.types) {
      query.andWhere('issue.type = :type', { type: filters.types });
    }
    if (filters.status) {
      query.andWhere('issue.status = :status', { status: filters.status });
    }
    if (filters.priority) {
      query.andWhere('issue.priority = :priority', { priority: filters.priority });
    }
    if (filters.reporter) {
      query.andWhere('issue.reporter = :reporter', { reporter: filters.reporter });
    }
    if (filters.project) {
      query.andWhere('project.name = :project', { project: filters.project });
    }

    const result = await query
      .orderBy('issue.updatedAt', 'DESC')
      .getMany();
    return result;
  },

  async upsertIssue(jiraIssue: JiraIssue): Promise<void> {
    const existing = await issueRepo.findOneBy({ jiraId: jiraIssue.id });
    const projectKey = jiraIssue.key;

    const project = await projectRepo.findOneBy({ jiraProjectKey: projectKey });

    const auditLogs = [];

    if (!existing) {
      const newIssue = issueRepo.create({
        jiraId: jiraIssue.id,
        title: jiraIssue.fields.summary,
        description: jiraIssue.fields.description?.content?.[0]?.content?.[0]?.text || '',
        type: jiraIssue.fields.issuetype?.name || '',
        status: jiraIssue.fields.status?.name || '',
        priority: jiraIssue.fields.priority?.name || '',
        assignee: jiraIssue.fields.assignee?.displayName || '',
        reporter: jiraIssue.fields.reporter?.displayName || '',
        estimatedTime: jiraIssue.fields.timeoriginalestimate || 0,
        spentTime: jiraIssue.fields.timespent || 0,
        createdAt: new Date(jiraIssue.fields.created),
        updatedAt: new Date(jiraIssue.fields.updated),
        projectId: project.id,
      });
      await issueRepo.save(newIssue);
      auditLogs.push({
        entityType: 'Issue',
        entityId: newIssue.id,
        changedField: 'CREATED',
        oldValue: null,
        newValue: JSON.stringify(newIssue),
        changedAt: new Date(),
      });
    } else {
      let isUpdated = false;

      const modifiedIssue : Partial<Issue> = {
        title: jiraIssue.fields.summary,
        description: jiraIssue.fields.description?.content?.[0]?.content?.[0]?.text || '',
        type: jiraIssue.fields.issuetype?.name || '',
        status: jiraIssue.fields.status?.name || '',
        priority: jiraIssue.fields.priority?.name || '',
        assignee: jiraIssue.fields.assignee?.displayName || '',
        reporter: jiraIssue.fields.reporter?.displayName || '',
        estimatedTime: jiraIssue.fields.timeoriginalestimate || 0,
        spentTime: jiraIssue.fields.timespent || 0,
        updatedAt: new Date(jiraIssue.fields.updated),
      };

      const fieldsToCheck: Array<keyof Issue> = [
        'title',
        'description',
        'type',
        'status',
        'priority',
        'assignee',
        'reporter',
        'estimatedTime',
        'spentTime',
      ];

      for (const field of fieldsToCheck) {
        if(existing[field] !== modifiedIssue[field]) {
          const oldValue = existing[field];
          const newValue = modifiedIssue[field];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (existing as any)[field] = newValue;
          isUpdated = true;

          auditLogs.push({
            entityType: 'Issue',
            entityId: existing.id,
            changedField: field,
            oldValue: oldValue ? String(oldValue) : null,
            newValue: newValue ? String(newValue) : null,
            changedAt: new Date(),
          });
        }
      }
      if(!isUpdated) {
        return;
      }

      if (isUpdated) {
        existing.updatedAt = new Date(jiraIssue.fields.updated);
        await issueRepo.save(existing);
      }
    }

    if(auditLogs.length > 0) {
      await auditRepo.save(auditLogs);
    }
  },

  async getFilterValues () {
    const types = await issueRepo
      .createQueryBuilder('issue')
      .select('DISTINCT issue.type', 'type')
      .getRawMany();

    const statuses = await issueRepo
      .createQueryBuilder('issue')
      .select('DISTINCT issue.status', 'status')
      .getRawMany();

    const priorities = await issueRepo
      .createQueryBuilder('issue')
      .select('DISTINCT issue.priority', 'priority')
      .getRawMany();

    const reporters = await issueRepo
      .createQueryBuilder('issue')
      .select('DISTINCT issue.reporter', 'reporter')
      .getRawMany();

    const projects = await projectRepo
      .createQueryBuilder('project')
      .select('DISTINCT project.name', 'name')
      .getRawMany();

    return {
      type: types.map(t => t.type),
      status: statuses.map(s => s.status),
      priority: priorities.map(p => p.priority),
      reporter: reporters.map(r => r.reporter),
      project: projects.map(p => p.name),
    }
  },
};
