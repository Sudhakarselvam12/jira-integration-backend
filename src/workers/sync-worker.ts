import cron from 'node-cron';
import { JiraSyncService } from '../services/jira-sync-service';

export const startSyncWorker = (): void => {
  const projectSyncSchedule = process.env.PROJECT_SYNC_SCHEDULE;
  const issueSyncSchedule = process.env.ISSUE_SYNC_SCHEDULE;

  cron.schedule(projectSyncSchedule, async () => {
    try {
      console.log('Starting Jira sync worker - sync Projects...');
      await JiraSyncService.syncProjects();
      console.log('Jira projects sync completed successfully.');
    } catch (error) {
      console.error('Error in Jira sync worker:', error);
    }
  });

  cron.schedule(issueSyncSchedule, async () => {
    try {
      console.log('Starting Jira sync worker - sync Issues...');
      await JiraSyncService.syncIssues();
      console.log('Jira issues sync completed successfully.');
    } catch (error) {
      console.error('Error in Jira sync worker:', error);
    }
  });
};
