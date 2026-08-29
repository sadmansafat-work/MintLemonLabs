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

// 1. GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Server error fetching tasks' });
  }
});

// 2. POST create task
app.post('/api/tasks', async (req, res) => {
  const { title, category = 'task', event_date } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, category, event_date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, category, event_date || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Server error creating task' });
  }
});

// 3. PUT update task
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

// 4. DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully', deletedTask: result.rows[0] });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Server error deleting task' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
