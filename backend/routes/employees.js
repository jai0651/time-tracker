import express from 'express';
import { prisma } from '../prisma/prismaClient.js';
import { sharedSettingsRepository } from '../repository/sharedSettingsRepository.js';
import auth from '../middleware/auth.js';
import { sendMail } from '../mailer.js';
import { v4 as uuidv4 } from 'uuid';
import { findPendingEmployeeByToken, markTokenAsUsed } from '../repository/authRepository.js';

const router = express.Router();

// Validation schemas
const createEmployeeSchema = {
  name: { type: 'string', required: true },
  email: { type: 'string', required: true },
  teamId: { type: 'string', required: true },
  sharedSettingsId: { type: 'string', required: true },
  organizationId: { type: 'string', required: false }
};

const updateEmployeeSchema = {
  name: { type: 'string', required: false },
  email: { type: 'string', required: false },
  teamId: { type: 'string', required: false },
  sharedSettingsId: { type: 'string', required: false },
  projects: { type: 'array', required: false }
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

// POST /employee - Create new employee
router.post('/', auth, async (req, res) => {
  try {
    // Validate request body
    const validationErrors = validateBody(createEmployeeSchema, req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    const { name, email, teamId, sharedSettingsId } = req.body;
    
    // Get organization ID from authenticated user (assuming it's in the token)
    const organizationId = req.user.organizationId || 'default-org'; // You'll need to add this to your JWT
    
    // Check if email already exists (if provided)
    if (email) {
      const existingEmployee = await prisma.employee.findUnique({
        where: { email }
      });
      if (existingEmployee) {
        return res.status(409).json({ error: 'Employee with this email already exists' });
      }
    }

    // Handle sharedSettingsId
    let finalSharedSettingsId = sharedSettingsId;
    
    if (sharedSettingsId) {
      // Validate that the shared settings exists and belongs to the same organization
      const sharedSettings = await sharedSettingsRepository.getById(sharedSettingsId);
      if (!sharedSettings) {
        return res.status(400).json({ error: 'Shared settings not found' });
      }
      if (sharedSettings.organizationId !== organizationId) {
        return res.status(400).json({ error: 'Shared settings does not belong to this organization' });
      }
    } else {
      // If no sharedSettingsId provided, assign the organization's default
      const defaultSettings = await sharedSettingsRepository.getDefaultForOrganization(organizationId);
      if (defaultSettings) {
        finalSharedSettingsId = defaultSettings.id;
      }
    }
    
    // Create employee
    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        teamId,
        sharedSettingsId: finalSharedSettingsId,
        organizationId,
        invited: new Date()
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        tasks: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            priority: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Generate verification token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await prisma.verificationToken.create({
      data: {
        employeeId: employee.id,
        token,
        expiresAt
      }
    });

    // Send activation email
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const activationUrl = `${frontendUrl}/activate?token=${token}`;
      
      await sendMail({
        to: email,
        subject: 'Activate your Time Tracker account',
        html: `
          <h2>Welcome to Time Tracker!</h2>
          <p>Hi ${name},</p>
          <p>You've been invited to join our time-tracking system. Click the button below to activate your account:</p>
          <p><a href="${activationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Activate Account</a></p>
          <p>Or copy and paste this link into your browser:</p>
          <p>${activationUrl}</p>
          <p><strong>This link expires in 24 hours.</strong></p>
          <p>If you didn't expect this invitation, please ignore this email.</p>
        `,
        text: `
          Hi ${name},

          You've been invited to join our time-tracking system. Click to activate:
          ${activationUrl}

          Expires in 24h.
        `
      });
      
      console.log(`Activation email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send activation email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /employee - List employees
router.get('/', auth, async (req, res) => {
  try {
    const { organizationId: queryOrgId, teamId, status } = req.query;
    const organizationId = queryOrgId || req.user.organizationId || 'default-org';
    
    const where = { organizationId };
    
    if (teamId) {
      where.teamId = teamId;
    }
    
    if (status) {
      if (status === 'active') {
        where.deactivated = null;
      } else if (status === 'inactive') {
        where.deactivated = { not: null };
      }
    }
    
    const employees = await prisma.employee.findMany({
      where,
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        tasks: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            priority: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /employee/me - Get current user's employee data
// router.get('/me', auth, async (req, res) => {
//   try {
//     const employee = await prisma.employee.findUnique({
//       where: { id: req.user.id },
//       include: {
//         projects: {
//           select: {
//             id: true,
//             name: true,
//             description: true
//           }
//         },
//         tasks: {
//           select: {
//             id: true,
//             name: true,
//             description: true,
//             status: true,
//             priority: true,
//             project: {
//               select: {
//                 id: true,
//                 name: true
//               }
//             }
//           }
//         }
//       }
//     });
    
//     if (!employee) {
//       return res.status(404).json({ error: 'Employee not found' });
//     }
    
//     res.json(employee);
//   } catch (error) {
//     console.error('Error fetching current employee:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// GET /employee/:id - Get specific employee
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        tasks: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            priority: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /employee/:id - Update employee
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const validationErrors = validateBody(updateEmployeeSchema, req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id }
    });
    
    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: req.body,
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        tasks: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            priority: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /employee/:id/deactivate - Deactivate employee
router.patch('/:id/deactivate', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        projects: {
          select: { id: true, name: true }
        },
        tasks: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Check if employee is already deactivated
    if (employee.deactivated) {
      return res.status(400).json({ error: 'Employee is already deactivated' });
    }
    
    // Check if employee has active projects or tasks
    if (employee.projects && employee.projects.length > 0) {
      const projectNames = employee.projects.map(p => p.name).join(', ');
      return res.status(400).json({ 
        error: `Cannot deactivate employee. They are assigned to projects: ${projectNames}` 
      });
    }
    
    if (employee.tasks && employee.tasks.length > 0) {
      const taskNames = employee.tasks.map(t => t.name).join(', ');
      return res.status(400).json({ 
        error: `Cannot deactivate employee. They are assigned to tasks: ${taskNames}` 
      });
    }
    
    // Deactivate employee
    const deactivatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        deactivated: new Date()
      }
    });
    
    res.json({ message: 'Employee deactivated successfully', employee: deactivatedEmployee });
  } catch (error) {
    console.error('Error deactivating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /employee/:id - Delete employee
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        projects: {
          select: { id: true, name: true }
        },
        tasks: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Check if employee has active projects or tasks
    if (employee.projects && employee.projects.length > 0) {
      const projectNames = employee.projects.map(p => p.name).join(', ');
      return res.status(400).json({ 
        error: `Cannot delete employee. They are assigned to projects: ${projectNames}` 
      });
    }
    
    if (employee.tasks && employee.tasks.length > 0) {
      const taskNames = employee.tasks.map(t => t.name).join(', ');
      return res.status(400).json({ 
        error: `Cannot delete employee. They are assigned to tasks: ${taskNames}` 
      });
    }
    
    // Delete employee
    await prisma.employee.delete({
      where: { id }
    });
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 
