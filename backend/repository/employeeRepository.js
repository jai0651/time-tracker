import { prisma } from '../prisma/prismaClient.js';

export async function createEmployee(email, activationToken, status) {
  return prisma.employee.create({
    data: { email, activationToken, status },
  });
}

export async function findEmployeeByEmail(email) {
  return prisma.employee.findUnique({ where: { email } });
}

export async function listEmployees() {
  return prisma.employee.findMany({ 
    select: { 
      id: true, 
      email: true, 
      name: true, 
      status: true,
      projects: {
        select: {
          id: true,
          name: true,
          description: true
        }
      },
      tasks: {
        select: {
          id: true,
          name: true,
          project: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    } 
  });
}



export async function findEmployeeById(id) {
  return prisma.employee.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      projects: {
        select: {
          id: true,
          name: true,
          description: true
        }
      },
      tasks: {
        select: {
          id: true,
          name: true,
          project: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
}

export async function updateEmployeeName(id, name) {
  return prisma.employee.update({ where: { id }, data: { name }, select: { id: true, email: true, name: true, status: true } });
}

export async function deactivateEmployee(id) {
  return prisma.employee.update({
    where: { id },
    data: { status: 'pending', hashedPassword: null, activationToken: null },
    select: { id: true, email: true, name: true, status: true }
  });
} 