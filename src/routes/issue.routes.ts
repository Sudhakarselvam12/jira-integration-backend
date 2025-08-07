import { Router } from 'express';
import { getIssues, getFilterValues, getIssuesCount, getIssuesForExport } from '../controllers/issue.controller';

const router = Router();

router.get('/', getIssues);
router.get('/filteroptions', getFilterValues);
router.get('/count', getIssuesCount);
router.get('/export', getIssuesForExport);

export default router;
