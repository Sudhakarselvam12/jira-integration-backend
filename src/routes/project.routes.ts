import { Router } from 'express';
import { getAllProjects } from '../controllers/project.controller';

const router = Router();

router.get('/', getAllProjects);

export default router;
