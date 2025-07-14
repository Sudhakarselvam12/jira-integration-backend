import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateJiraIdInProject1752509316817 implements MigrationInterface {
    name = 'CreateJiraIdInProject1752509316817';

    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('project', new TableColumn({
        name: 'jira_id',
        type: 'int',
        isNullable: false,
        isUnique: true,
    }));
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('project', 'jira_id');
}
}
