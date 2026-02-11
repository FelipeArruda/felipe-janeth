import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5174;
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'dev-secret-change-me';

app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'app.db');

const loadDatabase = async () => {
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

    CREATE TABLE IF NOT EXISTS guest_families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_name TEXT NOT NULL,
      access_code TEXT UNIQUE NOT NULL,
      phone TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      relationship TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS member_confirmations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      attending INTEGER NOT NULL,
      dietary_restrictions TEXT,
      message TEXT,
      confirmed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const saveDatabase = () => {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  };

  const all = (sql, params = []) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  };

  const get = (sql, params = []) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const row = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return row;
  };

  const run = (sql, params = []) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
  };

  const transaction = (fn) => {
    db.exec('BEGIN');
    try {
      fn();
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  };

  return { db, saveDatabase, all, get, run, transaction };
};

const generateAccessCode = () => {
  let code = '';
  for (let i = 0; i < 8; i += 1) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
};

const issueToken = (email) =>
  jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const start = async () => {
  const { saveDatabase, all, get, run, transaction } = await loadDatabase();

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const user = get('SELECT * FROM admin_users WHERE email = ?', [email]);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Login inválido.' });
    }

    return res.json({ token: issueToken(user.email), email: user.email });
  });

  app.get('/api/admin/session', authMiddleware, (req, res) => {
    res.json({ email: req.user.email });
  });

  app.get('/api/admin/families', authMiddleware, (_req, res) => {
    const families = all('SELECT * FROM guest_families ORDER BY created_at DESC');
    const members = all('SELECT * FROM family_members ORDER BY created_at ASC');
    const confirmations = all(
      'SELECT * FROM member_confirmations ORDER BY confirmed_at DESC, id DESC'
    );

    res.json({ families, members, confirmations });
  });

  app.post('/api/admin/families', authMiddleware, (req, res) => {
    const { family_name, phone, notes, members } = req.body || {};

    if (!family_name || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'Nome da família e membros são obrigatórios.' });
    }

    let accessCode = generateAccessCode();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        transaction(() => {
          run(
            'INSERT INTO guest_families (family_name, access_code, phone, notes) VALUES (?, ?, ?, ?)',
            [family_name.trim(), accessCode, phone?.trim() || null, notes?.trim() || null]
          );
        });

        const family = get('SELECT * FROM guest_families ORDER BY id DESC LIMIT 1');
        if (!family) {
          throw new Error('Falha ao salvar família.');
        }

        transaction(() => {
          members.forEach((member) => {
            run(
              'INSERT INTO family_members (family_id, name, relationship) VALUES (?, ?, ?)',
              [family.id, member.name.trim(), member.relationship?.trim() || null]
            );
          });
        });

        const familyMembers = all(
          'SELECT * FROM family_members WHERE family_id = ? ORDER BY created_at ASC',
          [family.id]
        );

        saveDatabase();
        return res.json({ family, members: familyMembers });
      } catch (err) {
        if (String(err.message || '').includes('UNIQUE')) {
          accessCode = generateAccessCode();
        } else {
          console.error('Error:', err);
          return res.status(500).json({ error: 'Erro ao salvar família.' });
        }
      }
    }

    return res.status(500).json({ error: 'Não foi possível gerar código único.' });
  });

  app.put('/api/admin/families/:id', authMiddleware, (req, res) => {
    const familyId = Number(req.params.id);
    const { family_name, phone, notes, members } = req.body || {};

    if (!familyId) {
      return res.status(400).json({ error: 'Família inválida.' });
    }

    if (!family_name || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'Nome da família e membros são obrigatórios.' });
    }

    try {
      transaction(() => {
        run(
          'UPDATE guest_families SET family_name = ?, phone = ?, notes = ? WHERE id = ?',
          [family_name.trim(), phone?.trim() || null, notes?.trim() || null, familyId]
        );

        run('DELETE FROM family_members WHERE family_id = ?', [familyId]);

        members.forEach((member) => {
          run(
            'INSERT INTO family_members (family_id, name, relationship) VALUES (?, ?, ?)',
            [familyId, member.name.trim(), member.relationship?.trim() || null]
          );
        });
      });

      const family = get('SELECT * FROM guest_families WHERE id = ?', [familyId]);
      const familyMembers = all(
        'SELECT * FROM family_members WHERE family_id = ? ORDER BY created_at ASC',
        [familyId]
      );

      saveDatabase();
      return res.json({ family, members: familyMembers });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Erro ao atualizar família.' });
    }
  });

  app.delete('/api/admin/families/:id', authMiddleware, (req, res) => {
    const familyId = Number(req.params.id);

    if (!familyId) {
      return res.status(400).json({ error: 'Família inválida.' });
    }

    try {
      transaction(() => {
        run('DELETE FROM family_members WHERE family_id = ?', [familyId]);
        run('DELETE FROM guest_families WHERE id = ?', [familyId]);
      });

      saveDatabase();
      return res.json({ ok: true });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Erro ao remover família.' });
    }
  });

  app.get('/api/access/:code', (req, res) => {
    const code = (req.params.code || '').replace('-', '').trim();

    if (!code || code.length !== 8) {
      return res.status(400).json({ error: 'Código inválido.' });
    }

    const family = get('SELECT * FROM guest_families WHERE access_code = ?', [code]);

    if (!family) {
      return res.status(404).json({ error: 'Código não encontrado.' });
    }

    const members = all(
      'SELECT * FROM family_members WHERE family_id = ? ORDER BY created_at ASC',
      [family.id]
    );

    return res.json({ family, members });
  });

  app.post('/api/confirmations', (req, res) => {
    const { confirmations } = req.body || {};

    if (!Array.isArray(confirmations) || confirmations.length === 0) {
      return res.status(400).json({ error: 'Confirmações inválidas.' });
    }

    try {
      transaction(() => {
        confirmations.forEach((item) => {
          run(
            `INSERT INTO member_confirmations
              (member_id, attending, dietary_restrictions, message, confirmed_at, updated_at)
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
              item.member_id,
              item.attending ? 1 : 0,
              item.dietary_restrictions || null,
              item.message || null,
            ]
          );
        });
      });

      saveDatabase();
      return res.json({ ok: true });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Erro ao salvar confirmações.' });
    }
  });

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
};

start();
