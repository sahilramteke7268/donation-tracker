# 💝 Donation Tracking System

A full-stack donation tracking platform that allows users to donate to fundraising campaigns and view live statistics — no login or signup required.

**Live Demo:** [donation-tracker-yvgf.onrender.com](https://donation-tracker-yvgf.onrender.com/index.html)  
**Admin Panel:** [donation-tracker-yvgf.onrender.com/admin.html](https://donation-tracker-yvgf.onrender.com/admin.html)

> Hosted on free tiers, so the first load after a period of inactivity can take up to a minute while the server wakes up.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js + Express.js |
| Database | MySQL (mysql2 driver, connection pool) |
| App hosting | Render (free tier) |
| Database hosting | Aiven for MySQL (free plan) |

---

## 📁 Project Structure

```
donation-tracker/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── db.js                  # MySQL connection pool
│   └── routes/
│       ├── campaigns.js       # Campaign listing APIs
│       ├── donations.js       # Donation submission + dashboard stats
│       └── admin.js           # Admin analytics + campaign management
├── frontend/
│   ├── index.html             # Main donor-facing page
│   ├── admin.html             # Admin panel
│   ├── style.css              # Responsive styling
│   ├── app.js                 # Frontend logic for donor page
│   └── admin.js               # Frontend logic for admin panel
├── package.json
└── README.md
```

---

## ⚙️ Local Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/sahilramteke7268/donation-tracker.git
cd donation-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup MySQL Database
Open MySQL Workbench and run:
```sql
CREATE DATABASE donation_tracker;
USE donation_tracker;

CREATE TABLE campaigns (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  goal_amount DECIMAL(10,2) NOT NULL,
  total_raised DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE donations (
  id VARCHAR(36) PRIMARY KEY,
  campaign_id VARCHAR(36) NOT NULL,
  donor_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

INSERT INTO campaigns (id, name, description, goal_amount) VALUES
('c1', 'Feed the Hungry', 'Providing meals to underprivileged communities', 50000),
('c2', 'Education for All', 'Funding school supplies and scholarships', 75000),
('c3', 'Plant a Tree', 'Reforestation and environmental restoration', 30000),
('c4', 'Medical Relief Fund', 'Emergency healthcare for those in need', 100000);
```

### 4. Configure database connection
The app reads one connection URL from the `DATABASE_URL` environment variable (see `backend/db.js`):

```bash
# macOS / Linux
export DATABASE_URL="mysql://root:your_password@localhost:3306/donation_tracker"

# Windows PowerShell
$env:DATABASE_URL = "mysql://root:your_password@localhost:3306/donation_tracker"
```

Hosted databases such as Aiven require SSL, which `db.js` enables by default. For a local MySQL server without SSL, also set `DB_SSL=false`.

### 5. Start the server
```bash
node backend/server.js
```

### 6. Open in browser
```
http://localhost:3000/index.html
http://localhost:3000/admin.html
```

---

## 🔌 API Endpoints

### Campaigns
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/campaigns` | Get all campaigns |
| GET | `/api/campaigns/:id` | Get single campaign by ID |

### Donations
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/donations` | Submit a new donation |
| GET | `/api/donations/stats/dashboard` | Get overall stats, recent donations, top donors |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/donations` | Get all donations with campaign names |
| GET | `/api/admin/analytics` | Get per-campaign analytics |
| PATCH | `/api/admin/campaigns/:id/close` | Close a campaign |
| PATCH | `/api/admin/campaigns/:id/reopen` | Reopen a campaign |

---

## ✅ Features Implemented

### Donor-Facing
- View all active fundraising campaigns with progress bars
- Donate without login — just name, email, amount, and campaign
- Live dashboard showing total donations, total raised, and average donation
- Leaderboard ranking top donors by total contribution
- Recent donations feed with masked email privacy

### Admin Panel
- View all donations in real time with full donor details
- Campaign analytics: goal, raised, donation count, progress percentage
- Close and reopen campaigns with one click
- Download all donations as a CSV file

### Backend & Data
- RESTful API design with proper HTTP status codes
- Full input validation on both frontend and backend
- Parameterized SQL queries preventing SQL injection
- Donor emails masked on public leaderboard (e.g. `sa***@***.com`)
- Error handling for all API routes with meaningful messages

---

## 🛡️ Concurrency Handling

When multiple users donate simultaneously, race conditions are prevented using database-level locking:

1. A **MySQL transaction** is started before processing
2. The campaign row is locked using `SELECT ... FOR UPDATE`
3. The donation is inserted safely
4. The campaign total is updated atomically using `total_raised = total_raised + ?`
5. The transaction is committed — or fully rolled back on any error

This keeps donation totals accurate when requests arrive concurrently.

---

## 🔐 Security & Privacy

- Donor emails are **masked** on the public leaderboard and recent donations feed
- Admin panel shows full unmasked details for monitoring purposes
- All database queries use **parameterized statements** to prevent SQL injection
- Input validation runs on both the client side and server side
- Database credentials are kept in environment variables, not in the repository
- The admin panel has no login, so this is a demo and not meant for real donor data

---

## 🏗️ Architecture Overview

```
Browser (HTML / CSS / JS)
        ↓  HTTP Requests
Express.js REST API (Node.js)
        ↓  SQL Queries (Parameterized)
MySQL Database (Connection Pool)
```

- Frontend communicates with the backend via fetch API using relative URLs (`/api/...`)
- Backend uses a **connection pool** (`connectionLimit: 10`) to handle concurrent requests efficiently
- All routes are modularized under `backend/routes/` for clean separation of concerns

---

## 📦 Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Full MySQL connection URL, e.g. `mysql://user:password@host:port/database` |
| `DB_SSL` | Set to `false` only for a local MySQL server without SSL |
| `PORT` | Server port (set automatically by Render; defaults to 3000 locally) |

---

## 🌐 Deployment

This project is deployed on **Render** (free web service) with a managed MySQL database on **Aiven** (free plan).

- Backend and frontend are served together from the same Express server
- Static frontend files are served via `express.static`
- `DATABASE_URL` is set in Render's environment settings and is never committed to the repository
- Auto-deploys on every push to the `main` branch via GitHub integration
