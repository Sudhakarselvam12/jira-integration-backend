import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
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
};

export const getAuditTrailCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await auditTrailService.getAuditTrailCount();

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getAuditTrailForExport = async (req: Request, res: Response): Promise<void> => {
  try {
    const audits = await auditTrailService.getAllAuditData();
    if (!audits || audits.length === 0) {
      res.status(404).json({ message: 'No Audit Data found' });
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Audit Trail');

    worksheet.columns = [
      { header: 'Entity Type', key: 'entityType', width: 20 },
      { header: 'Changed Field', key: 'changedField', width: 20 },
      { header: 'Old Value', key: 'oldValue', width: 30 },
      { header: 'New Value', key: 'newValue', width: 30 },
      { header: 'Changed At', key: 'changedAt', width: 20 },
    ];

    audits.forEach((auditData) => {
      worksheet.addRow({
        entityType: auditData.entityType,
        changedField: auditData.changedField,
        oldValue: auditData.oldValue || '-',
        newValue: auditData.newValue || '-',
        changedAt: auditData.changedAt.toISOString(),
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=issues.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }
  catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};