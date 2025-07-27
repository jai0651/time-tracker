import express from 'express';
import { prisma } from '../prisma/prismaClient.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// POST /activity - Create a new activity
router.post('/', auth, async (req, res) => {
  try {
    const { shiftId, description, start, end } = req.body;
    
    if (!shiftId) {
      return res.status(400).json({ error: 'shiftId is required' });
    }
    
    // Check if shift exists and belongs to the user
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        task: {
          select: {
            id: true,
            name: true,
            projectId: true
          }
        }
      }
    });
    
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    
    if (shift.employeeId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (shift.end && shift.end < new Date()) {
      return res.status(400).json({ error: 'Cannot add activity to ended shift' });
    }
    
    // Create activity
    const activity = await prisma.activity.create({
      data: {
        shiftId,
        employeeId: req.userId,
        start: start ? new Date(start) : new Date(),
        end: end ? new Date(end) : null,
        description: description || 'Work activity',
        duration: end ? new Date(end).getTime() - new Date(start).getTime() : null
      },
      include: {
        shift: {
          select: {
            id: true,
            start: true,
            end: true,
            project: {
              select: {
                id: true,
                name: true
              }
            },
            task: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /activity/:id/end - End an activity
router.patch('/:id/end', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if activity exists and belongs to the user
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        shift: {
          select: {
            id: true,
            start: true,
            end: true,
            project: {
              select: {
                id: true,
                name: true
              }
            },
            task: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    if (activity.employeeId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (activity.end) {
      return res.status(400).json({ error: 'Activity is already ended' });
    }
    
    // End the activity
    const endedActivity = await prisma.activity.update({
      where: { id },
      data: {
        end: new Date(),
        duration: Date.now() - activity.start.getTime()
      },
      include: {
        shift: {
          select: {
            id: true,
            start: true,
            end: true,
            project: {
              select: {
                id: true,
                name: true
              }
            },
            task: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.json(endedActivity);
  } catch (error) {
    console.error('Error ending activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /activities - List activities
router.get('/', auth, async (req, res) => {
  try {
    const { employeeId, shiftId, projectId, taskId, start, end, limit = '50', offset = '0' } = req.query;
    
    const where = {};
    
    // Filter by employee
    if (employeeId) {
      where.employeeId = employeeId;
    }
    
    // Filter by shift
    if (shiftId) {
      where.shiftId = shiftId;
    }
    
    // Filter by project (through shift)
    if (projectId) {
      where.shift = {
        projectId: projectId
      };
    }
    
    // Filter by task (through shift)
    if (taskId) {
      where.shift = {
        taskId: taskId
      };
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
    
    const activities = await prisma.activity.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        shift: {
          select: {
            id: true,
            start: true,
            end: true,
            project: {
              select: {
                id: true,
                name: true
              }
            },
            task: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { start: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /activity/:id - Get specific activity
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        shift: {
          select: {
            id: true,
            start: true,
            end: true,
            duration: true,
            project: {
              select: {
                id: true,
                name: true
              }
            },
            task: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.status(200).json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /screenshot - Stub endpoint for screenshots
router.post('/screenshot', auth, async (req, res) => {
  res.status(501).json({ error: 'Screenshot functionality not implemented' });
});

export default router; 