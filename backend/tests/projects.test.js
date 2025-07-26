import request from 'supertest';
import { app } from '../server.js';
import { prisma } from '../prisma/prismaClient.js';
import jwt from 'jsonwebtoken';

const adminToken = jwt.sign({ userId: 1, email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET || 'testsecret');

describe('Project API (admin)', () => {
  let employee1, employee2, project;
  beforeAll(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.employee.deleteMany();
    employee1 = await prisma.employee.create({ data: { email: 'emp1@p.com', status: 'active', role: 'employee', name: 'Emp1' } });
    employee2 = await prisma.employee.create({ data: { email: 'emp2@p.com', status: 'active', role: 'employee', name: 'Emp2' } });
  });
  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
  });

  it('POST /projects creates a project and default task', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Project X', description: 'Desc' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Project X');
    project = res.body;
    // Check default task exists
    const tasks = await prisma.task.findMany({ where: { projectId: project.id } });
    expect(tasks.some(t => t.name === 'Default Task')).toBe(true);
  });

  it('GET /projects returns all projects', async () => {
    const res = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('id');
  });

  it('GET /projects/:id returns a project', async () => {
    const res = await request(app)
      .get(`/projects/${project.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(project.id);
  });

  it('PUT /projects/:id updates project', async () => {
    const res = await request(app)
      .put(`/projects/${project.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Project Y', description: 'New Desc' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Project Y');
  });

  it('POST /projects/:id/employees assigns employees', async () => {
    const res = await request(app)
      .post(`/projects/${project.id}/employees`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ employeeIds: [employee1.id, employee2.id] });
    expect(res.statusCode).toBe(200);
    expect(res.body.employees.length).toBe(2);
  });

  it('DELETE /projects/:id/employees/:employeeId removes an employee', async () => {
    const res = await request(app)
      .delete(`/projects/${project.id}/employees/${employee1.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.employees.some(e => e.id === employee1.id)).toBe(false);
  });

  it('DELETE /projects/:id deletes the project', async () => {
    const res = await request(app)
      .delete(`/projects/${project.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
    const deleted = await prisma.project.findUnique({ where: { id: project.id } });
    expect(deleted).toBeNull();
  });
}); 