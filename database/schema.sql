
use stockdb;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    role ENUM('user','admin') DEFAULT 'user'
);
CREATE DATABASE stock_db;

USE stock_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    role ENUM('user','admin') DEFAULT 'user'
);

CREATE TABLE stocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stockname VARCHAR(100),
    price DECIMAL(10,2),
    sellername VARCHAR(50)
);

CREATE TABLE portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    stock_id INT,
    stockname VARCHAR(100),
    price DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (stock_id) REFERENCES stocks(id)
);

-- Add sample data
INSERT INTO users (username, password, role) VALUES ('admin', 'admin', 'admin'), ('user1', 'user1', 'user');
portfolioINSERT INTO stocks (stockname, price, sellername) VALUES ('Apple', 150, 'SellerA'), ('Tesla', 800, 'SellerB');

select *from users;
users