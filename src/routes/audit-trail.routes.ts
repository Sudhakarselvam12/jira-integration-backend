import { Router } from 'express';
import { getAllAuditTrailData } from '../controllers/audit-trail.controller';

const router = Router();

router.get('/', getAllAuditTrailData);

export default router;
