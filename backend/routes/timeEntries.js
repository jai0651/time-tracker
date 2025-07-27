import express from 'express';
import { prisma } from '../prisma/prismaClient.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// POST /time-entries - Create new time entry
router.post('/', auth, async (req, res) => {
  try {
    const { startTs, endTs, projectId, taskId } = req.body;
    
    if (!startTs || !endTs || !projectId || !taskId) {
      return res.status(400).json({ error: 'startTs and endTs and projectId and taskId required' });
    }
    
    const start = new Date(startTs);
    const end = new Date(endTs);
    
    if (start >= end) {
      return res.status(400).json({ error: 'Start time must be before end time' });
    }
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if task exists and belongs to the project
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (task.projectId !== projectId) {
      return res.status(400).json({ error: 'Task does not belong to the specified project' });
    }
    
    const entry = await prisma.timeEntry.create({
      data: {
        employeeId: req.userId,
        startTs: start,
        endTs: end,
        projectId,
        taskId
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
            description: true
          }
        }
      }
    });
    
    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating time entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /time-entries - List time entries
router.get('/', auth, async (req, res) => {
  try {
    const { employeeId, projectId, startDate, endDate, limit = '50', offset = '0' } = req.query;
    
    const where = {};
    
    // Filter by employee (admin can filter by any employee, regular users only see their own)
    if (req.user.role === 'admin' && employeeId) {
      where.employeeId = employeeId;
    } else {
      where.employeeId = req.userId;
    }
    
    // Filter by project
    if (projectId) {
      where.projectId = projectId;
    }
    
    // Filter by date range
    if (startDate) {
      where.startTs = {
        gte: new Date(startDate)
      };
    }
    
    if (endDate) {
      where.endTs = {
        lte: new Date(endDate)
      };
    }
    
    const entries = await prisma.timeEntry.findMany({
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
            description: true
          }
        }
      },
      orderBy: { startTs: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    res.json(entries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /time-entries/:id - Get specific time entry
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const entry = await prisma.timeEntry.findUnique({
      where: { id },
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
            description: true
          }
        }
      }
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    
    // Check if user has access to this entry
    if (req.user.role !== 'admin' && entry.employeeId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(entry);
  } catch (error) {
    console.error('Error fetching time entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /time-entries/:id - Update time entry
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { startTs, endTs, projectId, taskId } = req.body;
    
    // Check if entry exists
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id }
    });
    
    if (!existingEntry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    
    // Check if user has access to this entry
    if (req.user.role !== 'admin' && existingEntry.employeeId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!startTs || !endTs || !projectId || !taskId) {
      return res.status(400).json({ error: 'startTs and endTs and projectId and taskId required' });
    }
    
    const start = new Date(startTs);
    const end = new Date(endTs);
    
    if (start >= end) {
      return res.status(400).json({ error: 'Start time must be before end time' });
    }
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if task exists and belongs to the project
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (task.projectId !== projectId) {
      return res.status(400).json({ error: 'Task does not belong to the specified project' });
    }
    
    const updatedEntry = await prisma.timeEntry.update({
      where: { id },
      data: {
        startTs: start,
        endTs: end,
        projectId,
        taskId
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
            description: true
          }
        }
      }
    });
    
    res.json(updatedEntry);
  } catch (error) {
    console.error('Error updating time entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /time-entries/:id - Delete time entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if entry exists
    const entry = await prisma.timeEntry.findUnique({
      where: { id }
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    
    // Check if user has access to this entry
    if (req.user.role !== 'admin' && entry.employeeId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await prisma.timeEntry.delete({
      where: { id }
    });
    
    res.json({ message: 'Time entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 