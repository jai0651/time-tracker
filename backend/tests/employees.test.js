import request from 'supertest';
import { app } from '../server.js';
import { prisma } from '../prisma/prismaClient.js';
import jwt from 'jsonwebtoken';

jest.mock('../mailer', () => ({
  sendMail: jest.fn().mockResolvedValue(true),
}));

const adminToken = jwt.sign({ userId: 1, email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET || 'testsecret');

describe('Employee API (admin)', () => {
  let employee;
  beforeAll(async () => {
    await prisma.employee.deleteMany();
    employee = await prisma.employee.create({
      data: { email: 'emp1@example.com', status: 'active', role: 'employee', name: 'Emp One' },
    });
  });
  afterAll(async () => {
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
  });

  it('GET /employees returns all employees', async () => {
    const res = await request(app)
      .get('/employees')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('email');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('status');
  });

  it('GET /employees/:id returns a single employee', async () => {
    const res = await request(app)
      .get(`/employees/${employee.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ id: employee.id, email: employee.email, name: employee.name, status: employee.status });
  });

  it('PUT /employees/:id updates employee name', async () => {
    const res = await request(app)
      .put(`/employees/${employee.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Name' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Name');
  });

  it('PATCH /employees/:id/deactivate deactivates employee', async () => {
    const res = await request(app)
      .patch(`/employees/${employee.id}/deactivate`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('pending');
  });
}); 