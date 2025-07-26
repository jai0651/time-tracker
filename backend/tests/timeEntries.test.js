const request = require('supertest');
const { app, prisma } = require('../server');
const jwt = require('jsonwebtoken');

jest.mock('../mailer', () => ({
  sendMail: jest.fn().mockResolvedValue(true),
}));

describe('POST /time-entries', () => {
  let token, employee;

  beforeAll(async () => {
    employee = await prisma.employee.create({
      data: {
        email: 'timeuser@example.com',
        hashedPassword: 'hashed',
        status: 'active',
      },
    });
    token = jwt.sign({ userId: employee.id }, process.env.JWT_SECRET || 'testsecret');
  });

  afterAll(async () => {
    await prisma.timeEntry.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
  });

  it('should create a time entry for authenticated user', async () => {
    const res = await request(app)
      .post('/time-entries')
      .set('Authorization', `Bearer ${token}`)
      .send({ startTs: new Date().toISOString(), endTs: new Date(Date.now() + 3600000).toISOString() });
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.employeeId).toBe(employee.id);
  });
}); 