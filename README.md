# Timesticks

A personal productivity app for managing tasks, habits, and lists — with priority filters, overdue tracking, streak counters, and email-verified accounts.

Heavily inspired by [TickTick](https://ticktick.com), which I use every single day. Built this to understand how something like it actually works under the hood.

> **Frontend note:** The entire frontend is vibe-coded using [Antigravity IDE](https://antigravity.google/). I'm still learning React and wanted to ship something real, so I coded the backend myself and let Antigravity handle the frontend. It was a great way to move fast while focusing on what I actually wanted to learn.

---

## Backend

The backend is a REST API built with **Node.js + Express**, connected to **MongoDB Atlas** via Mongoose, and deployed on **Render**.

### Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (httpOnly cookies) + bcryptjs |
| Email | [Brevo](https://brevo.com) SMTP API via axios (OTP + transactional emails) |
| Deployment | Render (free tier) |

---

### API Reference

All protected routes require a valid `jwt` httpOnly cookie. The frontend also sends an `x-timezone` header (IANA timezone string) on every request so the backend can compute dates in the user's local time.

#### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/me` | ✓ | Verifies the JWT cookie on initial load. Returns the user object if the session is active. Crucial for preventing UI flashing and correctly handling cold starts. |
| `POST` | `/signup` | ✗ | Register a new user. Hashes password, sends OTP to email, sets JWT cookie, creates default Inbox list and welcome task. |
| `POST` | `/login` | ✗ | Authenticate user. Returns JWT cookie. |
| `POST` | `/logout` | ✗ | Clears the JWT cookie. |
| `POST` | `/verifyOTP` | ✗ | Verifies the 6-digit OTP sent on signup. Marks email as verified. |
| `POST` | `/resendOTP` | ✗ | Resends OTP to the registered email. |
| `POST` | `/resetPassword` | ✗ | Sends a password reset OTP to the provided email. |
| `POST` | `/resetPasswordVerification` | ✗ | Verifies reset OTP and updates the hashed password. Sends confirmation email. |

#### Tasks — `/api/task`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ✓ | Returns all tasks for the user, each annotated with a computed `relativeStatus`: `"Due Today"`, `"Overdue"`, or `"Upcoming"` (derived from the user's timezone). |
| `POST` | `/create` | ✓ | Creates a task. Validates title (≤50 chars), description (≤250 chars), rejects past due dates. Defaults due date to today if omitted. Enforces free/premium task count limits. |
| `PUT` | `/:taskId` | ✓ | Updates title, description, priority, due date, or list. |
| `PATCH` | `/:taskId/toggle` | ✓ | Toggles the `done` boolean. |
| `DELETE` | `/:taskId` | ✓ | Deletes a task. |

#### Habits — `/api/habit`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ✓ | Returns all habits for the user. Resets `todayStatus` if the last toggle was on a different calendar day (timezone-aware). |
| `POST` | `/create` | ✓ | Creates a new habit. |
| `PUT` | `/:habitId` | ✓ | Updates title and description. |
| `PATCH` | `/:habitId/toggle` | ✓ | Marks habit done/undone for today. Updates `currentStreak`, `highestStreak`, and appends to `history[]`. |
| `DELETE` | `/:habitId` | ✓ | Deletes a habit. |

#### Lists — `/api/list`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ✓ | Returns all lists for the user. |
| `POST` | `/create` | ✓ | Creates a named list (max 10 lists per user). |
| `PUT` | `/:listId` | ✓ | Renames a list (cannot rename the default Inbox). |
| `DELETE` | `/:listId` | ✓ | Deletes a list. If `deleteAllTasks=true` in body, also deletes all tasks in that list; otherwise moves them to the default Inbox. |

---

### Auth Flow

```
Signup
  → validate input
  → hash password
  → create User
  → generate + send OTP (hashed in DB)
  → set JWT cookie
  → create default Inbox list
  → create welcome task (due today in user's timezone)
  → return userId

Verify OTP
  → compare submitted OTP against hashed value
  → check expiry
  → mark isEmailVerified = true
  → delete OTP record

Login
  → find user by email
  → compare password
  → set JWT cookie
  → return user object

Protected routes
  → requireAuth middleware reads jwt cookie
  → verifies JWT signature
  → checks isEmailVerified
  → attaches user to req.user

Initial Load / Session Verification
  → App wraps routes in BackendWakeUp and Route Guards
  → If localStorage has user, frontend calls /api/auth/me
  → BackendWakeUp holds the UI while the server spins up
  → If /me succeeds, user proceeds to Dashboard smoothly
  → If /me fails (401/403), frontend clears localStorage and forces Login
```

---

### Environment Variables

```env
PORT=8000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FROM_USER=your_sender_email@domain.com
BREVO_API_KEY=your_brevo_api_key
```

---

### Running Locally

**Backend**

```bash
cd timesticks_backend
npm install
# create a .env file with the vars listed above
npm run dev
```

Server starts on `http://localhost:8000`. Health check: `GET /health`.

> ⚠️ **CORS:** `src/app.js` has the allowed origin hardcoded to the production URL. Before running locally, update it to allow `http://localhost:5173`:
> ```js
> app.use(cors({
>     origin: 'http://localhost:5173',
>     credentials: true,
> }));
> ```
> Or accept both at once:
> ```js
> app.use(cors({
>     origin: ['http://localhost:5173', 'https://timesticks.onrender.com'],
>     credentials: true,
> }));
> ```

---

**Frontend**

```bash
cd timesticks_frontend
npm install
```

Create a `.env` file inside `timesticks_frontend/`:

```env
VITE_API_URL=http://localhost:8000/api
```

> If you leave `VITE_API_URL` unset, the frontend defaults to `http://localhost:8000/api` automatically.

```bash
npm run dev
```

App starts on `http://localhost:5173` (or the next available port — Vite will tell you).
