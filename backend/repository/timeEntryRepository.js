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

export async function getTimeEntries({ employeeId, projectId, startDate, endDate, isAdmin, userId }) {
  const where = {};
  if (!isAdmin) {
    where.employeeId = userId;
  } else if (employeeId) {
    where.employeeId = employeeId;
  }
  if (projectId) {
    where.projectId = projectId;
  }
  if (startDate || endDate) {
    where.startTs = {};
    if (startDate) where.startTs.gte = new Date(startDate);
    if (endDate) where.startTs.lte = new Date(endDate);
  }
  return prisma.timeEntry.findMany({
    where,
    include: {
      project: { select: { id: true, name: true } },
      task: { select: { id: true, name: true } },
    },
    orderBy: { startTs: 'desc' },
  });
}

export async function getTimeEntryById(id, { isAdmin, userId }) {
  const entry = await prisma.timeEntry.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true } },
      task: { select: { id: true, name: true } },
    },
  });
  if (!entry) return null;
  if (!isAdmin && entry.employeeId !== userId) return null;
  return entry;
} 