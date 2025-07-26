import express from 'express';
import crypto from 'crypto';
import mailer from '../mailer.js';
import auth, { isAdmin } from '../middleware/auth.js';
import { createEmployee, findEmployeeByEmail, listEmployees, findEmployeeById, updateEmployeeName, deactivateEmployee } from '../repository/employeeRepository.js';

const router = express.Router();

// Protect all routes below
router.use(auth);

router.post('/', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const existing = await findEmployeeByEmail(email);
  if (existing) return res.status(409).json({ error: 'Email already exists' });
  const activationToken = crypto.randomBytes(32).toString('hex');
  await createEmployee(email, activationToken, 'pending');
  // Send activation email
  const activationUrl = `https://<web-ui>/activate?token=${activationToken}`;
  await mailer.sendMail({
    to: email,
    subject: 'Activate your account',
    text: `Activate your account: ${activationUrl}`,
  });
  res.status(201).json({ message: 'Employee created, activation email sent' });
});

router.get('/', isAdmin, async (req, res) => {
  const employees = await listEmployees();
  res.json(employees);
});

router.get('/:id', async (req, res) => {
  const employee = await findEmployeeById(Number(req.params.id));
  if (!employee) return res.status(404).json({ error: 'Not found' });
  res.json(employee);
});

router.put('/:id', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const updated = await updateEmployeeName(Number(req.params.id), name);
  res.json({ id: updated.id, email: updated.email, name: updated.name, status: updated.status });
});

router.patch('/:id/deactivate', async (req, res) => {
  const updated = await deactivateEmployee(Number(req.params.id));
  res.json({ id: updated.id, email: updated.email, name: updated.name, status: updated.status });
});

export default router; 