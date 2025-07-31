import { Router } from 'express';
import { getAllAuditTrailData, getFilterValues } from '../controllers/audit-trail.controller';

const router = Router();

router.get('/', getAllAuditTrailData);
router.get('/filteroptions', getFilterValues)

export default router;
