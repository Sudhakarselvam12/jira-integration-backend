import {
Entity,
PrimaryGeneratedColumn,
Column,
CreateDateColumn,
OneToMany,
} from 'typeorm';
import { Issue } from './Issue';

@Entity({ name : 'project' })
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'jira_project_key'})
  jiraProjectKey: string;

  @Column({ name: 'lead'})
  lead: string;

  @Column({ name: 'status', default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Issue, (issue) => issue.project)
  issues: Issue[];
}