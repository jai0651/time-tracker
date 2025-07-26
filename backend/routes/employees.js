import express from 'express';
import crypto from 'crypto';
import { sendMail } from '../mailer.js';
import auth, { isAdmin } from '../middleware/auth.js';
import { createEmployee, findEmployeeByEmail, listEmployees, findEmployeeById, updateEmployeeName, deactivateEmployee } from '../repository/employeeRepository.js';

const router = express.Router();

// Protect all routes below
router.use(auth);

router.post('/', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  
  try {
    const existing = await findEmployeeByEmail(email);
    if (existing.status ==='active') return res.status(409).json({ error: 'User already activated with this email' });

    if (existing.status ==='pending') return res.status(409).json({ error: 'User already pending with this email' });

    const activationToken = crypto.randomBytes(32).toString('hex');    
    // Send activation email
    const activationUrl = `http://localhost:5173/activate?token=${activationToken}`;
    
    await sendMail({
      to: email,
      subject: 'Activate your account',
      text: `Activate your account: ${activationUrl}`,
      html: `
        <h2>Welcome to Time Tracker!</h2>
        <p>Please click the link below to activate your account:</p>
        <a href="${activationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Activate Account</a>
        <p>If the button doesn't work, copy and paste this link: ${activationUrl}</p>
      `
    });

    await createEmployee(email, activationToken, 'pending');

    
    res.status(201).json({ message: 'Employee created, activation email sent' });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee or send activation email' });
  }
});

router.get('/', isAdmin, async (req, res) => {
  const employees = await listEmployees();
  const filteredEmployees = employees.filter(employee => employee.status !== 'inactive' && employee.status !== 'pending' && employee.role !=='admin');
  res.json(filteredEmployees);
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
  try {
    const updated = await deactivateEmployee(Number(req.params.id));
    res.json({ 
      id: updated.id, 
      email: updated.email, 
      name: updated.name, 
      status: updated.status,
      message: 'Employee deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivation error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router; 