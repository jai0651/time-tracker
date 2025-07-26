import { prisma } from '../prisma/prismaClient.js';

export async function createTimeEntry(employeeId, startTs, endTs) {
  return prisma.timeEntry.create({
    data: {
      employeeId,
      startTs,
      endTs,
    },
  });
} 