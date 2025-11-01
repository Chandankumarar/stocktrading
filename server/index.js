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
  password: 'chandan@2005',
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
    const [rows] = await db.query('SELECT id, role, token, username FROM users WHERE username=? AND password=?', [
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

// ---------------- Applications Routes ----------------
// Public: submit a new application
app.post('/api/applications', async (req, res) => {
  const { company_name, price, sellername, description } = req.body;
  if (!company_name || !price || !sellername) {
    return res.status(400).json({ message: 'Company name, price, seller name required' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO applications (company_name, price, sellername, description, status) VALUES (?, ?, ?, ?, "pending")',
      [company_name, price, sellername, description || '']
    );
    res.json({ message: 'Application submitted', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

// Admin: list applications (optionally filter by status)
app.get('/api/admin/applications', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const { status } = req.query;
  try {
    let query = 'SELECT * FROM applications';
    const params = [];
    if (status) {
      query += ' WHERE status=?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Admin: accept application -> create stock entry and mark accepted
app.post('/api/admin/applications/:id/accept', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const id = req.params.id;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [apps] = await conn.query('SELECT * FROM applications WHERE id=? AND status="pending" FOR UPDATE', [id]);
    if (apps.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Application not found or already processed' });
    }
    const app = apps[0];
    const [result] = await conn.query(
      'INSERT INTO stocks (stockname, price, sellername, description) VALUES (?, ?, ?, ?)',
      [app.company_name, app.price, app.sellername, app.description || '']
    );
    await conn.query('UPDATE applications SET status="accepted" WHERE id=?', [id]);
    await conn.commit();
    res.json({ message: 'Application accepted', stockId: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Failed to accept application' });
  } finally {
    conn.release();
  }
});

// Admin: reject application
app.post('/api/admin/applications/:id/reject', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const id = req.params.id;
  try {
    const [result] = await db.query('UPDATE applications SET status="rejected" WHERE id=? AND status="pending"', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Application not found or already processed' });
    res.json({ message: 'Application rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to reject application' });
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

// Portfolio table structure assumed: id, user_id, stock_id, purchase_price, purchase_date
app.get('/api/portfolio', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.stock_id, p.purchase_price, s.stockname, s.price as current_price, s.sellername, s.description, p.purchase_date
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

    await db.query('INSERT INTO portfolio (user_id, stock_id, purchase_price, purchase_date) VALUES (?, ?, ?, NOW())', [
      req.user.id,
      stockId,
      stockRows[0].price,
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

// Admin: Get stock analytics - how many users bought each stock
app.get('/api/admin/stocks/:id/analytics', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  
  try {
    // Get stock summary
    const [summaryRows] = await db.query(
      `SELECT 
         s.id, s.stockname, s.price, s.sellername,
         COUNT(p.id) as total_buyers,
         AVG(p.purchase_price) as avg_purchase_price,
         MIN(p.purchase_price) as min_purchase_price,
         MAX(p.purchase_price) as max_purchase_price
       FROM stocks s
       LEFT JOIN portfolio p ON s.id = p.stock_id
       WHERE s.id = ?
       GROUP BY s.id, s.stockname, s.price, s.sellername`,
      [req.params.id]
    );
    
    if (summaryRows.length === 0) return res.status(404).json({ message: 'Stock not found' });
    
    // Get detailed buyer information
    const [buyerRows] = await db.query(
      `SELECT 
         u.username, p.purchase_price, p.purchase_date
       FROM portfolio p
       JOIN users u ON p.user_id = u.id
       WHERE p.stock_id = ?
       ORDER BY p.purchase_date DESC`,
      [req.params.id]
    );
    
    const result = {
      ...summaryRows[0],
      buyers: buyerRows
    };
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch stock analytics' });
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