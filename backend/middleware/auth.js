import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/prismaClient.js';

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if employee is deactivated
    const employee = await prisma.employee.findUnique({
      where: { id: payload.userId }
    });
    
    if (!employee || employee.deactivated) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }
    
    req.user = {
      id: payload.userId,
      email: payload.email,
      organizationId: payload.organizationId,
      teamId: payload.teamId
    };
    req.userId = payload.userId;
    req.email = payload.email;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export { isAdmin };
export default auth; 