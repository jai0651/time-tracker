import express from 'express';
import crypto from 'crypto';
import mailer from '../mailer.js';
import { createEmployee, findEmployeeByEmail, listEmployees } from '../repository/employeeRepository.js';

const router = express.Router();

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

router.get('/', async (req, res) => {
  const employees = await listEmployees();
  res.json(employees);
});

export default router; 