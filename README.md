# 📚 Learning Management System (LMS) API

A **scalable, secure, and production-ready** Learning Management System backend built with **Node.js, Express, Prisma, PostgreSQL, Redis, and BullMQ**.

This system supports **course management, batch automation, payments, notifications, tagging, analytics, and admin monitoring** with enterprise-level architecture.

---

## 🚀 Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Email verification
- Password reset flow
- Role-based access control (USER / ADMIN / SUPER_ADMIN)
- Multi-session support

### 🎓 Course & Batch Management

- CRUD for courses, batches, and classes
- Course tagging system
- Automatic batch & course status updates
- Enrollment window validation

### 💳 Payment System

- Manual payment submission
- Admin verification/rejection
- Enrollment after verification
- Payment notifications
- Email queue support

### 🏷 Tag System

- Centralized tags
- Attach/detach tags to courses
- Filter courses by tags
- Paginated tag listing

### 🔔 Notification System

- In-app notifications
- Class reminders
- Payment status updates
- Read/unread tracking
- Dedupe protection

### ⚙ Automation (BullMQ + Redis)

- Batch & course status automation
- Class reminder jobs
- Retry & backoff strategy
- Distributed job workers

### 🛡 Security

- Helmet security headers
- Rate limiting
- CORS protection
- Input validation
- XSS/CSRF mitigation
- Request sanitization

### 📊 Admin Dashboard Support

- Log management
- User management
- System analytics
- Log download & cleanup

### 📁 Logging

- Winston + Daily Rotation
- Error logs
- HTTP logs
- Production-ready logging pipeline

---

## 🧱 Tech Stack

| Layer      | Technology         |
| ---------- | ------------------ |
| Backend    | Node.js + Express  |
| Database   | PostgreSQL         |
| ORM        | Prisma             |
| Queue      | BullMQ + Redis     |
| Auth       | JWT                |
| Validation | Zod                |
| Logging    | Winston            |
| Security   | Helmet, Rate Limit |
| Docs       | OpenAPI (Manual)   |

---

## 📂 Project Structure

```text
src/
├── configs/
├── middleware/
├── modules/
│   ├── auth/
│   ├── admin/
│   ├── user/
│   ├── course/
│   ├── batch/
│   ├── class/
│   ├── payment/
│   ├── tag/
│   └── notification/
├── jobs/
├── utils/
├── app.ts
└── server.ts
```

### ⚙ Installation

### 1️⃣ Clone Repository

```
git clone https://github.com/yourusername/lms-api.git
cd lms-api
```

### 2️⃣ Install Dependencies

```
npm install
```

### 3️⃣ Environment Setup

```
DATABASE_URL="postgresql://postgres:5267@localhost:5432/crypto_lms?schema=public"

NODE_ENV = development
PORT=5000
ADMIN_EMAIL=mahadiul09@gmail.com

JWT_ACCESS_SECRET=your_jwt_secret

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

SMTP_USER=smtp_user
SMTP_PASS=smtp_pass

FRONTEND_URL=http://localhost:5173

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# Logging
LOG_LEVEL=info
LOG_RETENTION_DAYS=7
```

### 4️⃣ Database Setup

```
npx prisma migrate dev
npx prisma generate
```

### 5️⃣ Start Redis

```
redis-server
```

### 6️⃣ Start Server

#### Development

```
npm run dev
```

#### Production

```
npm run build
npm run start
```

### 🔑 Authentication

##### All protected route require:

```
Authorization: "Bearer <access_token>"
```

### 📡 API Base URL

```
http:localhost:5000/api
```

### 📘 API Modules

#### Auth

```
POST   /auth/register
POST   /auth/login
POST   /auth/verify-email
POST   /auth/reset-password
POST   /auth/refresh-token
POST   /auth/logout
```

#### User

```
GET    /user/me
PUT    /user/profile
PUT    /user/wallets
```

#### Course

```
GET    /course
GET    /course/:id
POST   /course        (Admin)
PUT    /course/:id    (Admin)
DELETE /course/:id    (Admin)
```

#### Batch

```
GET    /batch/public
GET    /batch/my
GET    /batch          (Admin)
POST   /batch          (Admin)
```

#### Class

```
GET    /class/my
GET    /class          (Admin)
POST   /class          (Admin)
```

#### Payment

```
POST   /payment
GET    /payment/my
PUT    /payment/payments/:id/verify   (Admin)
PUT    /payment/payments/:id/reject   (Admin)
```

#### Tags

```
GET    /tag
POST   /tag
GET    /tag/course/:courseId
POST   /tag/course/:courseId
DELETE /tag/course/:courseId
```

#### Notifications

```
GET    /notification
PATCH  /notification/:id/read
DELETE /notification/:id
```

#### admin

```
GET    /admin/logs
GET    /admin/users
GET    /admin/analytics
DELETE /admin/user/:id
```

### 🔔 Automation System

### Status Automation

Runs every 5 minutes:

- Updates batch status

- Activates courses

- Notifies users

### Class Reminders

Runs every hour:

- Sends reminders for upcoming classes

### Payment Events

- Verified → Enrollment + Notification

- Rejected → Notification

- Submitted → Admin email

### 📊 Analytics

Admin analytics include:

- User growth

- Revenue

- Enrollment stats

- Payment success rate

- Active courses

### 🔐 Security Practices

✔ Helmet headers

✔ Strict rate limiting

✔ Token rotation

✔ Input validation

✔ Encrypted passwords

✔ XSS/CSRF protection

✔ Secure cookies (optional)

### 📈 Production Recommendations

Before deployment:

- Enable HTTPS

- Use PM2 / Docker

- Enable Redis persistence

- Use managed PostgreSQL

- Enable centralized logging

- Set up monitoring (Prometheus/Grafana)

### 📄 License

MIT License

### 🤝 Contribution

1. Fork repo

2. Create feature branch

3. Commit changes

4. Open Pull Request

### 📬 Support

For issues, open a GitHub issue or contact:

Maintainer: mahadiul09@gmail.com

### ✅ System Status

This LMS backend is:

✔ Modular

✔ Scalable

✔ Secure

✔ Production-Ready

✔ Enterprise-Oriented
