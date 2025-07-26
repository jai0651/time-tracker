import request from 'supertest';
import { app } from '../server.js';
import { prisma } from '../prisma/prismaClient.js';
import jwt from 'jsonwebtoken';

const adminToken = jwt.sign({ userId: 1, email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET || 'testsecret');
const empToken = jwt.sign({ userId: 2, email: 'emp@t.com', role: 'employee' }, process.env.JWT_SECRET || 'testsecret');

describe('TimeEntry API (read endpoints)', () => {
  let employee, project, task, entry1, entry2, entry3;
  beforeAll(async () => {
    await prisma.timeEntry.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.employee.deleteMany();
    employee = await prisma.employee.create({ data: { id: 2, email: 'emp@t.com', status: 'active', role: 'employee', name: 'Emp' } });
    project = await prisma.project.create({ data: { name: 'Proj', description: 'Desc' } });
    task = await prisma.task.create({ data: { name: 'Task', projectId: project.id } });
    // Create entries for employee
    entry1 = await prisma.timeEntry.create({ data: { employeeId: employee.id, startTs: new Date('2024-01-01T10:00:00Z'), endTs: new Date('2024-01-01T11:00:00Z'), projectId: project.id, taskId: task.id } });
    entry2 = await prisma.timeEntry.create({ data: { employeeId: employee.id, startTs: new Date('2024-01-02T10:00:00Z'), endTs: new Date('2024-01-02T11:00:00Z'), projectId: project.id, taskId: task.id } });
    // Create entry for another employee
    const otherEmp = await prisma.employee.create({ data: { email: 'other@t.com', status: 'active', role: 'employee', name: 'Other' } });
    entry3 = await prisma.timeEntry.create({ data: { employeeId: otherEmp.id, startTs: new Date('2024-01-03T10:00:00Z'), endTs: new Date('2024-01-03T11:00:00Z'), projectId: project.id, taskId: task.id } });
  });
  afterAll(async () => {
    await prisma.timeEntry.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.$disconnect();
  });

  it('GET /time-entries (admin) returns all entries', async () => {
    const res = await request(app)
      .get('/time-entries')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(3);
  });

  it('GET /time-entries (employee) returns only own entries', async () => {
    const res = await request(app)
      .get('/time-entries')
      .set('Authorization', `Bearer ${empToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body.every(e => e.employeeId === employee.id)).toBe(true);
  });

  it('GET /time-entries?employeeId=2 (admin) filters by employee', async () => {
    const res = await request(app)
      .get('/time-entries?employeeId=2')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body.every(e => e.employeeId === 2)).toBe(true);
  });

  it('GET /time-entries?projectId=1 (admin) filters by project', async () => {
    const res = await request(app)
      .get(`/time-entries?projectId=${project.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(3);
    expect(res.body.every(e => e.projectId === project.id)).toBe(true);
  });

  it('GET /time-entries?startDate=2024-01-02 (admin) filters by startDate', async () => {
    const res = await request(app)
      .get('/time-entries?startDate=2024-01-02')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('GET /time-entries/:id (admin) returns entry', async () => {
    const res = await request(app)
      .get(`/time-entries/${entry1.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(entry1.id);
    expect(res.body.project.id).toBe(project.id);
    expect(res.body.task.id).toBe(task.id);
  });

  it('GET /time-entries/:id (employee) returns own entry', async () => {
    const res = await request(app)
      .get(`/time-entries/${entry1.id}`)
      .set('Authorization', `Bearer ${empToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(entry1.id);
  });

  it('GET /time-entries/:id (employee) cannot access others', async () => {
    const res = await request(app)
      .get(`/time-entries/${entry3.id}`)
      .set('Authorization', `Bearer ${empToken}`);
    expect(res.statusCode).toBe(404);
  });
}); 