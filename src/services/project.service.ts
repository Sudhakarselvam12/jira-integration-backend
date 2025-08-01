import { get } from 'http';
import { AppDataSource } from '../db-config';
import { AuditTrail } from '../models/AuditTrail';
import { Project } from '../models/Project';
import { JiraProject } from '../types/jira.types';

const projectRepo = AppDataSource.getRepository(Project);
const auditRepo = AppDataSource.getRepository(AuditTrail);

export const projectService = {
  async getProjectsCount(): Promise<number> {
    return await projectRepo.count();
  },

  async getAllProjects(): Promise<Project[]> {
    const result = await projectRepo.find({
      order: { createdAt: 'DESC' },
    });
    return result;
  },

  async getProjectById(id: number): Promise<Project | null> {
    const project = await projectRepo.findOne({ where: { id } });
    if (!project) {
      return null;
    }
    return project;
  },

  async upsertProjects(jiraProject: JiraProject, lead: string): Promise<void> {
    const existing = await projectRepo.findOne({
      where: { jiraId: Number(jiraProject.id) },
    });

    const auditLogs = [];

    if (!existing) {
      const newProject = projectRepo.create({
        jiraId: Number(jiraProject.id),
        name: jiraProject.name,
        jiraProjectKey: jiraProject.key,
        lead,
        status: 'active',
      });

      await projectRepo.save(newProject);
      auditLogs.push({
        entityType: 'Project',
        entityId: newProject.id,
        changedField: 'CREATED',
        oldValue: null,
        newValue: JSON.stringify(newProject),
        changedAt: new Date(),
      });
    } else {
      let isUpdated = false;

      const modifiedProject: Partial<Project> = {
        jiraId: Number(jiraProject.id),
        name: jiraProject.name,
        jiraProjectKey: jiraProject.key,
        lead,
        status: 'active',
      };

      const fieldsToCheck: Array<keyof Project> = [
        'name',
        'jiraProjectKey',
        'lead',
      ];

      for (const field of fieldsToCheck) {
        if(existing[field] !== modifiedProject[field]) {
          const oldValue = existing[field];
          const newValue = field === 'lead' ? lead : modifiedProject[field];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (existing as any)[field] = newValue;
          isUpdated = true;

          auditLogs.push({
            entityType: 'Project',
            entityId: existing.id,
            changedField: field,
            oldValue: oldValue ? String(oldValue) : null,
            newValue: newValue ? String(newValue) : null,
            changedAt: new Date(),
          });
        }
      }
      if(!isUpdated) {
        return;
      }

      await projectRepo.save(existing);
    }

    if(auditLogs.length > 0) {
      await auditRepo.save(auditLogs);
    }
  },
};
