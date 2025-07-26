import express from 'express';
import auth, { isAdmin } from '../middleware/auth.js';
import {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignEmployeesToTask,
  removeEmployeeFromTask
} from '../repository/taskRepository.js';

const router = express.Router();

router.use(auth, isAdmin);

// POST /tasks
router.post('/', async (req, res) => {
  const { projectId, name } = req.body;
  if (!projectId || !name) return res.status(400).json({ error: 'projectId and name required' });
  const task = await createTask({ projectId: parseInt(projectId), name });
  res.status(201).json(task);
});

// GET /tasks
router.get('/', async (req, res) => {
  const tasks = await listTasks();
  res.json(tasks);
});

// GET /tasks/:id
router.get('/:id', async (req, res) => {
  const task = await getTaskById(Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Not found' });
  res.json(task);
});

// PUT /tasks/:id
router.put('/:id', async (req, res) => {
  const { name } = req.body;
  const task = await updateTask(Number(req.params.id), { name });
  res.json(task);
});

// DELETE /tasks/:id
router.delete('/:id', async (req, res) => {
  await deleteTask(Number(req.params.id));
  res.status(204).end();
});

// POST /tasks/:id/employees
router.post('/:id/employees', async (req, res) => {
  const { employeeIds, projectId } = req.body;
  if (!Array.isArray(employeeIds)) return res.status(400).json({ error: 'employeeIds must be an array' });
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });
  const task = await assignEmployeesToTask(Number(req.params.id), employeeIds, Number(projectId));
  res.json(task);
});

// DELETE /tasks/:id/employees/:employeeId
router.delete('/:id/employees/:employeeId', async (req, res) => {
  const task = await removeEmployeeFromTask(Number(req.params.id), Number(req.params.employeeId));
  res.json(task);
});

export default router; 