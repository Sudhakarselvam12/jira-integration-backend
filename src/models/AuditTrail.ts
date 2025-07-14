import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'audit_trail' })
export class AuditTrail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'entity_type' })
  entityType: string;

  @Column({ name: 'entity_id' })
  entityId: number;

  @Column({ name: 'changed_field' })
  changedField: string;

  @Column({ name: 'old_value', type: 'text', nullable: true })
  oldValue: string;

  @Column({ name: 'new_value', type: 'text', nullable: true })
  newValue: string;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;
}

