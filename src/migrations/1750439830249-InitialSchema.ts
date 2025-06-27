import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitialSchema1690000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'project',
      columns: [
        { name: 'id', type: 'serial', isPrimary: true },
        { name: 'name', type: 'varchar' },
        { name: 'jira_project_key', type: 'varchar' },
        { name: 'lead', type: 'varchar' },
        {
          name: 'status',
          type: 'varchar',
          isNullable: false,
          default: `'active'`,
        },
        { name: 'created_at', type: 'timestamp', default: 'now()' }
      ]
    }));

    await queryRunner.createTable(new Table({
      name: 'issue',
      columns: [
        { name: 'id', type: 'serial', isPrimary: true },
        { name: 'jira_id', type: 'varchar' },
        { name: 'title', type: 'varchar' },
        { name: 'description', type: 'text' },
        { name: 'type', type: 'varchar' },
        { name: 'status', type: 'varchar' },
        { name: 'priority', type: 'varchar' },
        { name: 'assignee', type: 'varchar' },
        { name: 'reporter', type: 'varchar' },
        { name: 'estimated_time', type: 'float' },
        { name: 'spent_time', type: 'float' },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
        { name: 'updated_at', type: 'timestamp', default: 'now()' },
        { name: 'project_id', type: 'int' }
      ],
      foreignKeys: [
        {
          columnNames: ['project_id'],
          referencedTableName: 'project',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE'
        }
      ]
    }));

    await queryRunner.createTable(new Table({
      name: 'audit_trail',
      columns: [
        { name: 'id', type: 'serial', isPrimary: true },
        { name: 'entity_type', type: 'varchar' },
        { name: 'entity_id', type: 'int' },
        { name: 'changed_field', type: 'varchar' },
        { name: 'old_value', type: 'text' },
        { name: 'new_value', type: 'text' },
        { name: 'changed_at', type: 'timestamp', default: 'now()' }
      ]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_trail');
    await queryRunner.dropTable('issue');
    await queryRunner.dropTable('project');
  }
}
