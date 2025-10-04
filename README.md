# Jira Integration Backend

Backend service for the **Jira Integration** project.
This service is responsible for syncing projects and issues from Jira, storing issues/projects and an audit trail of changes, serving the frontend via REST APIs, and providing Excel export endpoints. Syncs can be run manually (endpoint) or automatically via a scheduled cron job.

---

## How it helps

The backend fetches Jira data, persists records (issues, projects) and stores every change in an audit log so teams can track who changed what and when — useful for accountability, compliance, root-cause analysis, and historical record-keeping.

---

## 🚀 Features

- Manual **Sync Now** endpoint to fetch & persist projects and issues from Jira
- Scheduled **daily auto-sync** (cron) to keep data up-to-date
- Stores **audit trail** entries for each change (who, what, when, old/new values)
- REST APIs for Issues, Projects, Audit Trail (supports filters, pagination)
- Excel/CSV export endpoints for Issues, Projects, and Audit Trail
- Basic health & metrics endpoints
- Docker-ready and production-friendly

---

## Quick Start (development)

### Prerequisites

- Node.js v16+ (or the version your project targets)
- npm / yarn
- PostgreSQL (or compatible SQL DB)
- Jira account + API token (if using Jira Cloud) or Jira server URL + credentials

### Install & Run

```bash
git clone https://github.com/Sudhakarselvam12/jira-integration-backend.git
cd jira-integration-backend

npm install
# or
yarn

# create .env (example below) then run dev
npm run dev
# or
yarn dev
```

Dev server typically runs on http://localhost:3001 (or the PORT in your .env).

---

## Environment Variables

Create a `.env` file in the project root. **Do not commit** your real `.env` file — add it to `.gitignore`.

Below are the variables this project expects (values redacted for security):

```env
# Server
PORT=3001
NODE_ENV=dev
CORS_ORIGIN=http://localhost:5173

# Database (Postgres)
DB_HOST=<db host>
DB_PORT=<port no>
DB_USER=<db user>
DB_PASS=<db password>
DB_NAME=<db name>

# Jira API credentials
JIRA_USER_MAIL=<your jira mail>
JIRA_API_TOKEN=<your jira api token>
JIRA_BASE_URL=https://yourdomain.atlassian.net

# Cron schedules (cron expressions)
PROJECT_SYNC_SCHEDULE="0 0 * * *"
ISSUE_SYNC_SCHEDULE="30 0 * * *"
```

---

## Folder Structure
```bash
src/
├── api/
│   └── controllers/ # route handlers for project, issues and audit trail separately
├── common/ # common helper file across modules
├── db/
│   ├── migrations/
│   └── models/ # ORM models (TypeORM)
├── routes/
├── services/ # contains implementation logic from project, issues and audit trail separately
├── workers/
│   └── sync-worker.ts # cron job - to sync projects and issues on daily basis
├── config/
│   └── index.ts # env config loader
├── app.ts # express
└── server.ts # start server

```

---

## 🧩 API Structure

Base path: `http://localhost:3001/api`

### 🗂️ Projects
| Method | Endpoint | Description |
|:--------|:-----------|:-------------|
| GET | `/projects` | Fetch all Jira projects stored in the database |
| GET | `/projects/count` | Retrieve total count of projects |
| GET | `/projects/export` | Export all project data as an Excel file |

### 🧾 Issues
| Method | Endpoint | Description |
|:--------|:-----------|:-------------|
| GET | `/issues` | Fetch all Jira issues with filters and pagination |
| GET | `/issues/filteroptions` | Get available filter values (e.g., status, assignee, priority) |
| GET | `/issues/count` | Retrieve total issue count |
| GET | `/issues/export` | Export all issues as an Excel file |

### 🕵️ Audit Trail
| Method | Endpoint | Description |
|:--------|:-----------|:-------------|
| GET | `/audit` | Fetch all audit trail entries |
| GET | `/audit/filteroptions` | Get available filters for audit data (e.g., user, action type, date range) |
| GET | `/audit/count` | Retrieve total audit entry count |
| GET | `/audit/export` | Export all audit logs as an Excel file |

### 🔄 Jira Sync
| Method | Endpoint | Description |
|:--------|:-----------|:-------------|
| POST | `/sync/projects` | Manually trigger Jira Project synchronization |
| POST | `/sync/issues` | Manually trigger Jira Issue synchronization |

Each sync endpoint calls the `JiraSyncService`, which communicates with the Jira API, fetches data, and updates local database tables (`projects`, `issues`, `audit_trail`, etc.).

### 💓 Health Check
| Method | Endpoint | Description |
|:--------|:-----------|:-------------|
| GET | `/health` | Basic API health status (service uptime, timestamp) |

---

## 🧮 Database Schema Overview

| Table | Purpose |
|:------|:---------|
| `project` | Stores Jira project metadata |
| `issue` | Stores Jira issue data |
| `audit_trail` | Tracks changes, sync actions, and assignments |
| `sync_metadata` | Records each sync attempt and result for projects and issues |

---

## 🕒 Cron Jobs

| Job | Schedule | Description |
|:----|:----------|:-------------|
| **Project Sync** | `0 0 * * *` | Syncs all Jira projects daily |
| **Issue Sync** | `30 0 * * *` | Syncs all Jira issues daily |

🔹 *Manual sync* is also available anytime via the API endpoints:
- `POST /sync/projects`
- `POST /sync/issues`

---

## 🧱 Future Improvements

1. Add authentication & role-based access
2. Implement retry logic for Jira rate limits
3. Improve error logging

---

## 🪪 Author
Sudhakarselvam12
Contact: sudhakarselvam12@gmail.com
GitHub: https://github.com/Sudhakarselvam12

---

## 🤝 Contributing
1. Fork the repo
2. Create a branch: git checkout -b feature/<name>
3. Commit & push, then open a PR
Please follow the existing lint/format rules and include a short description of changes.
