import express from 'express';
import { findPendingEmployeeByToken, updateEmployeePassword, findActiveEmployeeByEmail, comparePassword, generateJWT } from '../repository/authRepository.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Validate activation token and return employee email
router.post('/validate-token', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  try {
    const employee = await findPendingEmployeeByToken(token);
    
    if (!employee) {
      return res.status(400).json({ error: 'Invalid or expired activation token' });
    }
    
    res.json({ 
      email: employee.email,
      message: 'Token is valid' 
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ error: 'Failed to validate token' });
  }
});

// Activate account with password
router.post('/activate', async (req, res) => {
  const { token, password, name } = req.body;
  
  if (!token || !password || !name) {
    return res.status(400).json({ error: 'Token, password, and name are required' });
  }
  
  try {
    const employee = await findPendingEmployeeByToken(token);
    
    if (!employee) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update employee with password, name, and activate account
    await updateEmployeePassword(employee.id, hashedPassword, name);
    
    // Generate JWT token
    const jwtToken = generateJWT(employee);
    
    res.json({ 
      token: jwtToken,
      message: 'Account activated successfully',
      employee: {
        id: employee.id,
        email: employee.email,
        name: name,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Activation error:', error);
    res.status(500).json({ error: 'Failed to activate account' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const employee = await findActiveEmployeeByEmail(email);

  if (!employee || !employee.hashedPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if(employee.status !=='active'){
    return res.status(401).json({ error: 'Account is not active' });
  }
  
  const valid = await comparePassword(password, employee.hashedPassword);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = generateJWT(employee);
  res.json({ token });
});

export default router; 