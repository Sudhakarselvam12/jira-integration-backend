import { AppDataSource } from '../db-config';
import { AuditTrail } from '../models/AuditTrail';

const projectRepo = AppDataSource.getRepository(AuditTrail);

export const auditTrailService = {
  async getAuditTrailData() {
    return projectRepo.find();
  },
};
