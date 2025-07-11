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
    ? `updated >= "${lastSyncedAt.lastSyncedAt.toISOString().split('T')[0]}"`
    : '';

  console.log('Syncing issues since:', lastSyncedAt.lastSyncedAt);

  let startAt = 0;
  const maxResults = 100;

  while (true) {
    const url = `${jiraDomain}/rest/api/3/search?jql=${encodeURIComponent(jql)}&startAt=${startAt}&maxResults=${maxResults}`;
    const response = await axios.get(url, { headers: authHeader });

    const issues = response.data.issues;
    if (!issues.length) break;

    for (const jiraIssue of issues) {      
      await issueService.upsertIssue(jiraIssue);
    }

    if (issues.length < maxResults) break;
    startAt += maxResults;
  }

  syncMetadataService.updateLastSync('issue');

  console.log('Jira issues sync complete');
  },
};
