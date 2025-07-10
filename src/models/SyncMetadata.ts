import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'sync_metadata' })
export class SyncMetadata {
  @PrimaryColumn()
  entity: string;

  @Column({ name: 'last_synced_at', type: 'timestamp', nullable: true })
  lastSyncedAt: Date | null;
}
