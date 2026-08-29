import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Neon PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 1. Health & Status Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', system: 'OrangePlan Dev Core', timestamp: new Date() });
});

// 2. GET all dev tasks/events with optional category or date filter
app.get('/api/tasks', async (req, res) => {
  const { category, date } = req.query;
  try {
    let queryText = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (category) {
      params.push(category);
      queryText += ` AND category = $${params.length}`;
    }

    if (date) {
      params.push(date);
      queryText += ` AND event_date = $${params.length}`;
    }

    queryText += ' ORDER BY event_date ASC, created_at DESC';
    const result = await pool.query(queryText, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching dev tasks:', err);
    res.status(500).json({ error: 'Server error fetching tasks' });
  }
});

// 3. POST new dev item (feature, bug, sprint task, code review)
app.post('/api/tasks', async (req, res) => {
  const { title, category = 'feature', event_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Task title or ticket name is required' });
  }

  try {
    const targetDate = event_date || new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `INSERT INTO tasks (title, category, event_date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, category, targetDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error logging dev item:', err);
    res.status(500).json({ error: 'Server error creating task' });
  }
});

// 4. PUT update task status / details
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, category, event_date } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           category = COALESCE($2, category),
           event_date = COALESCE($3, event_date)
       WHERE id = $4
       RETURNING *`,
      [title, category, event_date, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Server error updating task' });
  }
});

// 5. DELETE task / ticket
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Ticket removed', deletedTask: result.rows[0] });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Server error deleting task' });
  }
});

// 6. GET Developer Productivity Metrics
app.get('/api/summary', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalRes = await pool.query('SELECT COUNT(*) FROM tasks');
    const featuresRes = await pool.query("SELECT COUNT(*) FROM tasks WHERE category = 'feature'", []);
    const bugsRes = await pool.query("SELECT COUNT(*) FROM tasks WHERE category = 'bug'", []);
    const todayTasksRes = await pool.query('SELECT COUNT(*) FROM tasks WHERE event_date = $1', [today]);

    res.json({
      totalTickets: parseInt(totalRes.rows[0].count, 10),
      featuresCount: parseInt(featuresRes.rows[0].count, 10),
      bugsCount: parseInt(bugsRes.rows[0].count, 10),
      todayScheduled: parseInt(todayTasksRes.rows[0].count, 10)
    });
  } catch (err) {
    console.error('Error calculating dev metrics:', err);
    res.status(500).json({ error: 'Server error fetching summary' });
  }
});

app.listen(PORT, () => {
  console.log(`OrangePlan backend active on port ${PORT}`);
});
