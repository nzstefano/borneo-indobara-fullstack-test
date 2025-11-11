# Borneo Indobara – Full Stack Developer Coding Test

**Architecture overview**

- **api-express/** — Single backend for this test:
  - **JWT auth** (login, me, update self) using Express + bcrypt + HS256
  - **To-Dos REST API** (in-memory) with audit logging
  - **Audit logs** record who/what/when/changes
- **frontend/** — Vue 3 + Vite + Tailwind:
  - Login + protected routes
  - Dashboard with profile auto-save (debounced 2s / blur)
  - Todos UI + Logs UI
- **api-laravel/** — _Independent_ demo API (nice-to-have only):
  - `/api/users` → **paginated** users with **posts**
  - Not connected to JWT/Express; used to demonstrate Laravel modeling

## How each requirement is satisfied

### Q1 – Vue UserProfile (30 pts)

- Vue 3 Composition API, controlled inputs
- Debounce **2s** after last keystroke; **blur** triggers immediate save
- Toast flow via SweetAlert2: **Saving…** → **Saved!** / error
- One re-fetch to keep navbar/dashboard in sync (no flicker)

### Q2 – Express REST (25 pts)

- `/todos` CRUD (POST/GET/PATCH/DELETE) with validation + field whitelist
- In-memory repos by design (fast for the test)
- **Audit logs** for create/update/delete: `{ actor, action, entityId, changes, at }`

### Q3 – Full-stack JWT (30 pts)

- **All auth is in Express**:
  - `POST /auth/login` verifies bcrypt hash and returns **JWT (HS256)**
  - `GET /auth/me` and `PUT /auth/me` require `Authorization: Bearer <token>`
- Frontend stores token (for test simplicity) and protects routes; navbar reflects auth state
- Notes for prod hardening (short-lived access, refresh cookie) are optional; the test flow uses **Express-only JWT**

### Q4 – Laravel API (15 pts, standalone)

- `GET /api/users` paginated users + posts, eager loaded, Resources shape output
- SQLite for quick start; no coupling with Express/Frontend

## Run

### Express API

```bash
cd api-express
cp .env.example .env            # set JWT_SECRET; restrict CORS_ORIGIN if needed
yarn && yarn dev                # http://127.0.0.1:4000
```

Endpoints:

- `POST /auth/login` → login user and return JWT
- `GET /auth/me` → get current user info
- `PUT /auth/me` → update current user info
- `GET /todos` → get all todos
- `POST /todos` → create a new todo
- `PATCH /todos/:id` → update a todo
- `DELETE /todos/:id` → delete a todo
- `GET /audit/logs?limit=50` → get latest audit logs

### Vue Frontend

```bash
cd frontend
cp .env.example .env
yarn && yarn dev
# http://localhost:5173
```

### Laravel API (optional)

```bash
cd ../api-laravel
composer install
cp .env.example .env && php artisan key:generate
mkdir -p database && touch database/database.sqlite

# in .env: DB_CONNECTION=sqlite, DB_DATABASE=database/database.sqlite

php artisan migrate --seed
php artisan serve --port=8081

# test: http://127.0.0.1:8081/api/users?per_page=5&page=1
```
