import { prisma } from '../prisma/prismaClient.js';

export async function createTask({ projectId, name }) {
  return prisma.task.create({
    data: { projectId, name },
    include: { employees: true, project: true }
  });
}

export async function listTasks() {
  return prisma.task.findMany({
    include: { employees: true, project: true }
  });
}

export async function getTaskById(id) {
  return prisma.task.findUnique({
    where: { id },
    include: { employees: true, project: true }
  });
}

export async function updateTask(id, { name }) {
  return prisma.task.update({
    where: { id },
    data: { name },
    include: { employees: true, project: true }
  });
}

export async function deleteTask(id) {
  return prisma.task.delete({ where: { id } });
}

export async function assignEmployeesToTask(taskId, employeeIds, projectId) {
  // Get the task with its project and project employees
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { employees: true } } }
  });
  if (!task) throw new Error('Task not found');
  if (!task.project || task.project.id !== projectId) {
    throw new Error('Task does not belong to the specified project');
  }
  const projectEmployeeIds = new Set(task.project.employees.map(e => e.id));
  // Only allow assigning employees who are assigned to the project
  const filteredIds = employeeIds.filter(id => projectEmployeeIds.has(parseInt(id)));
  return prisma.task.update({
    where: { id: taskId },
    data: {
      employees: {
        set: filteredIds.map(id => ({ id: parseInt(id) }))
      }
    },
    include: { employees: true, project: true }
  });
}

export async function removeEmployeeFromTask(taskId, employeeId) {
  // Disconnect a single employee
  return prisma.task.update({
    where: { id: taskId },
    data: {
      employees: {
        disconnect: { id: employeeId }
      }
    },
    include: { employees: true, project: true }
  });
} 