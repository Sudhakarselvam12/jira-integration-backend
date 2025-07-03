import { Router } from 'express';
import { getAllAuditTrailData } from '../controllers/audit-trail.controller';

const router = Router();

router.get('/audit-trail', getAllAuditTrailData);

export default router;
