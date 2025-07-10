import axios from 'axios';
import { projectService } from './project.service';
import { syncMetadataService } from './sync-metadata.service';

interface JiraProject {
id: string;
key: string;
name: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
[key: string]: any;
}

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

  // async syncIssues(): Promise<void> {
  //   const projectRepo = AppDataSource.getRepository(Project);
  //   const issueRepo = AppDataSource.getRepository(Issue);
  //   const projects = await projectRepo.find();

  //   for (const project of projects) {
  //     const jql = `project=${project.jiraProjectKey}`;
  //     const url = `https://${jiraDomain}/rest/api/3/search?jql=${encodeURIComponent(jql)}`;

  //     try {
  //       const response = await axios.get(url, { headers: authHeader });
  //       const issues = response.data.issues;

  //       for (const jiraIssue of issues) {
  //         const existing = await issueRepo.findOne({
  //           where: { jiraId: jiraIssue.id },
  //         });

  //         if (!existing) {
  //           const newIssue = issueRepo.create({
  //             jiraId: jiraIssue.id,
  //             title: jiraIssue.fields.summary,
  //             description: jiraIssue.fields.description?.content?.[0]?.content?.[0]?.text || '',
  //             type: jiraIssue.fields.issuetype.name,
  //             status: jiraIssue.fields.status.name,
  //             priority: jiraIssue.fields.priority?.name || 'Medium',
  //             assignee: jiraIssue.fields.assignee?.displayName || 'Unassigned',
  //             reporter: jiraIssue.fields.reporter?.displayName || 'Unknown',
  //             estimatedTime: (jiraIssue.fields.timeoriginalestimate || 0) / 3600,
  //             spentTime: (jiraIssue.fields.timespent || 0) / 3600,
  //             project,
  //           });

  //           await issueRepo.save(newIssue);
  //         }
  //       }

  //       console.log(`✔ Synced ${issues.length} issues for project ${project.jiraProjectKey}`);
  //     } catch (err) {
  //       console.error(`❌ Failed to sync issues for project ${project.jiraProjectKey}:`, err.message);
  //     }
  //   }
  // },
};
