# Timesticks

A personal productivity app for managing tasks, habits, and lists — with priority filters, overdue tracking, streak counters, and email-verified accounts.

Heavily inspired by [TickTick](https://ticktick.com), which I use every single day. Built this to understand how something like it actually works under the hood.

> **Frontend note:** The entire frontend is vibe-coded using [Antigravity IDE](https://antigravity.dev). I'm still learning React and wanted to ship something real, so I coded the backend myself and let Antigravity handle the frontend. It was a great way to move fast while focusing on what I actually wanted to learn.

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
| Email | Nodemailer (OTP delivery) |
| Deployment | Render (free tier) |

---

### Project Structure

```
timesticks_backend/
└── src/
    ├── app.js               # Express app setup, CORS, middleware, route mounting
    ├── server.js            # Entry point — connects to DB and starts server
    ├── config/              # DB connection config
    ├── constants/           # Task limits for free vs premium users
    ├── controllers/         # Business logic
    │   ├── auth.controller.js
    │   ├── task.controller.js
    │   ├── habit.controller.js
    │   └── list.controller.js
    ├── middlewares/
    │   └── requireAuth.js   # JWT verification + email-verified guard
    ├── models/              # Mongoose schemas
    │   ├── user.model.js
    │   ├── task.model.js
    │   ├── habit.model.js
    │   ├── list.model.js
    │   └── otp.model.js
    ├── routes/              # Express routers
    │   ├── auth.routes.js
    │   ├── task.routes.js
    │   ├── habit.routes.js
    │   └── list.routes.js
    └── utils/
        ├── dateUtils.js           # Timezone-aware date helpers
        ├── generateToken.js       # JWT creation + cookie setter
        ├── generateAndSendOTP.js  # OTP hashing + email dispatch
        └── sendMail.js            # Nodemailer wrapper
```

---

### API Reference

All protected routes require a valid `jwt` httpOnly cookie. The frontend also sends an `x-timezone` header (IANA timezone string) on every request so the backend can compute dates in the user's local time.

#### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
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

### Data Models

#### User
```js
{
  fullName:        String,   // 5–20 alpha chars
  email:           String,   // unique
  password:        String,   // bcrypt hashed
  havePremium:     Boolean,  // default false
  isEmailVerified: Boolean,  // must be true to access protected routes
  timestamps:      true
}
```

#### Task
```js
{
  user:        ObjectId → User,
  list:        ObjectId → List,
  title:       String,          // max 50 chars
  description: String,          // max 250 chars
  done:        Boolean,
  priority:    'High' | 'Medium' | 'Low',
  dueDate:     Date,
  timestamps:  true
}
```

#### Habit
```js
{
  user:          ObjectId → User,
  title:         String,        // max 50 chars
  description:   String,        // max 250 chars
  currentStreak: Number,
  highestStreak: Number,
  todayStatus:   Boolean,       // reset daily based on user timezone
  history: [{ date: 'YYYY-MM-DD', completed: Boolean }],
  timestamps: true
}
```

#### List
```js
{
  user:      ObjectId → User,
  title:     String,
  isDefault: Boolean,           // true for the auto-created Inbox
  timestamps: true
}
```

#### OTP
```js
{
  userId:    ObjectId → User,
  otp:       String,    // bcrypt hashed 6-digit code
  expiresAt: Date,      // 10 minutes from creation
  timestamps: true
}
```

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
```

---

### Environment Variables

```env
PORT=8000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

### Running Locally

```bash
cd timesticks_backend
npm install
# create a .env file with the vars above
npm run dev
```

The server starts on `http://localhost:8000`. Health check: `GET /health`.
