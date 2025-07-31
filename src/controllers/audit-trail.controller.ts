import { Request, Response } from 'express';
import { auditTrailService } from '../services/audit-trail.service';

export const getAllAuditTrailData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, changedField, startDate, endDate } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    let auditData = await auditTrailService.getAuditTrailData({
      entityType: entityType as string || '',
      changedField: changedField as string || '',
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    if (!auditData || auditData.length === 0) {
      res.json({});
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

export const getFilterValues = async (req: Request, res: Response): Promise<void> => {
  try {
    const filterValues = await auditTrailService.getFilterValues();

    res.json(filterValues);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
    return;
  }
}