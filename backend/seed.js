import { prisma } from './prisma/prismaClient.js';
import bcrypt from 'bcryptjs';

async function main() {
  // Admin
  const adminPassword = await bcrypt.hash('jais', 10);
  const admin = await prisma.employee.upsert({
    where: { email: 'jai@admin' },
    update: {},
    create: {
      email: 'jai@admin',
      hashedPassword: adminPassword,
      status: 'active',
      role: 'admin',
      name: 'Admin Jai',
    },
  });

  // Employees
  const emp1Password = await bcrypt.hash('emp1pass', 10);
  const emp2Password = await bcrypt.hash('emp2pass', 10);
  const emp1 = await prisma.employee.upsert({
    where: { email: 'emp1@company.com' },
    update: {},
    create: {
      email: 'emp1@company.com',
      hashedPassword: emp1Password,
      status: 'active',
      role: 'employee',
      name: 'Employee One',
    },
  });
  const emp2 = await prisma.employee.upsert({
    where: { email: 'emp2@company.com' },
    update: {},
    create: {
      email: 'emp2@company.com',
      hashedPassword: emp2Password,
      status: 'active',
      role: 'employee',
      name: 'Employee Two',
    },
  });

  // Project
  let project = await prisma.project.findFirst({
    where: { name: 'Test Project' },
  });
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Test Project',
        description: 'Seeded project for testing',
        employees: { connect: [{ id: emp1.id }, { id: emp2.id }] },
      },
    });
  }

  // Tasks
  let task1 = await prisma.task.findFirst({
    where: { name: 'Test Project - Default', projectId: project.id },
  });
  if (!task1) {
    task1 = await prisma.task.create({
      data: {
        name: 'Test Project - Default',
        projectId: project.id,
        employees: { connect: [{ id: emp1.id }, { id: emp2.id }] },
      },
    });
  }

  let task2 = await prisma.task.findFirst({
    where: { name: 'Extra Task', projectId: project.id },
  });
  if (!task2) {
    task2 = await prisma.task.create({
      data: {
        name: 'Extra Task',
        projectId: project.id,
        employees: { connect: [{ id: emp1.id }, { id: emp2.id }] },
      },
    });
  }

  // Time Entries for both employees, both tasks
  await prisma.timeEntry.createMany({
    data: [
      // emp1
      { employeeId: emp1.id, startTs: new Date('2024-01-01T09:00:00Z'), endTs: new Date('2024-01-01T10:00:00Z'), projectId: project.id, taskId: task1.id },
      { employeeId: emp1.id, startTs: new Date('2024-01-02T09:00:00Z'), endTs: new Date('2024-01-02T10:00:00Z'), projectId: project.id, taskId: task2.id },
      // emp2
      { employeeId: emp2.id, startTs: new Date('2024-01-01T11:00:00Z'), endTs: new Date('2024-01-01T12:00:00Z'), projectId: project.id, taskId: task1.id },
      { employeeId: emp2.id, startTs: new Date('2024-01-02T11:00:00Z'), endTs: new Date('2024-01-02T12:00:00Z'), projectId: project.id, taskId: task2.id },
    ],
    skipDuplicates: true,
  });

  console.log('Seeded admin, employees, project, tasks, and time entries.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });