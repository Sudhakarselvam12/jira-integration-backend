import { AppDataSource } from '../db-config';
import { SyncMetadata } from '../models/SyncMetadata';

const syncRepo = AppDataSource.getRepository(SyncMetadata);

export const syncMetadataService = {
  async getLastSync(entity: string): Promise<Date | null> {
    const meta = await syncRepo.findOne({ where: { entity } });
    return meta?.lastSyncedAt ?? null;
  },

  async updateLastSync(entity: string): Promise<void> {
    const now = new Date();
    const existing = await syncRepo.findOne({ where: { entity } });

    if (existing) {
      existing.lastSyncedAt = now;
      await syncRepo.save(existing);
    } else {
      await syncRepo.save(syncRepo.create({ entity, lastSyncedAt: now }));
    }
  },
};
