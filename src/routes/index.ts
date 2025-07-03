import { Router } from 'express';
import projectRoutes from './project.routes';
import issueRoutes from './issue.routes';
import auditRoutes from './audit-trail.routes';

const router = Router();

router.use('/projects', projectRoutes);
router.use('/issues', issueRoutes);
router.use('/audit', auditRoutes);

export default router;
