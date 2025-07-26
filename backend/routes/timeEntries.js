import express from 'express';
import { createTimeEntry, getTimeEntries, getTimeEntryById } from '../repository/timeEntryRepository.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { startTs, endTs } = req.body;
  if (!startTs || !endTs) return res.status(400).json({ error: 'startTs and endTs required' });
  const start = new Date(startTs);
  const end = new Date(endTs);
  if (isNaN(start) || isNaN(end) || end <= start) {
    return res.status(400).json({ error: 'Invalid timestamps' });
  }
  const entry = await createTimeEntry(req.userId, start, end);
  res.status(201).json(entry);
});

// GET /time-entries
router.get('/', auth, async (req, res) => {
  const { employeeId, projectId, startDate, endDate } = req.query;
  const isAdmin = req.role === 'admin';
  const entries = await getTimeEntries({
    employeeId: employeeId ? Number(employeeId) : undefined,
    projectId: projectId ? Number(projectId) : undefined,
    startDate,
    endDate,
    isAdmin,
    userId: req.userId,
  });
  res.json(entries);
});

// GET /time-entries/:id
router.get('/:id', auth, async (req, res) => {
  const isAdmin = req.role === 'admin';
  const entry = await getTimeEntryById(Number(req.params.id), { isAdmin, userId: req.userId });
  if (!entry) return res.status(404).json({ error: 'Not found' });
  res.json(entry);
});

export default router; 