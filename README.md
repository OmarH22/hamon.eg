# HAMON — Full Stack Landing Page + Admin Dashboard

A premium luxury fashion brand market validation system built with Next.js 14, SQLite, and Tailwind CSS.

## Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Recharts
- **Backend**: Next.js API Routes + better-sqlite3
- **Auth**: JWT via `jose` + httpOnly cookies
- **Email**: Resend API (or SMTP fallback)
- **Rate Limiting**: In-memory rate limiter
- **Export**: CSV + Excel (xlsx)

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your-min-32-char-secret-key-here

# Email (choose one)
RESEND_API_KEY=re_xxxxxxxxxxxx
# or SMTP_HOST / SMTP_USER / SMTP_PASS

EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=your@email.com

NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Initialize database
```bash
npm run db:migrate
```

### 4. Start development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## URLs

| Page | URL |
|------|-----|
| Landing Page | `/` |
| Admin Login | `/admin` |
| Admin Dashboard | `/admin/dashboard` |
| API: Join Waitlist | `POST /api/waitlist` |
| API: Get Stats | `GET /api/waitlist` |
| API: Get Leads | `GET /api/admin/leads` |
| API: Export CSV | `GET /api/admin/export?format=csv` |
| API: Export Excel | `GET /api/admin/export?format=xlsx` |
| API: Login | `POST /api/admin/login` |
| API: Logout | `DELETE /api/admin/login` |

---

## Database Schema

```sql
-- Waitlist entries
CREATE TABLE waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin users
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Page views (optional analytics)
CREATE TABLE page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Admin Dashboard Features

- **Overview**: Total/today/weekly/monthly signup counts + market validation progress bar
- **Leads Table**: Searchable, filterable by date range, paginated
- **Analytics**: Daily signups chart (area or bar), trend summary
- **Export**: One-click CSV and Excel export
- **Auth**: JWT-protected with 7-day sessions

Default admin credentials: `admin` / `hamon_admin_2024`  
**Change these in `.env.local` before deploying.**

---

## Email Setup

### Option A — Resend (recommended)
1. Sign up at [resend.com](https://resend.com)
2. Add domain and get API key
3. Set `RESEND_API_KEY=re_xxxxx` in `.env.local`

### Option B — Gmail SMTP
1. Enable 2FA on Gmail
2. Create App Password
3. Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=your@gmail.com`, `SMTP_PASS=xxxx`

---

## Production Deployment

### Vercel (recommended)
```bash
npm install -g vercel
vercel deploy
```

**Important for Vercel**: SQLite doesn't persist across serverless function invocations. For production with Vercel, switch to:
- [Turso](https://turso.tech/) (SQLite-compatible, free tier)
- [Supabase](https://supabase.com/) (PostgreSQL, free tier)
- [PlanetScale](https://planetscale.com/) (MySQL)

### VPS / DigitalOcean (SQLite works great)
```bash
# Build
npm run build

# Run migrations
npm run db:migrate

# Start with PM2
npm install -g pm2
pm2 start npm --name "hamon" -- start
pm2 startup
pm2 save
```

With Nginx reverse proxy:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then use Certbot for SSL:
```bash
sudo certbot --nginx -d yourdomain.com
```

---

## SEO

The landing page includes:
- Optimized `<title>` and `<meta description>`
- OpenGraph tags
- Twitter Card tags
- `robots: { index: true, follow: true }`
- Semantic HTML structure
- Google Fonts with `display: swap`

---

## Customization

### Brand Colors (tailwind.config.js)
```js
hamon: {
  black: '#0A0A0A',
  charcoal: '#2B2B2B',
  bg: '#F7F7F5',
  silver: '#C0C0C0',
  light: '#E8E8E6',
}
```

### Add Admin Password Reset
```bash
node -e "
const bcrypt = require('bcryptjs');
const db = require('better-sqlite3')('./hamon.db');
const hash = bcrypt.hashSync('NEW_PASSWORD', 12);
db.prepare(\"UPDATE admin_users SET password_hash = ? WHERE username = 'admin'\").run(hash);
console.log('Password updated');
"
```

---

## Security

- ✅ JWT auth with httpOnly cookies
- ✅ bcrypt password hashing (cost 12)
- ✅ Rate limiting on waitlist (3/hr) and login (10/15min)
- ✅ Email validation + duplicate prevention
- ✅ Admin routes protected by middleware
- ✅ Environment variables for all secrets
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection via React's escaping
