/**
 * Base de données SQLite — Users & Progress
 */

const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../../devops-quest.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    username     TEXT    UNIQUE NOT NULL,
    email        TEXT    UNIQUE NOT NULL,
    password_hash TEXT   NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS progress (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL,
    step_id      TEXT    NOT NULL,
    xp           INTEGER NOT NULL DEFAULT 0,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, step_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    token      TEXT    UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used       INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

module.exports = db;
