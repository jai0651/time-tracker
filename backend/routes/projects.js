import express from 'express';
import auth, { isAdmin } from '../middleware/auth.js';
import {
  createProject,
  listProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignEmployeesToProject,
  removeEmployeeFromProject
} from '../repository/projectRepository.js';

const router = express.Router();

router.use(auth, isAdmin);

// POST /projects
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const project = await createProject({ name, description });
  res.status(201).json(project);
});

// GET /projects
router.get('/', async (req, res) => {
  const projects = await listProjects();
  res.json(projects);
});

// GET /projects/:id
router.get('/:id', async (req, res) => {
  const project = await getProjectById(Number(req.params.id));
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

// PUT /projects/:id
router.put('/:id', async (req, res) => {
  const { name, description } = req.body;
  const project = await updateProject(Number(req.params.id), { name, description });
  res.json(project);
});

// DELETE /projects/:id
router.delete('/:id', async (req, res) => {
  await deleteProject(Number(req.params.id));
  res.status(204).end();
});

// POST /projects/:id/employees
router.post('/:id/employees', async (req, res) => {
  const { employeeIds } = req.body;
  if (!Array.isArray(employeeIds)) return res.status(400).json({ error: 'employeeIds must be an array' });
  const project = await assignEmployeesToProject(Number(req.params.id), employeeIds);
  res.json(project);
});

// DELETE /projects/:id/employees/:employeeId
router.delete('/:id/employees/:employeeId', async (req, res) => {
  const project = await removeEmployeeFromProject(Number(req.params.id), Number(req.params.employeeId));
  res.json(project);
});

export default router; 