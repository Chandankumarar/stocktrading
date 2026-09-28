
# Stock Trading Platform

A full-stack educational stock trading application built using React.js, Node.js, Express.js and MySQL.

The application provides separate user and admin interfaces. Users can browse available stocks, buy and sell stocks, and manage their portfolios. Administrators can add, edit and delete stock listings.

## Tech Stack

- Frontend: React.js, CSS
- Backend: Node.js, Express.js
- Database: MySQL
- API: REST

## Key Features

- User registration and login
- Role-based user and admin interfaces
- Stock browsing and search
- Buying and selling workflows
- Portfolio management
- Administrative stock management

## Development

This project was developed with AI assistance as a learning project. It demonstrates full-stack application structure, API integration and relational database usage.

It is intended for educational use and is not a production trading application.
  
## Local Setup

### Prerequisites

- Node.js
- MySQL Server
- Git

### Clone the repository

```bash
git clone https://github.com/Chandankumarar/stocktrading.git
cd stocktrading
```

### Database

Create the `stockdb` database and import the supplied setup script.

```bash
mysql -u root -p stockdb < database_setup.sql
```

### Backend

```bash
cd server
npm install
npm start
```

### Frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

The documented default development ports are 8000 for the backend and 5173 for the frontend.
  
## Security Notice

This is an educational application, not a production-ready financial platform.

The authentication implementation requires additional security hardening before real-world deployment.

Recommended improvements:

- Hash passwords using a suitable password-hashing algorithm.
- Remove default credentials and secrets from source code.
- Store configuration secrets in environment variables.
- Review token generation and validation.
- Add automated authentication and authorization tests.
- Review input validation and database access controls.

Do not use real financial information or reuse personal account passwords when testing this project.
  
