import { AppDataSource } from '../db-config';
import { Issue } from '../models/Issue';
import { Project } from '../models/Project';
import { JiraIssue } from '../types/jira.types';

const issueRepo = AppDataSource.getRepository(Issue);


export const issueService = {
  async getAllIssues(): Promise<Issue[]> {
    return issueRepo.find();
  },

  async upsertIssue(jiraIssue: JiraIssue): Promise<void> {
    const existing = await issueRepo.findOneBy({ jiraId: jiraIssue.key });
    const projectKey = jiraIssue.fields.project.key;

    const project = await AppDataSource.getRepository(Project).findOneBy({ jiraProjectKey: projectKey });

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
    } else {
      let isUpdated = false;

      if (existing.title !== jiraIssue.fields.summary) {
        existing.title = jiraIssue.fields.summary;
        isUpdated = true;
      }

      if (existing.description !== (jiraIssue.fields.description || '')) {
        existing.description = jiraIssue.fields.description?.content?.[0]?.content?.[0]?.text || '';
        isUpdated = true;
      }

      if (existing.type !== (jiraIssue.fields.issuetype?.name || '')) {
        existing.type = jiraIssue.fields.issuetype?.name || '';
        isUpdated = true;
      }

      if (existing.status !== (jiraIssue.fields.status?.name || '')) {
        existing.status = jiraIssue.fields.status?.name || '';
        isUpdated = true;
      }

      if (existing.priority !== (jiraIssue.fields.priority?.name || '')) {
        existing.priority = jiraIssue.fields.priority?.name || '';
        isUpdated = true;
      }

      if (existing.assignee !== (jiraIssue.fields.assignee?.displayName || '')) {
        existing.assignee = jiraIssue.fields.assignee?.displayName || '';
        isUpdated = true;
      }

      if (existing.reporter !== (jiraIssue.fields.reporter?.displayName || '')) {
        existing.reporter = jiraIssue.fields.reporter?.displayName || '';
        isUpdated = true;
      }

      if (existing.estimatedTime !== (jiraIssue.fields.timeoriginalestimate || 0)) {
        existing.estimatedTime = jiraIssue.fields.timeoriginalestimate || 0;
        isUpdated = true;
      }

      if (existing.spentTime !== (jiraIssue.fields.timespent || 0)) {
        existing.spentTime = jiraIssue.fields.timespent || 0;
        isUpdated = true;
      }

      const jiraUpdatedAt = new Date(jiraIssue.fields.updated);
      if (existing.updatedAt.getTime() !== jiraUpdatedAt.getTime()) {
        existing.updatedAt = jiraUpdatedAt;
        isUpdated = true;
      }

      if (isUpdated) {
      await issueRepo.save(existing);
      }
    }
  },
};
