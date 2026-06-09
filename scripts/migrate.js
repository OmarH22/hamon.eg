// scripts/migrate.js
const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')

const DB_PATH = process.env.DATABASE_PATH || './hamon.db'
const db = new Database(DB_PATH)

// Enable WAL mode for performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

console.log('🔧 Running HAMON database migrations...')

// Create waitlist table
db.exec(`
  CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
  CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

// Seed admin user
const adminUser = process.env.ADMIN_USERNAME || 'admin'
const adminPass = process.env.ADMIN_PASSWORD || 'hamon_admin_2024'

const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(adminUser)
if (!existing) {
  const hash = bcrypt.hashSync(adminPass, 12)
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(adminUser, hash)
  console.log(`✅ Admin user created: ${adminUser}`)
} else {
  console.log(`ℹ️  Admin user already exists: ${adminUser}`)
}

console.log('✅ Database migrations complete.')
db.close()
