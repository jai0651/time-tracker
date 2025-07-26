import { prisma } from './prisma/prismaClient.js';
import bcrypt from 'bcryptjs';



async function main() {
  const plainPassword = 'jais';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const existing = await prisma.employee.findUnique({
    where: { email: 'jai@admin' },
  });

  if (existing) {
    console.log('Admin user already exists. Skipping seed.');
    return;
  }

  const admin = await prisma.employee.create({
    data: {
      email: 'jai@admin',
      hashedPassword,
      status: 'active',
      role: 'admin',
    },
  });

  console.log('Seeded admin user:', admin);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });