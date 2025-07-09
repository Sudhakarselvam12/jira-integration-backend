import { Request, Response } from 'express';
import { auditTrailService } from '../services/audit-trail.service';

export const getAllAuditTrailData = async (req: Request, res: Response): Promise<void> => {
  try {
    const auditData = await auditTrailService.getAuditTrailData();
    res.json(auditData);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
