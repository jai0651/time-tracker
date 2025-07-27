import express from 'express';
import { prisma } from '../prisma/prismaClient.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const createTaskSchema = {
  name: { type: 'string', required: true },
  projectId: { type: 'string', required: true },
  description: { type: 'string', required: false },
  employees: { type: 'array', required: false },
  status: { type: 'string', required: false },
  priority: { type: 'string', required: false },
  billable: { type: 'boolean', required: false }
};

const updateTaskSchema = {
  name: { type: 'string', required: false },
  projectId: { type: 'string', required: false },
  description: { type: 'string', required: false },
  employees: { type: 'array', required: false },
  status: { type: 'string', required: false },
  priority: { type: 'string', required: false },
  billable: { type: 'boolean', required: false }
};

// Validation helper
const validateBody = (schema, body) => {
  const errors = [];
  
  for (const [field, config] of Object.entries(schema)) {
    if (config.required && !body[field]) {
      errors.push(`${field} is required`);
    } else if (body[field] !== undefined) {
      if (config.type === 'string' && typeof body[field] !== 'string') {
        errors.push(`${field} must be a string`);
      } else if (config.type === 'array' && !Array.isArray(body[field])) {
        errors.push(`${field} must be an array`);
      } else if (config.type === 'boolean' && typeof body[field] !== 'boolean') {
        errors.push(`${field} must be a boolean`);
      }
    }
  }
  
  // Check for unknown properties
  for (const field of Object.keys(body)) {
    if (!schema[field]) {
      errors.push(`Unknown field: ${field}`);
    }
  }
  
  return errors;
};

// POST /task - Create new task
router.post('/', auth, async (req, res) => {
  try {
    // Validate request body
    const validationErrors = validateBody(createTaskSchema, req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    const { name, projectId, description, employees, status, priority, billable } = req.body;
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Validate employee IDs if provided
    if (employees && Array.isArray(employees)) {
      const existingEmployees = await prisma.employee.findMany({
        where: { id: { in: employees } }
      });
      
      if (existingEmployees.length !== employees.length) {
        return res.status(400).json({ error: 'One or more employee IDs are invalid' });
      }
    }
    
    // Create task
    const task = await prisma.task.create({
      data: {
        name,
        projectId,
        description,
        status: status || 'pending',
        priority: priority || 'medium',
        billable: billable || false,
        employees: employees ? {
          connect: employees.map(employeeId => ({ id: employeeId }))
        } : undefined
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        employees: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /task - List tasks
router.get('/', auth, async (req, res) => {
  try {
    const { employeeId, projectId, limit = '50', offset = '0' } = req.query;
    const organizationId = req.user.organizationId || 'default-org';
    
    const where = {
      project: {
        organizationId
      }
    };
    
    // Filter by project if provided
    if (projectId) {
      where.projectId = projectId;
    }
    
    // Filter by employee if provided
    if (employeeId) {
      where.employees = {
        some: { id: employeeId }
      };
    }
    
    const tasks = await prisma.task.findMany({
      where,
      include: {
        employees: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: true
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /task/:id - Get specific task
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        employees: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /task/:id - Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const validationErrors = validateBody(updateTaskSchema, req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });
    
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Validate project ID if provided
    if (req.body.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: req.body.projectId }
      });
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
    }
    
    // Validate employee IDs if provided
    if (req.body.employees && Array.isArray(req.body.employees)) {
      const existingEmployees = await prisma.employee.findMany({
        where: { id: { in: req.body.employees } }
      });
      
      if (existingEmployees.length !== req.body.employees.length) {
        return res.status(400).json({ error: 'One or more employee IDs are invalid' });
      }
    }
    
    // Prepare update data
    const updateData = { ...req.body };
    delete updateData.employees; // Handle employees separately
    
    // Update task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData
    });
    
    // Update employee associations if provided
    if (req.body.employees) {
      await prisma.task.update({
        where: { id },
        data: {
          employees: {
            set: req.body.employees.map(employeeId => ({ id: employeeId }))
          }
        }
      });
    }
    
    // Return updated task with details
    const taskWithDetails = await prisma.task.findUnique({
      where: { id: updatedTask.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        employees: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.status(200).json(taskWithDetails);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /task/:id - Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Delete task
    await prisma.task.delete({
      where: { id }
    });
    
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /task/project/:id - Get tasks by project id
router.get('/project/:id', auth, async (req, res) => {
  const { id } = req.params;
  const tasks = await prisma.task.findMany({
    where: { projectId: id }
  });
  res.json(tasks);
});

export default router; 