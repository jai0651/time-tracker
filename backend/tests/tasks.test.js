import request from 'supertest';
import { app } from '../server.js';
import { prisma } from '../prisma/prismaClient.js';
import jwt from 'jsonwebtoken';

const adminToken = jwt.sign({ userId: 1, email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET || 'testsecret');

describe('Task API (admin)', () => {
  let employee1, employee2, project, task;
  beforeAll(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.employee.deleteMany();
    employee1 = await prisma.employee.create({ data: { email: 'emp1@t.com', status: 'active', role: 'employee', name: 'Emp1' } });
    employee2 = await prisma.employee.create({ data: { email: 'emp2@t.com', status: 'active', role: 'employee', name: 'Emp2' } });
    project = await prisma.project.create({ data: { name: 'Proj', description: 'Desc' } });
  });
  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
  });

  it('POST /tasks creates a task', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ projectId: project.id, name: 'Task 1' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Task 1');
    task = res.body;
  });

  it('GET /tasks returns all tasks', async () => {
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('id');
  });

  it('GET /tasks/:id returns a task', async () => {
    const res = await request(app)
      .get(`/tasks/${task.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(task.id);
  });

  it('PUT /tasks/:id updates task', async () => {
    const res = await request(app)
      .put(`/tasks/${task.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Task 1 Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Task 1 Updated');
  });

  it('POST /tasks/:id/employees assigns employees', async () => {
    const res = await request(app)
      .post(`/tasks/${task.id}/employees`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ employeeIds: [employee1.id, employee2.id] });
    expect(res.statusCode).toBe(200);
    expect(res.body.employees.length).toBe(2);
  });

  it('DELETE /tasks/:id/employees/:employeeId removes an employee', async () => {
    const res = await request(app)
      .delete(`/tasks/${task.id}/employees/${employee1.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.employees.some(e => e.id === employee1.id)).toBe(false);
  });

  it('DELETE /tasks/:id deletes the task', async () => {
    const res = await request(app)
      .delete(`/tasks/${task.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
    const deleted = await prisma.task.findUnique({ where: { id: task.id } });
    expect(deleted).toBeNull();
  });
}); 