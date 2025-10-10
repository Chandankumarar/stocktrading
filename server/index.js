const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

const app = express();
const PORT = 8000;

// ---------------- Middleware ----------------
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ---------------- Database ----------------
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '@Kamlesh007',
  database: 'stockdb',
  waitForConnections: true,
  connectionLimit: 10,
});

// ---------------- Auth Middleware ----------------
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const [rows] = await db.query('SELECT id, username, role FROM users WHERE token=?', [token]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid token' });

    req.user = rows[0];
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during auth' });
  }
};

// ---------------- Public Routes ----------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username & password required' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username=?', [username]);
    if (rows.length > 0) return res.status(400).json({ message: 'Username exists' });

    const token = `token-${crypto.randomUUID()}`;
    const userRole = role || 'user';
    await db.query('INSERT INTO users (username, password, role, token) VALUES (?, ?, ?, ?)', [
      username,
      password,
      userRole,
      token,
    ]);
    res.json({ message: 'User registered', token, role: userRole });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username & password required' });

  try {
    const [rows] = await db.query('SELECT id, role, token FROM users WHERE username=? AND password=?', [
      username,
      password,
    ]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// ---------------- Admin Routes ----------------
app.get('/api/admin/stocks', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  
  const { search } = req.query;
  try {
    let query = 'SELECT * FROM stocks';
    let params = [];
    
    if (search) {
      query += ' WHERE stockname LIKE ? OR sellername LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }
    
    const [stocks] = await db.query(query, params);
    res.json(stocks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch stocks' });
  }
});

app.post('/api/admin/stocks', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const { stockname, price, sellername, description } = req.body;
  if (!stockname || !price || !sellername)
    return res.status(400).json({ message: 'Stock name, price, seller required' });

  try {
    const [result] = await db.query(
      'INSERT INTO stocks (stockname, price, sellername, description) VALUES (?, ?, ?, ?)',
      [stockname, price, sellername, description || '']
    );
    res.json({ message: 'Stock added', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add stock' });
  }
});

app.put('/api/admin/stocks/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const { stockname, price, sellername, description } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE stocks SET stockname=?, price=?, sellername=?, description=? WHERE id=?',
      [stockname, price, sellername, description || '', req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Stock not found' });
    res.json({ message: 'Stock updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update stock' });
  }
});

app.delete('/api/admin/stocks/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

  try {
    const [result] = await db.query('DELETE FROM stocks WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Stock not found' });
    res.json({ message: 'Stock deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete stock' });
  }
});

// ---------------- User Routes ----------------
app.get('/api/stocks', authMiddleware, async (req, res) => {
  const { search } = req.query;
  try {
    let query = 'SELECT * FROM stocks';
    let params = [];
    
    if (search) {
      query += ' WHERE stockname LIKE ? OR sellername LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }
    
    const [stocks] = await db.query(query, params);
    res.json(stocks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch stocks' });
  }
});

// Portfolio table structure assumed: id, user_id, stock_id, purchase_date
app.get('/api/portfolio', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.stock_id, s.stockname, s.price, s.sellername, s.description, p.purchase_date
       FROM portfolio p
       JOIN stocks s ON p.stock_id = s.id
       WHERE p.user_id=?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
});

app.post('/api/buy/:id', authMiddleware, async (req, res) => {
  const stockId = req.params.id;
  try {
    // Check if stock exists
    const [stockRows] = await db.query('SELECT * FROM stocks WHERE id=?', [stockId]);
    if (stockRows.length === 0) return res.status(404).json({ message: 'Stock not found' });
    
    // Check if user already owns this stock
    const [existingRows] = await db.query('SELECT * FROM portfolio WHERE user_id=? AND stock_id=?', [req.user.id, stockId]);
    if (existingRows.length > 0) return res.status(400).json({ message: 'You already own this stock' });

    await db.query('INSERT INTO portfolio (user_id, stock_id, purchase_date) VALUES (?, ?, NOW())', [
      req.user.id,
      stockId,
    ]);

    res.json({ message: 'Stock bought successfully', stockname: stockRows[0].stockname });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to buy stock' });
  }
});

app.delete('/api/portfolio/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM portfolio WHERE id=? AND user_id=?', [
      req.params.id,
      req.user.id,
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Portfolio item not found' });
    res.json({ message: 'Stock sold successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to sell stock' });
  }
});

// ---------------- 404 ----------------
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});