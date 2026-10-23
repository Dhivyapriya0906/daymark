# Daymark Task Manager

A full-stack task manager with private, user-owned tasks, searchable filters, task statistics, and JWT authentication.

## Stack and layout

- Backend: Java 17, Spring Boot 3.5, Spring Security, JPA, MySQL 8, JJWT, Bean Validation.
- Frontend: React, Vite, React Router, Axios, responsive CSS.
- `backend/` Spring application; `frontend/` React application.

## Requirements and database

Install Java 17, Maven 3.9+, Node.js 20+, npm, and MySQL 8. Create the database:

```sql
CREATE DATABASE task_manager_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

The application uses Hibernate `update` for local development and never drops tables. Use migrations and a managed database configuration for production.

## Configure and run

Set backend environment variables in your terminal (PowerShell example):

```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your-local-db-password"
$env:JWT_SECRET="(generate a random value of at least 32 bytes)"
```

Generate a key with `openssl rand -base64 48`; set the resulting value as `JWT_SECRET`. Keep secrets out of source control. Optional: `DB_URL` (defaults to `jdbc:mysql://localhost:3306/task_manager_db?createDatabaseIfNotExist=true&serverTimezone=UTC`), `SERVER_PORT` (8080), `JWT_EXPIRATION_MS` (86400000).

```powershell
cd backend
mvn spring-boot:run
```

In a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open http://localhost:5173. The frontend API base defaults to `http://localhost:8080/api`; override with `VITE_API_BASE_URL` in `frontend/.env`.

## API

All task routes require `Authorization: Bearer <token>`. JSON request bodies are validated. Task IDs belonging to another account return 404.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register `{ "name", "email", "password" }` |
| POST | `/api/auth/login` | Login `{ "email", "password" }`; returns token and safe user |
| GET | `/api/auth/me` | Current user |
| GET | `/api/tasks` | List; optional `status`, `priority`, `search` query filters |
| GET | `/api/tasks/stats` | Current user's total, pending, inProgress, completed |
| GET | `/api/tasks/{id}` | Read owned task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Replace task fields |
| DELETE | `/api/tasks/{id}` | Delete owned task |

Task fields: `title` (required, max 160), `description` (max 4000), `dueDate` (`YYYY-MM-DD`, optional, today or later), `status` (`PENDING`, `IN_PROGRESS`, `COMPLETED`), and `priority` (`LOW`, `MEDIUM`, `HIGH`).

Example:

```sh
curl -X POST http://localhost:8080/api/auth/register -H 'Content-Type: application/json' -d '{"name":"Alex Morgan","email":"alex@example.com","password":"change-this-password"}'
curl -X POST http://localhost:8080/api/tasks -H 'Authorization: Bearer TOKEN' -H 'Content-Type: application/json' -d '{"title":"Prepare project brief","description":"Outline the first milestones","dueDate":"2027-01-20","status":"PENDING","priority":"HIGH"}'
```

## Security and data

Passwords are hashed with BCrypt. JWTs are signed and checked for signature and expiry. Task ownership comes from the authenticated principal, never a client-supplied owner ID. CORS allows the Vite local origin. For this learning app, the browser stores the access token in `sessionStorage`: it is cleared when the tab session ends but remains accessible to same-origin JavaScript, so an XSS vulnerability could expose it. This is not automatically production-secure; production deployments should consider an appropriate HttpOnly, Secure, SameSite cookie design, HTTPS, CSRF protections for cookie auth, rate limiting, secret rotation, and database migrations.

Users have many tasks through a required many-to-one task owner relation. Enum values are stored as strings. Creation/update timestamps are UTC instants; due dates are calendar dates.

## Verification

```sh
cd backend && mvn test
cd frontend && npm install && npm run build
```

MySQL must be running with the configured credentials for backend startup or runtime API checks. No external credentials are included. API is Postman-compatible; import the endpoints above and use a login token as a Bearer token.

## Troubleshooting and deployment

- Backend startup fails on JWT configuration: set `JWT_SECRET` to a random value of at least 32 UTF-8 bytes.
- MySQL connection errors: start MySQL, create `task_manager_db`, and check `DB_USERNAME`, `DB_PASSWORD`, and `DB_URL`.
- Browser network/CORS error: run Vite at `localhost:5173` or update the backend CORS origin and restart.
- For GitHub, commit the source and `.env.example` only; never commit `.env` or production secrets. Deploy the API and static frontend over HTTPS, set environment variables in the hosting platform, configure its frontend origin in CORS, and use managed MySQL plus schema migrations for production.

## GitHub and deployment guidance

Push this folder to a private or public GitHub repository after checking that environment files and credentials are excluded. Deploy the backend to a Java 17 host, the frontend as a static Vite build, and connect a managed MySQL 8 database. Configure the Vite API URL and backend CORS origin to match the deployed domains.
