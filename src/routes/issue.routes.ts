import { Router } from 'express';
import { getAllIssues, getFilterValues } from '../controllers/issue.controller';

const router = Router();

router.get('/', getAllIssues);
router.get('/filteroptions', getFilterValues)

export default router;
