const request = require('supertest');
const { app, prisma } = require('../server');

jest.mock('../mailer', () => ({
  sendMail: jest.fn().mockResolvedValue(true),
}));

describe('POST /employees', () => {
  afterAll(async () => {
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
  });

  it('should create a pending employee and send activation email', async () => {
    const res = await request(app)
      .post('/employees')
      .send({ email: 'test@example.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/activation email sent/);
  });
}); 