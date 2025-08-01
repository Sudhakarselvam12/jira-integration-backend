import { AppDataSource } from '../db-config';
import { AuditTrail } from '../models/AuditTrail';

const auditRepo = AppDataSource.getRepository(AuditTrail);

type AuditFilter = {
  entityType: string;
  changedField: string;
  startDate: Date;
  endDate: Date;
};

export const auditTrailService = {
  async getAuditTrailCount(): Promise<number> {
    return await auditRepo.count();
  },

  async getAuditTrailData(filters: AuditFilter): Promise<AuditTrail[]> {
    const query = auditRepo
      .createQueryBuilder('audit_trail')

    if (filters.entityType) {
      query.andWhere('audit_trail.entityType = :entityType', { entityType: filters.entityType });
    }
    if (filters.changedField) {
      query.andWhere('audit_trail.changedField = :changedField', { changedField: filters.changedField });
    }
    if (filters.startDate) {
      query.andWhere('audit_trail.changedAt >= :startDate', { startDate: filters.startDate });
      query.andWhere('audit_trail.changedAt <= :endDate', { endDate: filters.endDate });
    }

    const result = await query
      .orderBy('audit_trail.changedAt', 'DESC')
      .getMany();

    return result;
  },

  async getFilterValues () {
    const entityTypes = await auditRepo
      .createQueryBuilder('audit_trail')
      .select('DISTINCT audit_trail.entity_type', 'entity_type')
      .getRawMany();

    const ChangedFields = await auditRepo
      .createQueryBuilder('audit_trail')
      .select('DISTINCT audit_trail.changed_field', 'changed_field')
      .getRawMany();

    return {
      entityType: entityTypes.map(t => t.entity_type),
      changedField: ChangedFields.map(s => s.changed_field),
    }
  },
};
