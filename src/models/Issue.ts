import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './Project';

@Entity({ name: 'issue' })
export class Issue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'jira_id' })
  jiraId: string;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'type' })
  type: string;

  @Column({ name: 'status' })
  status: string;

  @Column({ name: 'priority' })
  priority: string;

  @Column({ name: 'assignee' })
  assignee: string;

  @Column({ name: 'reporter' })
  reporter: string;

  @Column({ name: 'estimated_time', type: 'float' })
  estimatedTime: number;

  @Column({ name: 'spent_time', type: 'float' })
  spentTime: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'project_id' })
  projectId: number;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
