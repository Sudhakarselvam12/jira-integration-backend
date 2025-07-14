import { AppDataSource } from '../db-config';
import { AuditTrail } from '../models/AuditTrail';
import { Issue } from '../models/Issue';
import { Project } from '../models/Project';
import { JiraIssue } from '../types/jira.types';

const issueRepo = AppDataSource.getRepository(Issue);
const auditRepo = AppDataSource.getRepository(AuditTrail);

export const issueService = {
  async getAllIssues(): Promise<Issue[]> {
    return issueRepo.find();
  },

  async upsertIssue(jiraIssue: JiraIssue): Promise<void> {
    const existing = await issueRepo.findOneBy({ jiraId: jiraIssue.key });
    const projectKey = jiraIssue.fields.project.key;

    const project = await AppDataSource.getRepository(Project).findOneBy({ jiraProjectKey: projectKey });

    const auditLogs = [];

    if (!existing) {
      const newIssue = issueRepo.create({
        jiraId: jiraIssue.key,
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
};
