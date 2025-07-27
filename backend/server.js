import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger.js';
import employeesRouter from './routes/employees.js';
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import tasksRouter from './routes/tasks.js';
import timeEntriesRouter from './routes/timeEntries.js';
import teamsRouter from './routes/teams.js';
import shiftsRouter from './routes/shifts.js';
import activitiesRouter from './routes/activities.js';
import sharedSettingsRouter from './routes/sharedSettings.js';
import analyticsRouter from './routes/analytics.js';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Swagger UI for API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Insightful Time Tracking API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'list',
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1
  }
}));

// Insightful API routes with version prefix
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/employee', employeesRouter);
app.use('/api/v1/project', projectsRouter);
app.use('/api/v1/task', tasksRouter);
app.use('/api/v1/time-entries', timeEntriesRouter);
app.use('/api/v1/teams', teamsRouter);
app.use('/api/v1/shift', shiftsRouter);
app.use('/api/v1/activity', activitiesRouter);
app.use('/api/v1/shared-settings', sharedSettingsRouter);
app.use('/api/v1/analytics', analyticsRouter);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Insightful Time Tracking API',
    documentation: '/api-docs',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 3000;
if (process.argv[1] === new URL(import.meta.url).pathname) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Documentation available at: http://localhost:${PORT}/api-docs`);
  });
}

export default app;