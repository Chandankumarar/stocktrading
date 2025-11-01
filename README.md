# Stock Trading Platform

A full-stack web application for stock trading with role-based authentication. Users can browse and buy stocks, while admins can manage the stock inventory.

## Features

### 🔐 Authentication System
- **User Registration/Login**: Choose between User or Admin account types
- **Role-based Access**: Different interfaces for users and admins
- **Secure Token-based Authentication**: JWT-like token system

### 👤 User Features
- **Browse Available Stocks**: View all stocks with search functionality
- **Buy Stocks**: Purchase stocks and add them to portfolio
- **Portfolio Management**: View purchased stocks with purchase dates
- **Sell Stocks**: Remove stocks from portfolio
- **Search Stocks**: Find stocks by name or seller

### 👨‍💼 Admin Features
- **Stock Management**: Add, edit, and delete stocks
- **Search Functionality**: Find stocks quickly
- **Stock Details**: Manage stock name, price, seller, and description
- **Real-time Updates**: Changes reflect immediately

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **mysql2** for database connectivity
- **CORS** for cross-origin requests

### Frontend
- **React** with modern hooks
- **CSS3** with responsive design
- **Fetch API** for HTTP requests

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- Git

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd crud
```

### 2. Database Setup
1. Start your MySQL server
2. Create a database named `stockdb`
3. Run the database setup script:
```bash
mysql -u root -p stockdb < database_setup.sql
```

### 3. Backend Setup
```bash
cd server
npm install
npm start
```
The backend will run on `http://localhost:8000`

### 4. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`

## Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `password`: User password
- `role`: 'user' or 'admin'
- `token`: Authentication token
- `created_at`: Account creation timestamp

### Stocks Table
- `id`: Primary key
- `stockname`: Stock name
- `price`: Stock price (decimal)
- `sellername`: Seller company name
- `description`: Stock description
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Portfolio Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `stock_id`: Foreign key to stocks table
- `purchase_date`: When stock was purchased
- Unique constraint on (user_id, stock_id)

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Stocks (Public)
- `GET /api/stocks?search=term` - Get all stocks (with optional search)

### Admin Only
- `POST /api/admin/stocks` - Add new stock
- `PUT /api/admin/stocks/:id` - Update stock
- `DELETE /api/admin/stocks/:id` - Delete stock
- `GET /api/admin/stocks/:id` - Get single stock

### User Portfolio
- `POST /api/buy/:id` - Buy a stock
- `GET /api/portfolio` - Get user's portfolio
- `DELETE /api/portfolio/:id` - Sell a stock

## Default Accounts

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full stock management capabilities

### User Account
- **Username**: `user`
- **Password**: `user123`
- **Access**: Browse and buy stocks

## Usage Guide

### For Users
1. **Login/Register**: Choose "User" account type
2. **Browse Stocks**: View available stocks on the main tab
3. **Search**: Use the search bar to find specific stocks
4. **Buy Stocks**: Click "Buy Stock" to add to portfolio
5. **View Portfolio**: Switch to "My Portfolio" tab to see purchased stocks
6. **Sell Stocks**: Click "Sell Stock" to remove from portfolio

### For Admins
1. **Login**: Use admin credentials
2. **Add Stocks**: Click "Add Stock" to create new stock entries
3. **Edit Stocks**: Click "Edit" on any stock card to modify details
4. **Delete Stocks**: Click "Delete" to remove stocks
5. **Search**: Use search bar to quickly find stocks

## Project Structure
```
crud/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main application component
│   │   ├── App.css        # Styling
│   │   └── main.jsx       # React entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── index.js           # Express server
│   └── package.json
├── database_setup.sql     # Database initialization script
└── README.md              # This file
```

## Features Implemented

✅ **Authentication System**
- User/Admin role selection during registration
- Secure login with token-based authentication
- Role-based access control

✅ **Admin Dashboard**
- Add new stocks with full details
- Edit existing stock information
- Delete stocks with confirmation
- Search functionality across all stocks
- Responsive modal forms

✅ **User Dashboard**
- Browse available stocks
- Search stocks by name or seller
- Buy stocks (prevents duplicate purchases)
- Portfolio management with purchase dates
- Sell stocks from portfolio
- Tab-based navigation

✅ **Search Functionality**
- Real-time search for both admin and user
- Search by stock name or seller name
- Case-insensitive search

✅ **Database Integration**
- MySQL database with proper relationships
- Foreign key constraints
- Indexes for performance
- Sample data included

## Security Features

- **Input Validation**: All forms validate required fields
- **SQL Injection Protection**: Parameterized queries
- **Role-based Access**: Admin endpoints protected
- **Token Authentication**: Secure API access
- **CORS Configuration**: Proper cross-origin setup

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Future Enhancements

- Password hashing with bcrypt
- Real-time stock price updates
- Transaction history
- Stock charts and analytics
- Email notifications
- Advanced search filters
- Stock categories
- User profiles and settings

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL server is running
   - Check database credentials in `server/index.js`
   - Verify database `stockdb` exists

2. **Port Already in Use**
   - Backend runs on port 8000
   - Frontend runs on port 5173
   - Change ports in respective config files if needed

3. **CORS Errors**
   - Ensure backend is running before frontend
   - Check that API calls use correct endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
