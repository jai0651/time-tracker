const request = require('supertest');
const { app, prisma } = require('../server');
const bcrypt = require('bcryptjs');

jest.mock('../mailer', () => ({
  sendMail: jest.fn().mockResolvedValue(true),
}));

describe('Auth endpoints', () => {
  let activationToken;
  let employee;

  beforeAll(async () => {
    activationToken = 'testtoken';
    employee = await prisma.employee.create({
      data: { email: 'user@example.com', activationToken, status: 'pending' },
    });
  });

  afterAll(async () => {
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
  });

  it('should activate account', async () => {
    const res = await request(app)
      .post('/activate')
      .send({ token: activationToken, password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/activated/);
  });

  it('should login with correct credentials', async () => {
    // Set password and activate
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.employee.update({
      where: { id: employee.id },
      data: { hashedPassword, status: 'active', activationToken: null },
    });
    const res = await request(app)
      .post('/login')
      .send({ email: 'user@example.com', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
}); 