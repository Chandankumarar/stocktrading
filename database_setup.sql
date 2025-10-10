-- Stock Trading Platform Database Setup
-- Run this script in your MySQL database to set up the required tables

-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS stockdb;
-- USE stockdb;

-- Users table for authentication
/*CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stocks table for stock information
CREATE TABLE IF NOT EXISTS stocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stockname VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    sellername VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Portfolio table for user stock holdings
CREATE TABLE IF NOT EXISTS portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    stock_id INT NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_stock (user_id, stock_id)
);*/


-- Insert sample admin user (password: admin123)
INSERT IGNORE INTO users (username, password, role, token) VALUES 
('admin', 'admin123', 'admin', 'admin_token_123');

-- Insert sample regular user (password: user123)
INSERT IGNORE INTO users (username, password, role, token) VALUES 
('user', 'user123', 'user', 'user_token_123');

-- Insert sample stocks
INSERT IGNORE INTO stocks (stockname, price, sellername, description) VALUES 
('Apple Inc.', 150.25, 'TechCorp', 'Leading technology company specializing in consumer electronics and software'),
('Microsoft Corp.', 300.50, 'TechCorp', 'Multinational technology corporation known for Windows and Office products'),
('Google LLC', 2800.75, 'TechCorp', 'Internet search and advertising technology company'),
('Tesla Inc.', 250.00, 'AutoCorp', 'Electric vehicle and clean energy company'),
('Amazon.com Inc.', 3200.00, 'RetailCorp', 'E-commerce and cloud computing giant'),
('Meta Platforms', 180.50, 'TechCorp', 'Social media and virtual reality technology company'),
('Netflix Inc.', 450.25, 'MediaCorp', 'Streaming entertainment service provider'),
('NVIDIA Corp.', 800.00, 'TechCorp', 'Graphics processing unit and AI computing company');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
CREATE INDEX IF NOT EXISTS idx_stocks_name ON stocks(stockname);
CREATE INDEX IF NOT EXISTS idx_stocks_seller ON stocks(sellername);
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_stock ON portfolio(stock_id);

-- Show table structures
DESCRIBE users;
DESCRIBE stocks;
DESCRIBE portfolio;

-- Show sample data
SELECT 'Users:' as Table_Name;
SELECT id, username, role, created_at FROM users;

SELECT 'Stocks:' as Table_Name;
SELECT id, stockname, price, sellername FROM stocks LIMIT 5;

SELECT 'Portfolio:' as Table_Name;
SELECT COUNT(*) as total_portfolio_entries FROM portfolio;
