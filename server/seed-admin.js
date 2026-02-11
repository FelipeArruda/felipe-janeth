import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórios.');
  process.exit(1);
}

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'app.db');

const run = async () => {
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(__dirname, '../node_modules/sql.js/dist', file),
  });

  let db;
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const passwordHash = bcrypt.hashSync(password, 10);

  const stmt = db.prepare('SELECT id FROM admin_users WHERE email = ?');
  stmt.bind([email]);
  const exists = stmt.step();
  stmt.free();

  if (exists) {
    const updateStmt = db.prepare('UPDATE admin_users SET password_hash = ? WHERE email = ?');
    updateStmt.bind([passwordHash, email]);
    updateStmt.step();
    updateStmt.free();
    console.log('Admin atualizado.');
  } else {
    const insertStmt = db.prepare('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)');
    insertStmt.bind([email, passwordHash]);
    insertStmt.step();
    insertStmt.free();
    console.log('Admin criado.');
  }

  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
};

run();
