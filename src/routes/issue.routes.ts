import { Router } from 'express';
import { getAllIssues } from '../controllers/issue.controller';

const router = Router();

router.get('/', getAllIssues);

export default router;
