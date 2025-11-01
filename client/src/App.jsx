import React, { useState, useEffect } from "react";
import "./App.css";

// Allow overriding API base via env when proxy isn't used (e.g., preview/build)
const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || "/api";

const MessageBox = ({ type, children }) => (
  <div className={`message-box ${type}`}>{children}</div>
);

// --- Enhanced Login / Register Component ---
const Login = ({ setAuth, navigate }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    company_name: "",
    price: "",
    sellername: "",
    description: "",
  });
  const [companyMsg, setCompanyMsg] = useState("");

  const apiUrl = isRegister ? `${API_BASE}/register` : `${API_BASE}/login`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const requestBody = { username, password };
      if (isRegister) {
        requestBody.role = role;
      }

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (res.ok) {
        if (isRegister) {
          alert("Registered successfully! Please log in.");
          setIsRegister(false);
          setUsername("");
          setPassword("");
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);
          localStorage.setItem("userId", data.id);
          localStorage.setItem("username", data.username);
          setAuth({
            token: data.token,
            role: data.role,
            id: data.id,
            username: data.username,
          });
          navigate(data.role === "admin" ? "admin" : "user");
        }
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Client Network Error:", err);
      setError("Network error (Could not connect to server)");
    }
  };

  const submitCompanyApplication = async (e) => {
    e.preventDefault();
    setCompanyMsg("");
    try {
      const res = await fetch(`${API_BASE}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyForm),
      });
      const data = await res.json();
      if (res.ok) {
        setCompanyMsg(
          "Application submitted successfully! Our team will review it."
        );
        setCompanyForm({
          company_name: "",
          price: "",
          sellername: "",
          description: "",
        });
        setShowCompanyForm(false);
      } else {
        setCompanyMsg(data.message || "Failed to submit application.");
      }
    } catch {
      setCompanyMsg("Network error: Could not submit application.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Stock Trading Platform</h2>
          <p>{isRegister ? "Create Account" : "Welcome Back"}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="form-group">
              <label>Account Type</label>
              <div className="role-selector">
                <button
                  type="button"
                  className={`role-btn ${role === "user" ? "active" : ""}`}
                  onClick={() => setRole("user")}
                >
                  User
                </button>
                <button
                  type="button"
                  className={`role-btn ${role === "admin" ? "active" : ""}`}
                  onClick={() => setRole("admin")}
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
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isRegister ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              className="link-btn"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Login" : "Register"}
            </button>
          </p>
          <p>
            Are you a company wanting to list your stock?
            <button
              type="button"
              className="link-btn"
              onClick={() => setShowCompanyForm(true)}
            >
              Apply for Listing
            </button>
          </p>
        </div>
      </div>

      {showCompanyForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Apply to List Your Company</h3>
              <button
                className="close-btn"
                onClick={() => setShowCompanyForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={submitCompanyApplication} className="stock-form">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={companyForm.company_name}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      company_name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Proposed Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={companyForm.price}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Seller Name</label>
                <input
                  type="text"
                  value={companyForm.sellername}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      sellername: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={companyForm.description}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              {companyMsg && (
                <MessageBox
                  type={
                    companyMsg.includes("successfully") ? "success" : "error"
                  }
                >
                  {companyMsg}
                </MessageBox>
              )}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Submit Application
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCompanyForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Admin Dashboard Component ---
const AdminDashboard = ({ auth, navigate }) => {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [selectedStockAnalytics, setSelectedStockAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(null);

  const [formData, setFormData] = useState({
    stockname: "",
    price: "",
    sellername: "",
    description: "",
  });

  const fetchStocks = async () => {
    setLoading(true);
    setError("");
    try {
      const url = searchTerm
        ? `${API_BASE}/admin/stocks?search=${encodeURIComponent(searchTerm)}`
        : `${API_BASE}/admin/stocks`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (res.ok) setStocks(data);
      else setError(data.message || "Error fetching stocks");
    } catch {
      setError("Network error: Could not load stocks.");
    }
    setLoading(false);
  };

  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/applications?status=pending`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (res.ok) setApplications(data);
    } catch {
      // ignore for now, shown in UI as empty
    }
    setAppsLoading(false);
  };

  const fetchStockAnalytics = async (stockId) => {
    setSelectedStockId(stockId);
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/stocks/${stockId}/analytics`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedStockAnalytics(data);
      } else {
        alert(data.message || "Failed to fetch analytics");
        setSelectedStockId(null);
      }
    } catch {
      alert("Network error: Could not fetch analytics");
      setSelectedStockId(null);
    }
    setAnalyticsLoading(false);
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/stocks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Stock added successfully!");
        setFormData({
          stockname: "",
          price: "",
          sellername: "",
          description: "",
        });
        setShowAddForm(false);
        fetchStocks();
      } else {
        alert(data.message);
      }
    } catch {
      alert("Network error: Could not add stock.");
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/stocks/${editingStock.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Stock updated successfully!");
        setEditingStock(null);
        setFormData({
          stockname: "",
          price: "",
          sellername: "",
          description: "",
        });
        fetchStocks();
      } else {
        alert(data.message);
      }
    } catch {
      alert("Network error: Could not update stock.");
    }
  };

  const handleDeleteStock = async (id) => {
    if (!confirm("Are you sure you want to delete this stock?")) return;

    try {
      const res = await fetch(`${API_BASE}/admin/stocks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        alert("Stock deleted successfully!");
        fetchStocks();
      } else {
        alert(data.message);
      }
    } catch {
      alert("Network error: Could not delete stock.");
    }
  };

  const startEdit = (stock) => {
    setEditingStock(stock);
    setFormData({
      stockname: stock.stockname,
      price: stock.price,
      sellername: stock.sellername,
      description: stock.description || "",
    });
  };

  useEffect(() => {
    fetchStocks();
    fetchApplications();
  }, [searchTerm]);

  const logout = () => {
    localStorage.clear();
    navigate("login");
  };

  return (
    <div className="admin-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <span className="user-info">Welcome, {auth.username || "Admin"}</span>
          <button
            className="btn btn-secondary"
            onClick={() => setShowAddForm(true)}
          >
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

      <div className="portfolio-section" style={{ marginBottom: 20 }}>
        <h2>Pending Company Applications</h2>
        {appsLoading && <div className="loading">Loading applications...</div>}
        {!appsLoading && applications.length === 0 && (
          <div className="empty-portfolio">
            <p>No pending applications.</p>
          </div>
        )}
        {!appsLoading && applications.length > 0 && (
          <div className="stocks-grid">
            {applications.map((app) => (
              <div key={app.id} className="stock-card">
                <div className="stock-header">
                  <h3>{app.company_name}</h3>
                  <span className="price">${app.price}</span>
                </div>
                <div className="stock-details">
                  <p>
                    <strong>Seller:</strong> {app.sellername}
                  </p>
                  {app.description && (
                    <p>
                      <strong>Description:</strong> {app.description}
                    </p>
                  )}
                </div>
                <div className="stock-actions">
                  <button
                    className="btn btn-success"
                    onClick={async () => {
                      const res = await fetch(
                        `${API_BASE}/admin/applications/${app.id}/accept`,
                        {
                          method: "POST",
                          headers: { Authorization: `Bearer ${auth.token}` },
                        }
                      );
                      if (res.ok) {
                        fetchApplications();
                        fetchStocks();
                      } else {
                        const d = await res.json();
                        alert(d.message || "Failed to accept");
                      }
                    }}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={async () => {
                      const res = await fetch(
                        `${API_BASE}/admin/applications/${app.id}/reject`,
                        {
                          method: "POST",
                          headers: { Authorization: `Bearer ${auth.token}` },
                        }
                      );
                      if (res.ok) {
                        fetchApplications();
                      } else {
                        const d = await res.json();
                        alert(d.message || "Failed to reject");
                      }
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Stock</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddStock} className="stock-form">
              <div className="form-group">
                <label>Stock Name</label>
                <input
                  type="text"
                  value={formData.stockname}
                  onChange={(e) =>
                    setFormData({ ...formData, stockname: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Seller Name</label>
                <input
                  type="text"
                  value={formData.sellername}
                  onChange={(e) =>
                    setFormData({ ...formData, sellername: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Add Stock
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
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
              <button
                className="close-btn"
                onClick={() => setEditingStock(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateStock} className="stock-form">
              <div className="form-group">
                <label>Stock Name</label>
                <input
                  type="text"
                  value={formData.stockname}
                  onChange={(e) =>
                    setFormData({ ...formData, stockname: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Seller Name</label>
                <input
                  type="text"
                  value={formData.sellername}
                  onChange={(e) =>
                    setFormData({ ...formData, sellername: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Update Stock
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingStock(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && <div className="loading">Loading stocks...</div>}
      {error && <MessageBox type="error">{error}</MessageBox>}

      {selectedStockAnalytics && (
        <div className="stock-analytics">
          <h2>Stock Analytics: {selectedStockAnalytics.stockname}</h2>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-value">
                {selectedStockAnalytics.total_buyers}
              </div>
              <div className="analytics-label">Total Buyers</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-value">
                ${selectedStockAnalytics.price}
              </div>
              <div className="analytics-label">Current Price</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-value">
                ${selectedStockAnalytics.avg_purchase_price || 0}
              </div>
              <div className="analytics-label">Avg Purchase Price</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-value">
                ${selectedStockAnalytics.min_purchase_price || 0}
              </div>
              <div className="analytics-label">Min Purchase Price</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-value">
                ${selectedStockAnalytics.max_purchase_price || 0}
              </div>
              <div className="analytics-label">Max Purchase Price</div>
            </div>
          </div>

          {selectedStockAnalytics.buyers &&
            selectedStockAnalytics.buyers.length > 0 && (
              <div className="buyers-section">
                <h3>Buyers List</h3>
                <div className="buyers-list">
                  {selectedStockAnalytics.buyers.map((buyer, index) => (
                    <div key={index} className="buyer-item">
                      <div className="buyer-info">
                        <span className="buyer-name">{buyer.username}</span>
                        <span className="buyer-price">
                          ${buyer.purchase_price}
                        </span>
                      </div>
                      <div className="buyer-date">
                        {new Date(buyer.purchase_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          <button
            className="btn btn-secondary"
            onClick={() => {
              setSelectedStockAnalytics(null);
              setSelectedStockId(null);
            }}
          >
            Close Analytics
          </button>
        </div>
      )}

      <div className="stocks-grid">
        {stocks.map((stock) => (
          <div key={stock.id} className="stock-card-container">
            <div
              className={`stock-card ${
                selectedStockId === stock.id ? "selected" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => fetchStockAnalytics(stock.id)}
            >
              <div className="stock-header">
                <h3>{stock.stockname}</h3>
                <span className="price">${stock.price}</span>
              </div>
              <div className="stock-details">
                <p>
                  <strong>Seller:</strong> {stock.sellername}
                </p>
                {stock.description && (
                  <p>
                    <strong>Description:</strong> {stock.description}
                  </p>
                )}
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#718096",
                    marginTop: "10px",
                  }}
                >
                  Click to view analytics
                </p>
              </div>
              <div className="stock-actions">
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(stock);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStock(stock.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            {selectedStockId === stock.id && selectedStockAnalytics && (
              <div className="stock-analytics-overlay">
                <div className="analytics-overlay-content">
                  <h3>Analytics: {selectedStockAnalytics.stockname}</h3>
                  <div className="analytics-summary">
                    <div className="summary-item">
                      <span className="summary-label">Buyers:</span>
                      <span className="summary-value">
                        {selectedStockAnalytics.total_buyers}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Avg Price:</span>
                      <span className="summary-value">
                        ${selectedStockAnalytics.avg_purchase_price || 0}
                      </span>
                    </div>
                  </div>

                  {selectedStockAnalytics.buyers &&
                    selectedStockAnalytics.buyers.length > 0 && (
                      <div className="buyers-overlay">
                        <h4>Buyers:</h4>
                        <div className="buyers-overlay-list">
                          {selectedStockAnalytics.buyers
                            .slice(0, 3)
                            .map((buyer, index) => (
                              <div key={index} className="buyer-overlay-item">
                                <span className="buyer-name">
                                  {buyer.username}
                                </span>
                                <span className="buyer-price">
                                  ${buyer.purchase_price}
                                </span>
                              </div>
                            ))}
                          {selectedStockAnalytics.buyers.length > 3 && (
                            <div className="more-buyers">
                              +{selectedStockAnalytics.buyers.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStockAnalytics(null);
                      setSelectedStockId(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("stocks");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStocks = async () => {
    setLoading(true);
    setError("");
    try {
      const url = searchTerm
        ? `${API_BASE}/stocks?search=${encodeURIComponent(searchTerm)}`
        : `${API_BASE}/stocks`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (res.ok) setStocks(data);
      else setError(data.message || "Error fetching stocks");
    } catch {
      setError("Network error: Could not load stocks.");
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
      console.error("Error fetching portfolio");
    }
  };

  const buyStock = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/buy/${id}`, {
        method: "POST",
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
      alert("Network error: Could not buy stock.");
    }
  };

  const sellStock = async (id) => {
    if (!confirm("Are you sure you want to sell this stock?")) return;

    try {
      const res = await fetch(`${API_BASE}/portfolio/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        alert("Stock sold successfully!");
        fetchPortfolio();
      } else {
        alert(data.message);
      }
    } catch {
      alert("Network error: Could not sell stock.");
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchPortfolio();
  }, [searchTerm]);

  const logout = () => {
    localStorage.clear();
    navigate("login");
  };

  return (
    <div className="user-container">
      <div className="dashboard-header">
        <h1>User Dashboard</h1>
        <div className="header-actions">
          <span className="user-info">Welcome, {auth.username || "User"}</span>
          <button className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "stocks" ? "active" : ""}`}
          onClick={() => setActiveTab("stocks")}
        >
          Available Stocks
        </button>
        <button
          className={`tab-btn ${activeTab === "portfolio" ? "active" : ""}`}
          onClick={() => setActiveTab("portfolio")}
        >
          My Portfolio ({portfolio.length})
        </button>
      </div>

      {activeTab === "stocks" && (
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
              const isOwned = portfolio.some((p) => p.stock_id === stock.id);
              return (
                <div key={stock.id} className="stock-card">
                  <div className="stock-header">
                    <h3>{stock.stockname}</h3>
                    <span className="price">${stock.price}</span>
                  </div>
                  <div className="stock-details">
                    <p>
                      <strong>Seller:</strong> {stock.sellername}
                    </p>
                    {stock.description && (
                      <p>
                        <strong>Description:</strong> {stock.description}
                      </p>
                    )}
                  </div>
                  <div className="stock-actions">
                    {isOwned ? (
                      <button className="btn btn-secondary" disabled>
                        Already Owned
                      </button>
                    ) : (
                      <button
                        className="btn btn-success"
                        onClick={() => buyStock(stock.id)}
                      >
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

      {activeTab === "portfolio" && (
        <div className="portfolio-section">
          <h2>My Portfolio</h2>
          {portfolio.length === 0 ? (
            <div className="empty-portfolio">
              <p>You don't have any stocks in your portfolio yet.</p>
              <button
                className="btn btn-primary"
                onClick={() => setActiveTab("stocks")}
              >
                Browse Stocks
              </button>
            </div>
          ) : (
            <div className="stocks-grid">
              {portfolio.map((stock) => {
                const purchasePrice = parseFloat(stock.purchase_price);
                const currentPrice = parseFloat(stock.current_price);
                const priceChange = currentPrice - purchasePrice;
                const priceChangePercent = (
                  (priceChange / purchasePrice) *
                  100
                ).toFixed(2);
                const isProfit = priceChange >= 0;

                return (
                  <div key={stock.id} className="stock-card portfolio-card">
                    <div className="stock-header">
                      <h3>{stock.stockname}</h3>
                      <div className="price-container">
                        <span className="price">${currentPrice}</span>
                        <span
                          className={`price-change ${
                            isProfit ? "profit" : "loss"
                          }`}
                        >
                          {isProfit ? "+" : ""}${priceChange.toFixed(2)} (
                          {isProfit ? "+" : ""}
                          {priceChangePercent}%)
                        </span>
                      </div>
                    </div>
                    <div className="stock-details">
                      <p>
                        <strong>Seller:</strong> {stock.sellername}
                      </p>
                      <p>
                        <strong>Purchase Price:</strong> ${purchasePrice}
                      </p>
                      <p>
                        <strong>Current Price:</strong> ${currentPrice}
                      </p>
                      {stock.description && (
                        <p>
                          <strong>Description:</strong> {stock.description}
                        </p>
                      )}
                      <p>
                        <strong>Purchase Date:</strong>{" "}
                        {new Date(stock.purchase_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="stock-actions">
                      <button
                        className="btn btn-danger"
                        onClick={() => sellStock(stock.id)}
                      >
                        Sell Stock
                      </button>
                    </div>
                  </div>
                );
              })}
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
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
    id: localStorage.getItem("userId"),
    username: localStorage.getItem("username"),
  });
  const [page, setPage] = useState("loading");

  useEffect(() => {
    if (auth.token) {
      setPage(auth.role === "admin" ? "admin" : "user");
    } else {
      setPage("login");
    }
  }, [auth]);

  switch (page) {
    case "login":
      return <Login setAuth={setAuth} navigate={setPage} />;
    case "admin":
      return <AdminDashboard auth={auth} navigate={setPage} />;
    case "user":
      return <UserDashboard auth={auth} navigate={setPage} />;
    default:
      return <div className="loading">Loading...</div>;
  }
}
