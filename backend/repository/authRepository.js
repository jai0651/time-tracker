import { prisma } from '../prisma/prismaClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function findPendingEmployeeByToken(token) {
  return prisma.employee.findFirst({ where: { activationToken: token, status: 'pending' } });
}

export async function updateEmployeePassword(id, hashedPassword) {
  return prisma.employee.update({
    where: { id },
    data: { hashedPassword, status: 'active', activationToken: null },
  });
}

export async function findActiveEmployeeByEmail(email) {
  return prisma.employee.findFirst({ where: { email }, where: { status: 'active' } });
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function generateJWT(employee) {
  return jwt.sign({ userId: employee.id, email: employee.email , role: employee.role}, process.env.JWT_SECRET, { expiresIn: '1d' });
} 