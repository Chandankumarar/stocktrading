# Stock Trading Platform

An AI-assisted educational full-stack stock trading application built with React, Node.js, Express, and MySQL. It simulates stock listings, purchases, sales, and portfolio management; **it does not execute real trades**.

## Features

- User registration and login with scrypt password hashing
- Stock search, simulated purchases and sales, and portfolio tracking
- Admin stock management and stock purchase analytics
- Company listing applications with admin approval and rejection
- REST APIs and relational database integration

## Tech Stack

- Frontend: React, CSS, Vite
- Backend: Node.js, Express
- Database: MySQL

## Local Setup

Requires Node.js, MySQL, and Git.

```bash
git clone https://github.com/Chandankumarar/stocktrading.git
cd stocktrading
mysql -u root -p < database_setup.sql
```

The SQL script creates `stockdb`, tables, and sample stocks. It does **not** create default user or admin accounts. For an existing database created using an older version, back up your data and add the missing portfolio purchase price column if necessary:

```sql
ALTER TABLE portfolio ADD COLUMN purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0;
```

In `server`, create a local `.env` file based on `server/.env.example` and set your own database credentials. Node.js 20+ supports `--env-file`:

```bash
cd server
cp .env.example .env
npm install
node --env-file=.env index.js
```

To create a local admin, register a standard user through the app first, then run this SQL **only on your own development database** (replace the example username):

```sql
UPDATE users SET role = 'admin' WHERE username = 'your-local-admin-username';
```

Log out and log back in to load the updated role. Never promote accounts from public requests.

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

The backend defaults to http://localhost:8000 and Vite commonly serves the frontend at http://localhost:5173. Public registration creates standard user accounts only; local admins are promoted explicitly in the development database.

**Existing users:** Accounts created by the earlier version stored plaintext passwords and cannot log in with the new hashed-password authentication. Back up existing data, remove or migrate those accounts securely, and recreate development accounts. Previously issued tokens should be invalidated.

## API Overview

- `POST /api/register`, `POST /api/login`
- `GET /api/stocks`, `POST /api/buy/:id`, `GET /api/portfolio`, `DELETE /api/portfolio/:id`
- `POST /api/applications`
- `GET /api/admin/applications`, `POST /api/admin/applications/:id/accept`, `POST /api/admin/applications/:id/reject`
- `GET /api/admin/stocks`, `POST /api/admin/stocks`, `PUT /api/admin/stocks/:id`, `DELETE /api/admin/stocks/:id`
- `GET /api/admin/stocks/:id/analytics`

Protected endpoints require `Authorization: Bearer <token>`; admin endpoints additionally check the account role.

## Security and Limitations

This is a learning project, **not a production-ready financial platform**. Passwords for newly registered accounts use scrypt and a per-user random salt; the database password is supplied through environment variables; public registration cannot grant admin privileges. Tokens are still stored in the database without expiration or rotation, and other security controls such as rate limiting, comprehensive validation, CSRF review, and automated security tests remain future work.

The old repository history contained a hardcoded database credential and example accounts. **Rotate any real or reused database password and invalidate old tokens**; deleting them from current files does not erase Git history. Never use real financial information in this demo.

## Development

Built with AI assistance as an educational project. Features and setup should be tested locally before deployment.
