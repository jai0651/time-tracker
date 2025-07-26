import express from 'express';
import { findPendingEmployeeByToken, updateEmployeePassword, findActiveEmployeeByEmail, comparePassword, generateJWT } from '../repository/authRepository.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.post('/activate', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
  const employee = await findPendingEmployeeByToken(token);
  if (!employee) return res.status(400).json({ error: 'Invalid or expired token' });
  const hashedPassword = await bcrypt.hash(password, 10);
  await updateEmployeePassword(employee.id, hashedPassword);
  const jwtToken = generateJWT(employee);
  res.json({ jwtToken });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const employee = await findActiveEmployeeByEmail(email);
  if (!employee || employee.status !== 'active' || !employee.hashedPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const valid = await comparePassword(password, employee.hashedPassword);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = generateJWT(employee);
  res.json({ token });
});

export default router; 