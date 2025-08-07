import { Router } from 'express';
import { getAllAuditTrailData, getFilterValues, getAuditTrailCount, getAuditTrailForExport } from '../controllers/audit-trail.controller';

const router = Router();

router.get('/', getAllAuditTrailData);
router.get('/filteroptions', getFilterValues);
router.get('/count', getAuditTrailCount);
router.get('/export', getAuditTrailForExport);

export default router;
