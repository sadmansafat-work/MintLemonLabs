import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// GET Active Tasks (Not Deleted)
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE is_deleted = FALSE ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET Trash Bin Items (Soft Deleted)
app.get('/api/trash', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE is_deleted = TRUE ORDER BY deleted_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trash items' });
  }
});

// POST Create Task
app.post('/api/tasks', async (req, res) => {
  const { title, category = 'feature', event_date, priority = 'P2' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, category, event_date, priority)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, category, event_date || new Date().toISOString().split('T')[0], priority]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT Soft Delete (Move to Trash Bin)
app.put('/api/tasks/:id/trash', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE tasks SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to move task to trash' });
  }
});

// PUT Restore from Trash Bin
app.put('/api/tasks/:id/restore', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE tasks SET is_deleted = FALSE, deleted_at = NULL WHERE id = $1 RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore task' });
  }
});

// DELETE Permanent Purge
app.delete('/api/trash/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1 AND is_deleted = TRUE', [id]);
    res.json({ message: 'Permanently deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to purge item' });
  }
});

app.listen(PORT, () => console.log(`OrangePlan backend active on port ${PORT}`));
