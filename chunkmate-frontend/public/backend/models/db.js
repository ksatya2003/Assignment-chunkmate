// models/db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'chunkdb',
  password: 'lahari@14',
  port: 5432
});

pool.query('SELECT NOW()')
  .then(res => console.log('✅ DB Connected at:', res.rows[0]))
  .catch(err => console.error('❌ DB Connection error:', err));

export default pool;
