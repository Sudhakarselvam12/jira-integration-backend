import { Router } from 'express';
import { getAllIssues, getFilterValues, getIssuesCount } from '../controllers/issue.controller';

const router = Router();

router.get('/', getAllIssues);
router.get('/filteroptions', getFilterValues);
router.get('/count', getIssuesCount);

export default router;
