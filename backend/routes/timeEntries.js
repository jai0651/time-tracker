import express from 'express';
import { createTimeEntry } from '../repository/timeEntryRepository.js';
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

export default router; 