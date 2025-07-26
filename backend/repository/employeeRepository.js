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
  return prisma.employee.findMany();
} 