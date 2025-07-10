import { Router } from 'express';
import { JiraSyncService } from '../services/jira-sync-service';

const router = Router();

router.post('/projects', async (req, res) => {
  try {
    await JiraSyncService.syncProjects();
    res.status(200).json({ message: 'Projects synced successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
