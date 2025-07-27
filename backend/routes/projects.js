import express from 'express';
import { prisma } from '../prisma/prismaClient.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const createProjectSchema = {
  name: { type: 'string', required: true },
  description: { type: 'string', required: false },
  employees: { type: 'array', required: false },
  teams: { type: 'array', required: false },
  billable: { type: 'boolean', required: false },
  statuses: { type: 'array', required: false },
  priorities: { type: 'array', required: false }
};

const updateProjectSchema = {
  name: { type: 'string', required: false },
  description: { type: 'string', required: false },
  employees: { type: 'array', required: false },
  teams: { type: 'array', required: false },
  billable: { type: 'boolean', required: false },
  statuses: { type: 'array', required: false },
  priorities: { type: 'array', required: false }
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

// POST /project - Create new project
router.post('/', auth, async (req, res) => {
  try {
    // Validate request body
    const validationErrors = validateBody(createProjectSchema, req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    const { name, description, employees, teams, billable, statuses, priorities } = req.body;
    
    // Get organization ID from authenticated user
    const organizationId = req.user.organizationId || 'default-org';
    
    // Check if project name already exists in organization
    const existingProject = await prisma.project.findFirst({
      where: { 
        name,
        organizationId
      }
    });
    
    if (existingProject) {
      return res.status(409).json({ error: 'Project with this name already exists in this organization' });
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
    
    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        teams: teams || [],
        billable: billable || false,
        statuses: statuses || [],
        priorities: priorities || [],
        organizationId,
        employees: employees ? {
          connect: employees.map(employeeId => ({ id: employeeId }))
        } : undefined
      },
      include: {
        employees: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tasks: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            priority: true,
            billable: true
          }
        }
      }
    });
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /project - List projects
router.get('/', auth, async (req, res) => {
  try {
    const { employeeId, limit = '50', offset = '0' } = req.query;
    const organizationId = req.user.organizationId || 'default-org';
    
    const where = {
      organizationId
    };
    
    // Filter by employee if provided
    if (employeeId) {
      where.employees = {
        some: { id: employeeId }
      };
    }
    
    const projects = await prisma.project.findMany({
      where,
      include: {
        employees: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tasks: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            priority: true,
            billable: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /project/:id - Get specific project
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        employees: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tasks: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            priority: true,
            billable: true
          }
        }
      }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /project/:id - Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const validationErrors = validateBody(updateProjectSchema, req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
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
    
    // Update project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData
    });
    
    // Update employee associations if provided
    if (req.body.employees) {
      await prisma.project.update({
        where: { id },
        data: {
          employees: {
            set: req.body.employees.map(employeeId => ({ id: employeeId }))
          }
        }
      });
    }
    
    // Return updated project with employees
    const projectWithEmployees = await prisma.project.findUnique({
      where: { id },
      include: {
        employees: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tasks: {
          select: {
            id: true,
            name: true,
            status: true,
            priority: true
          }
        }
      }
    });
    
    res.status(200).json(projectWithEmployees);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /project/:id - Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if project has tasks
    if (project.tasks && project.tasks.length > 0) {
      const taskNames = project.tasks.map(t => t.name).join(', ');
      return res.status(400).json({ 
        error: `Cannot delete project. It has active tasks: ${taskNames}` 
      });
    }
    
    // Check if project has assigned employees
    const projectWithEmployees = await prisma.project.findUnique({
      where: { id },
      include: {
        employees: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (projectWithEmployees.employees && projectWithEmployees.employees.length > 0) {
      const employeeNames = projectWithEmployees.employees.map(e => e.name).join(', ');
      return res.status(400).json({ 
        error: `Cannot delete project. It has assigned employees: ${employeeNames}` 
      });
    }
    
    // Delete project
    await prisma.project.delete({
      where: { id }
    });
    
    res.status(200).json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 