import axios from 'axios';
import { projectService } from './project.service';
import { syncMetadataService } from './sync-metadata.service';
import { JiraProject } from '../types/jira.types';
import { issueService } from './issue.service';

const jiraDomain = process.env.JIRA_BASE_URL;
const jiraEmail = process.env.JIRA_USER_MAIL;
const jiraToken = process.env.JIRA_API_TOKEN;

const authHeader = {
  Authorization: `Basic ${Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64')}`,
};

export const JiraSyncService = {
  async syncProjects(): Promise<void> {
    const url = `${jiraDomain}/rest/api/3/project`;

    try {
      const response = await axios.get(url, { headers: authHeader });
      const projects = response.data;

      await Promise.all(
        projects.map(async (jiraProject: JiraProject) => {
          const leadData = await axios.get(`${url}/${jiraProject.key}`, { headers: authHeader });
          const lead = leadData.data.lead?.displayName || '';
          return projectService.upsertProjects(jiraProject, lead);
        })
      );

      await syncMetadataService.updateLastSync('project');

      console.log('Synced Jira projects');
    } catch (err) {
      console.error('Failed to sync Jira projects:', err.message);
    }
  },

  async syncIssues(): Promise<void> {
  const lastSyncedAt = await syncMetadataService.getOrCreateLastSyncDate('issue');

  const jql = lastSyncedAt.lastSyncedAt
    ? `updated >= "${lastSyncedAt.lastSyncedAt.toISOString().split('T')[0]}" order by updated DESC`
    : 'order by updated DESC';

  console.log('Syncing issues since:', lastSyncedAt.lastSyncedAt);

  let isLast = false;
  let nextPageToken = null;
  const maxResults = 100;

  while (!isLast) {
    const url = `${jiraDomain}/rest/api/3/search/jql`;

    const response = await axios.post(
      url,
      {
        jql,
        maxResults: maxResults,
        nextPageToken: nextPageToken,
        fields: [
          "project",
          "summary",
          "description",
          "issuetype",
          "status",
          "priority",
          "assignee",
          "reporter",
          "timeoriginalestimate",
          "timespent",
          "created",
          "updated",
        ],
      },
      {
        headers: {
          ...authHeader,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const issues = response.data.issues;
    if (!issues.length) break;

    for (const jiraIssue of issues) {
      await issueService.upsertIssue(jiraIssue);
    }
    isLast = response.data.isLast || true;
  }

  syncMetadataService.updateLastSync('issue');

  console.log('Jira issues sync complete');
  },
};
