// app.js
import express from 'express';
import cors from 'cors';
import uploadRoutes from './routes/uploadRoutes.js';
import pool from './models/db.js';

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', uploadRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Error handler for multer file type
app.use((err, req, res, next) => {
  if (err instanceof Error && err.message.includes('.md')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// DB table creation
 // DB table creation
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chunks (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
      chunk_number INTEGER NOT NULL,
      content TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS document_links (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
      chunk_number INTEGER NOT NULL,
      url TEXT NOT NULL
    );
  `);
};

initDB();

// Optional GET routes
app.get('/documents', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM documents ORDER BY upload_time DESC');
  res.json(rows);
});

app.get('/documents/:id/chunks', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM chunks WHERE document_id = $1', [id]);
  res.json(rows);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
