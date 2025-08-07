import { Router } from 'express';
import { getAllProjects, getProjectsCount, getProjectsForExport } from '../controllers/project.controller';

const router = Router();

router.get('/', getAllProjects);
router.get('/count', getProjectsCount);
router.get('/export', getProjectsForExport);

export default router;
