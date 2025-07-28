import { Request, Response } from 'express';
import { auditTrailService } from '../services/audit-trail.service';

export const getAllAuditTrailData = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    let auditData = await auditTrailService.getAuditTrailData();
    if (!auditData || auditData.length === 0) {
      res.status(404).json({ message: 'No issues found' });
      return;
    }

    const total = auditData.length;
    auditData = auditData.slice(offset, offset + limit);

    res.json({
      data: auditData,
      count: total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
