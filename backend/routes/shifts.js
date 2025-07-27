import express from 'express';
import { prisma } from '../prisma/prismaClient.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// POST /shifts - Create a new shift (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { employeeId, teamId, projectId, taskId, start, end, type } = req.body;
    
    // Check if user is admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Only admins can create shifts' });
    // }
    
    if (!employeeId || !teamId) {
      return res.status(400).json({ error: 'employeeId and teamId are required' });
    }
    
    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Validate project and task if provided
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
    }
    
    if (taskId) {
      const task = await prisma.task.findUnique({
        where: { id: taskId }
      });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // If task is provided, ensure projectId matches task's project
      if (projectId && task.projectId !== projectId) {
        return res.status(400).json({ error: 'Task does not belong to the specified project' });
      }
    }
    
    // Create scheduled shift
    const shift = await prisma.shift.create({
      data: {
        employeeId,
        teamId,
        type: type || 'work',
        projectId: projectId || null,
        taskId: taskId || null,
        start: start ? new Date(start) : new Date(),
        end: end ? new Date(end) : null,
        timezoneOffset: parseInt(req.headers['x-timezone-offset']) || 0
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        task: {
          select: {
            id: true,
            name: true,
            description: true,
            projectId: true
          }
        }
      }
    });
    
    res.status(201).json(shift);
  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /shifts/:id/end - End a shift (Admin only)
router.patch('/:id/end', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can end shifts' });
    }
    
    // Check if shift exists
    const shift = await prisma.shift.findUnique({
      where: { id }
    });
    
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    
    if (shift.end) {
      return res.status(400).json({ error: 'Shift is already ended' });
    }
    
    // End the shift
    const endedShift = await prisma.shift.update({
      where: { id },
      data: {
        end: new Date(),
        duration: Date.now() - shift.start.getTime()
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        task: {
          select: {
            id: true,
            name: true,
            description: true,
            projectId: true
          }
        },
        activities: {
          select: {
            id: true,
            start: true,
            end: true,
            duration: true,
            description: true
          }
        }
      }
    });
    
    res.json(endedShift);
  } catch (error) {
    console.error('Error ending shift:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /shifts - List shifts (Employees can view their shifts)
router.get('/', auth, async (req, res) => {
  try {
    const { employeeId, projectId, taskId, start, end, limit = '50', offset = '0' } = req.query;

    const user =  req.user
    
    const where = {};
    
    // If not admin, only show shifts for the current user
    if (employeeId) {
      where.employeeId = user.userId;
    }
    
    // Filter by project
    if (projectId) {
      where.projectId = projectId;
    }
    
    // Filter by task
    if (taskId) {
      where.taskId = taskId;
    }
    
    // Filter by date range
    if (start) {
      where.start = {
        gte: new Date(parseInt(start))
      };
    }
    
    if (end) {
      where.start = {
        lte: new Date(parseInt(end))
      };
    }
    
    const shifts = await prisma.shift.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        task: {
          select: {
            id: true,
            name: true,
            description: true,
            projectId: true
          }
        },
        activities: {
          select: {
            id: true,
            start: true,
            end: true,
            duration: true,
            description: true
          }
        }
      },
      orderBy: { start: 'desc' },
      take: Math.min(parseInt(limit), 100), // Max 100 records
      skip: parseInt(offset)
    });
    
    res.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /shifts/today - Get today's shifts for current employee
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    const where = {
      employeeId: req.userId,
      start: {
        gte: startOfDay,
        lte: endOfDay
      }
    };
    
    const shifts = await prisma.shift.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        task: {
          select: {
            id: true,
            name: true,
            description: true,
            projectId: true
          }
        },
        activities: {
          select: {
            id: true,
            start: true,
            end: true,
            duration: true,
            description: true
          }
        }
      },
      orderBy: { start: 'asc' }
    });
    
    res.json(shifts);
  } catch (error) {
    console.error('Error fetching today\'s shifts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /shifts/:id - Get specific shift
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const where = { id };
    
    // If not admin, only allow access to own shifts
    if (req.user.role !== 'admin') {
      where.employeeId = req.userId;
    }
    
    const shift = await prisma.shift.findUnique({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        task: {
          select: {
            id: true,
            name: true,
            description: true,
            projectId: true
          }
        },
        activities: {
          select: {
            id: true,
            start: true,
            end: true,
            duration: true,
            description: true
          }
        }
      }
    });
    
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    
    res.json(shift);
  } catch (error) {
    console.error('Error fetching shift:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 