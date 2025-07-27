import express from 'express';
import { findPendingEmployeeByToken, markTokenAsUsed,findEmployeeByEmail, updateEmployeePassword, comparePassword, generateJWT } from '../repository/authRepository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/prismaClient.js';

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
    
    // Update employee with password and name
    await updateEmployeePassword(employee.id, hashedPassword, name);
    
    // Mark token as used
    await markTokenAsUsed(token);
    
    // Generate JWT token
    const jwtToken = generateJWT(employee);
    
    res.json({ 
      token: jwtToken,
      message: 'Account activated successfully',
      employee: {
        id: employee.id,
        email: employee.email,
        name: name
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
  const employee = await findEmployeeByEmail(email);

  if (!employee || !employee.credentials) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if(employee.deactivated){
    return res.status(401).json({ error: 'Account is deactivated contact your admin' });
  }
  
  const valid = await comparePassword(password, employee.credentials.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  
  const token = generateJWT(employee);
  res.json({ token });
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }
  
  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Get the employee
    const employee = await prisma.employee.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!employee || employee.deactivated) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Generate new access token
    const newToken = generateJWT(employee);
    
    res.json({ token: newToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router; 