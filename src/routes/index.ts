import { Router } from 'express';
import projectRoutes from './project.routes';
import issueRoutes from './issue.routes';
import auditRoutes from './audit-trail.routes';
import syncRoutes from './jira-sync.routes';

const router = Router();

router.use('/projects', projectRoutes);
router.use('/issues', issueRoutes);
router.use('/audit', auditRoutes);
router.use('/sync', syncRoutes);

export default router;
