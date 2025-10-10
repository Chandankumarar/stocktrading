import React, { useState, useEffect } from 'react';
import './App.css';

// Allow overriding API base via env when proxy isn't used (e.g., preview/build)
const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || '/api';

const MessageBox = ({ type, children }) => (
    <div className={`message-box ${type}`}>{children}</div>
);

// --- Enhanced Login / Register Component ---
const Login = ({ setAuth, navigate }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [isRegister, setIsRegister] = useState(false);

    const apiUrl = isRegister ? `${API_BASE}/register` : `${API_BASE}/login`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const requestBody = { username, password };
            if (isRegister) {
                requestBody.role = role;
            }

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const data = await res.json();

            if (res.ok) {
                if (isRegister) {
                    alert('Registered successfully! Please log in.');
                    setIsRegister(false);
                    setUsername('');
                    setPassword('');
                } else {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', data.role);
                    localStorage.setItem('userId', data.id);
                    setAuth({ token: data.token, role: data.role, id: data.id });
                    navigate(data.role === 'admin' ? 'admin' : 'user');
                }
            } else {
                setError(data.message || 'Something went wrong.');
            }
        } catch (err) {
            console.error("Client Network Error:", err);
            setError('Network error (Could not connect to server)');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Stock Trading Platform</h2>
                    <p>{isRegister ? 'Create Account' : 'Welcome Back'}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="login-form">
                    {isRegister && (
                        <div className="form-group">
                            <label>Account Type</label>
                            <div className="role-selector">
                                <button
                                    type="button"
                                    className={`role-btn ${role === 'user' ? 'active' : ''}`}
                                    onClick={() => setRole('user')}
                                >
                                    User
                                </button>
                                <button
                                    type="button"
                                    className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                                    onClick={() => setRole('admin')}
                                >
                                    Admin
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    
                    {error && <MessageBox type="error">{error}</MessageBox>}
                    
                    <button type="submit" className="btn btn-primary">
                        {isRegister ? 'Register' : 'Login'}
                    </button>
                </form>
                
                <div className="login-footer">
                    <p>
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            type="button"
                            className="link-btn"
                            onClick={() => setIsRegister(!isRegister)}
                        >
                            {isRegister ? 'Login' : 'Register'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- Admin Dashboard Component ---
const AdminDashboard = ({ auth, navigate }) => {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    stockname: '',
    price: '',
    sellername: '',
    description: ''
  });

  const fetchStocks = async () => {
    setLoading(true);
    setError('');
    try {
      const url = searchTerm ? `${API_BASE}/admin/stocks?search=${encodeURIComponent(searchTerm)}` : `${API_BASE}/admin/stocks`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
            const data = await res.json();
            if (res.ok) setStocks(data);
            else setError(data.message || 'Error fetching stocks');
        } catch {
            setError('Network error: Could not load stocks.');
        }
        setLoading(false);
    };

    const handleAddStock = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/admin/stocks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                alert('Stock added successfully!');
                setFormData({ stockname: '', price: '', sellername: '', description: '' });
                setShowAddForm(false);
                fetchStocks();
            } else {
                alert(data.message);
            }
        } catch {
            alert('Network error: Could not add stock.');
        }
    };

    const handleUpdateStock = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/admin/stocks/${editingStock.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                alert('Stock updated successfully!');
                setEditingStock(null);
                setFormData({ stockname: '', price: '', sellername: '', description: '' });
                fetchStocks();
            } else {
                alert(data.message);
            }
        } catch {
            alert('Network error: Could not update stock.');
        }
    };

    const handleDeleteStock = async (id) => {
        if (!confirm('Are you sure you want to delete this stock?')) return;
        
        try {
            const res = await fetch(`${API_BASE}/admin/stocks/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            const data = await res.json();
            if (res.ok) {
                alert('Stock deleted successfully!');
                fetchStocks();
            } else {
                alert(data.message);
            }
        } catch {
            alert('Network error: Could not delete stock.');
        }
    };

    const startEdit = (stock) => {
        setEditingStock(stock);
        setFormData({
            stockname: stock.stockname,
            price: stock.price,
            sellername: stock.sellername,
            description: stock.description || ''
        });
    };

    useEffect(() => {
        fetchStocks();
    }, [searchTerm]);

    const logout = () => {
        localStorage.clear();
        navigate('login');
    };

    return (
        <div className="admin-container">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => setShowAddForm(true)}>
                        Add Stock
                    </button>
                    <button className="btn btn-danger" onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="search-section">
                <input
                    type="text"
                    placeholder="Search stocks by name or seller..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Add New Stock</h3>
                            <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddStock} className="stock-form">
                            <div className="form-group">
                                <label>Stock Name</label>
                                <input
                                    type="text"
                                    value={formData.stockname}
                                    onChange={(e) => setFormData({...formData, stockname: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Seller Name</label>
                                <input
                                    type="text"
                                    value={formData.sellername}
                                    onChange={(e) => setFormData({...formData, sellername: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows="3"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">Add Stock</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingStock && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Edit Stock</h3>
                            <button className="close-btn" onClick={() => setEditingStock(null)}>×</button>
                        </div>
                        <form onSubmit={handleUpdateStock} className="stock-form">
                            <div className="form-group">
                                <label>Stock Name</label>
                                <input
                                    type="text"
                                    value={formData.stockname}
                                    onChange={(e) => setFormData({...formData, stockname: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Seller Name</label>
                                <input
                                    type="text"
                                    value={formData.sellername}
                                    onChange={(e) => setFormData({...formData, sellername: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows="3"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">Update Stock</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setEditingStock(null)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading && <div className="loading">Loading stocks...</div>}
            {error && <MessageBox type="error">{error}</MessageBox>}

            <div className="stocks-grid">
                {stocks.map((stock) => (
                    <div key={stock.id} className="stock-card">
                        <div className="stock-header">
                            <h3>{stock.stockname}</h3>
                            <span className="price">${stock.price}</span>
                        </div>
                        <div className="stock-details">
                            <p><strong>Seller:</strong> {stock.sellername}</p>
                            {stock.description && <p><strong>Description:</strong> {stock.description}</p>}
                        </div>
                        <div className="stock-actions">
                            <button className="btn btn-primary" onClick={() => startEdit(stock)}>
                                Edit
                            </button>
                            <button className="btn btn-danger" onClick={() => handleDeleteStock(stock.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- User Dashboard Component ---
const UserDashboard = ({ auth, navigate }) => {
    const [stocks, setStocks] = useState([]);
    const [portfolio, setPortfolio] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('stocks');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStocks = async () => {
        setLoading(true);
        setError('');
        try {
            const url = searchTerm ? `${API_BASE}/stocks?search=${encodeURIComponent(searchTerm)}` : `${API_BASE}/stocks`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            const data = await res.json();
            if (res.ok) setStocks(data);
            else setError(data.message || 'Error fetching stocks');
        } catch {
            setError('Network error: Could not load stocks.');
        }
        setLoading(false);
    };

    const fetchPortfolio = async () => {
        try {
            const res = await fetch(`${API_BASE}/portfolio`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            const data = await res.json();
            if (res.ok) setPortfolio(data);
        } catch {
            console.error('Error fetching portfolio');
        }
    };

    const buyStock = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/buy/${id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Successfully bought ${data.stockname}!`);
                fetchPortfolio();
            } else {
                alert(data.message);
            }
        } catch {
            alert('Network error: Could not buy stock.');
        }
    };

    const sellStock = async (id) => {
        if (!confirm('Are you sure you want to sell this stock?')) return;
        
        try {
            const res = await fetch(`${API_BASE}/portfolio/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            const data = await res.json();
            if (res.ok) {
                alert('Stock sold successfully!');
                fetchPortfolio();
            } else {
                alert(data.message);
            }
        } catch {
            alert('Network error: Could not sell stock.');
        }
    };

    useEffect(() => {
        fetchStocks();
        fetchPortfolio();
    }, [searchTerm]);

    const logout = () => {
        localStorage.clear();
        navigate('login');
    };

    return (
        <div className="user-container">
            <div className="dashboard-header">
                <h1>User Dashboard</h1>
                <div className="header-actions">
                    <button className="btn btn-danger" onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="tab-navigation">
                <button 
                    className={`tab-btn ${activeTab === 'stocks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stocks')}
                >
                    Available Stocks
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
                    onClick={() => setActiveTab('portfolio')}
                >
                    My Portfolio ({portfolio.length})
                </button>
            </div>

            {activeTab === 'stocks' && (
                <>
                    <div className="search-section">
                        <input
                            type="text"
                            placeholder="Search stocks by name or seller..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {loading && <div className="loading">Loading stocks...</div>}
                    {error && <MessageBox type="error">{error}</MessageBox>}

                    <div className="stocks-grid">
                        {stocks.map((stock) => {
                            const isOwned = portfolio.some(p => p.stock_id === stock.id);
                            return (
                                <div key={stock.id} className="stock-card">
                                    <div className="stock-header">
                                        <h3>{stock.stockname}</h3>
                                        <span className="price">${stock.price}</span>
                                    </div>
                                    <div className="stock-details">
                                        <p><strong>Seller:</strong> {stock.sellername}</p>
                                        {stock.description && <p><strong>Description:</strong> {stock.description}</p>}
                                    </div>
                                    <div className="stock-actions">
                                        {isOwned ? (
                                            <button className="btn btn-secondary" disabled>
                                                Already Owned
                                            </button>
                                        ) : (
                                            <button className="btn btn-success" onClick={() => buyStock(stock.id)}>
                                                Buy Stock
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'portfolio' && (
                <div className="portfolio-section">
                    <h2>My Portfolio</h2>
                    {portfolio.length === 0 ? (
                        <div className="empty-portfolio">
                            <p>You don't have any stocks in your portfolio yet.</p>
                            <button className="btn btn-primary" onClick={() => setActiveTab('stocks')}>
                                Browse Stocks
                            </button>
                        </div>
                    ) : (
                        <div className="stocks-grid">
                            {portfolio.map((stock) => (
                                <div key={stock.id} className="stock-card portfolio-card">
                                    <div className="stock-header">
                                        <h3>{stock.stockname}</h3>
                                        <span className="price">${stock.price}</span>
                                    </div>
                                    <div className="stock-details">
                                        <p><strong>Seller:</strong> {stock.sellername}</p>
                                        {stock.description && <p><strong>Description:</strong> {stock.description}</p>}
                                        <p><strong>Purchase Date:</strong> {new Date(stock.purchase_date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="stock-actions">
                                        <button className="btn btn-danger" onClick={() => sellStock(stock.id)}>
                                            Sell Stock
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Main App Component ---
export default function App() {
    const [auth, setAuth] = useState({
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role'),
        id: localStorage.getItem('userId'),
    });
    const [page, setPage] = useState('loading');

    useEffect(() => {
        if (auth.token) {
            setPage(auth.role === 'admin' ? 'admin' : 'user');
        } else {
            setPage('login');
        }
    }, [auth]);

    switch (page) {
        case 'login':
            return <Login setAuth={setAuth} navigate={setPage} />;
        case 'admin':
            return <AdminDashboard auth={auth} navigate={setPage} />;
        case 'user':
            return <UserDashboard auth={auth} navigate={setPage} />;
        default:
            return <div className="loading">Loading...</div>;
    }
}