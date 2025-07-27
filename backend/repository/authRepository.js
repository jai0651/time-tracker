import { prisma } from '../prisma/prismaClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function findPendingEmployeeByToken(token) {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { 
      token,
      used: false,
      expiresAt: { gt: new Date() }
    },
    include: { employee: true }
  });
  
  return verificationToken?.employee || null;
}

export async function markTokenAsUsed(token) {
  return prisma.verificationToken.updateMany({
    where: { token },
    data: { used: true }
  });
}

export async function updateEmployeePassword(id, hashedPassword, name) {
  // Update employee name if provided
  if (name) {
    await prisma.employee.update({
      where: { id },
      data: { name }
    });
  }

  // Create or update credentials
  return prisma.credentials.upsert({
    where: { employeeId: id },
    update: { passwordHash: hashedPassword },
    create: {
      employeeId: id,
      passwordHash: hashedPassword
    }
  });
}

export async function findEmployeeByEmail(email) {
  const employee = await prisma.employee.findUnique({ 
    where: { email },
    include: { credentials: true }
  });
  
  
  return employee;
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function generateJWT(employee) {
  return jwt.sign({ 
    userId: employee.id, 
    email: employee.email, 
    organizationId: employee.organizationId,
    teamId: employee.teamId
  }, process.env.JWT_SECRET, { expiresIn: '1d' });
} 