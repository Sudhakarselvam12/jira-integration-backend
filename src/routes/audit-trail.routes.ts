import { Router } from 'express';
import { getAllAuditTrailData, getFilterValues, getAuditTrailCount } from '../controllers/audit-trail.controller';

const router = Router();

router.get('/', getAllAuditTrailData);
router.get('/filteroptions', getFilterValues);
router.get('/count', getAuditTrailCount);

export default router;
