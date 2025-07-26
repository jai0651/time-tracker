import express from 'express';
import dotenv from 'dotenv';
import employeesRouter from './routes/employees.js';
import authRouter from './routes/auth.js';
import timeEntriesRouter from './routes/timeEntries.js';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use('/employees', employeesRouter);
app.use('/auth', authRouter);
app.use('/time-entries', timeEntriesRouter);

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
if (process.argv[1] === new URL(import.meta.url).pathname) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app; 