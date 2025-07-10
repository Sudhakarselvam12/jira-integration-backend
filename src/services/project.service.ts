import { AppDataSource } from '../db-config';
import { Project } from '../models/Project';

const projectRepo = AppDataSource.getRepository(Project);

interface JiraProject {
id: string;
key: string;
name: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
[key: string]: any;
}

export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    const result = await projectRepo.find();
    return result;
  },

  async upsertProjects(jiraProject: JiraProject, lead: string): Promise<void> {
    const existing = await projectRepo.findOne({
      where: { jiraProjectKey: jiraProject.key },
    });

    if (!existing) {
      const newProject = projectRepo.create({
        name: jiraProject.name,
        jiraProjectKey: jiraProject.key,
        lead,
        status: 'active',
      });

      await projectRepo.save(newProject);
    } else {
      existing.name = jiraProject.name;
      existing.lead = lead;
      existing.status = 'active';
      await projectRepo.save(existing);
    }
  },
};
