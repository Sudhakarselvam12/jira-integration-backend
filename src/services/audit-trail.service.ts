import { AppDataSource } from '../db-config';
import { AuditTrail } from '../models/AuditTrail';

const auditRepo = AppDataSource.getRepository(AuditTrail);

export const auditTrailService = {
  async getAuditTrailData(): Promise<AuditTrail[]> {
    return auditRepo.find();
  },
};
