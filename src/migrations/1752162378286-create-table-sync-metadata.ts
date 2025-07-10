import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class SyncMetadata1690001234567 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'sync_metadata',
      columns: [
        { name: 'entity', type: 'varchar', isPrimary: true },
        { name: 'last_synced_at', type: 'timestamp', isNullable: true },
      ]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('sync_metadata');
  }
}
