import { prisma } from '../prisma/prismaClient.js';

export async function createProject({ name, description }) {
  // Create project and default task in a transaction
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: { name, description }
    });
    await tx.task.create({
      data: { name: 'Default Task', projectId: project.id }
    });
    return project;
  });
}

export async function listProjects() {
  return prisma.project.findMany({
    include: { employees: true, tasks: true }
  });
}

export async function getProjectById(id) {
  return prisma.project.findUnique({
    where: { id },
    include: { employees: true, tasks: true }
  });
}

export async function updateProject(id, { name, description }) {
  return prisma.project.update({
    where: { id },
    data: { name, description },
    include: { employees: true, tasks: true }
  });
}

export async function deleteProject(id) {
  return prisma.project.delete({ where: { id } });
}

export async function assignEmployeesToProject(projectId, employeeIds) {
  // Replace all assignments
  return prisma.project.update({
    where: { id: projectId },
    data: {
      employees: {
        set: employeeIds.map(id => ({ id }))
      }
    },
    include: { employees: true, tasks: true }
  });
}

export async function removeEmployeeFromProject(projectId, employeeId) {
  // Disconnect a single employee
  return prisma.project.update({
    where: { id: projectId },
    data: {
      employees: {
        disconnect: { id: employeeId }
      }
    },
    include: { employees: true, tasks: true }
  });
} 