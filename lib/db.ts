import crypto from "crypto";
import { createRequire } from "module";

const DATABASE_URL = process.env.DATABASE_URL;

function toPostgresParams(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

interface Statement {
  run: (...args: any[]) => Promise<{ lastInsertRowid?: number }>;
  get: (...args: any[]) => Promise<any>;
  all: (...args: any[]) => Promise<any[]>;
}

export interface DbWrapper {
  prepare: (sql: string) => Statement;
  exec: (sql: string) => Promise<void> | void;
  query: (sql: string, args?: any[]) => Promise<any[]>;
}

declare global {
  // eslint-disable-next-line no-var
  var __dbWrapper: DbWrapper | undefined;
}

function buildPgWrapper(pool: any): DbWrapper {
  return {
    async query(sql, args = []) {
      const res = await pool.query(sql, args);
      return res.rows;
    },
    prepare(sql: string) {
      const pgSql = toPostgresParams(sql);
      return {
        async run(...args: any[]) {
          const res = await pool.query(pgSql, args);
          return { lastInsertRowid: res.rows[0]?.id };
        },
        async get(...args: any[]) {
          const res = await pool.query(pgSql, args);
          return res.rows[0];
        },
        async all(...args: any[]) {
          const res = await pool.query(pgSql, args);
          return res.rows;
        },
      };
    },
    exec(sql: string) {
      return pool.query(sql).catch(() => {});
    },
  };
}

function buildSqliteWrapper(): DbWrapper {
  const req = createRequire(import.meta.url);
  const { DatabaseSync } = req("node:sqlite");
  const fs = req("fs");
  const path = req("path");
  const DB_PATH = path.join(process.cwd(), "salon.db");

  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      price REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (business_id) REFERENCES businesses(id)
    );
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (business_id) REFERENCES businesses(id)
    );
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      client_name TEXT NOT NULL,
      client_phone TEXT,
      service_id INTEGER,
      employee_id INTEGER,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'confirmed',
      reminded INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (business_id) REFERENCES businesses(id),
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      plan TEXT NOT NULL DEFAULT 'mensual',
      status TEXT NOT NULL DEFAULT 'inactive',
      paypal_subscription_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (business_id) REFERENCES businesses(id)
    );
  `);
  try {
    db.exec("ALTER TABLE appointments ADD COLUMN reminded INTEGER NOT NULL DEFAULT 0");
  } catch {
    // ya existe
  }

  return {
    async query(sql, args = []) {
      return db.prepare(toPostgresParams(sql)).all(...args);
    },
    prepare(sql: string) {
      const stmt = db.prepare(sql);
      return {
        async run(...args: any[]) {
          stmt.run(...args);
          const row = db.prepare("SELECT last_insert_rowid() AS id").get();
          return { lastInsertRowid: row.id };
        },
        async get(...args: any[]) {
          return stmt.get(...args);
        },
        async all(...args: any[]) {
          return stmt.all(...args);
        },
      };
    },
    exec(sql: string) {
      db.exec(sql);
    },
  };
}

function getWrapper(): DbWrapper {
  if (global.__dbWrapper) return global.__dbWrapper;
  if (DATABASE_URL) {
    const req = createRequire(import.meta.url);
    const { Pool } = req("pg");
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    global.__dbWrapper = buildPgWrapper(pool);
  } else {
    global.__dbWrapper = buildSqliteWrapper();
  }
  return global.__dbWrapper;
}

export const db: DbWrapper = new Proxy({} as DbWrapper, {
  get(_t, prop: string) {
    return (getWrapper() as any)[prop];
  },
});

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}
