import { Router } from 'express';
import { getAllProjects, getProjectsCount } from '../controllers/project.controller';

const router = Router();

router.get('/', getAllProjects);
router.get('/count', getProjectsCount);

export default router;
