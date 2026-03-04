import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const USE_SSL =
  process.env.PGSSLMODE === 'require' ||
  process.env.PGSSL === 'true' ||
  process.env.DATABASE_SSL === 'true';

if (!DATABASE_URL) {
  console.error('DATABASE_URL é obrigatório.');
  process.exit(1);
}

const MOCK_TAG = '[MOCK]';

const families = [
  {
    family_name: 'Beatriz e Antônio',
    access_code: '91794424',
    phone: '(32) 99911-2233',
    notes: `${MOCK_TAG} convidados da família da noiva`,
    message: 'Que o amor de vocês continue crescendo a cada dia. Será lindo celebrar esse momento especial.',
    members: [
      { name: 'Beatriz', attending: true, dietary: null },
      { name: 'Antônio', attending: false, dietary: null },
    ],
  },
  {
    family_name: 'Anderson, Esposa, Miguel',
    access_code: '01468917',
    phone: '(32) 99877-6655',
    notes: `${MOCK_TAG} amigos de trabalho`,
    message: 'Desejamos uma vida inteira de parceria, respeito e muita felicidade para vocês dois.',
    members: [
      { name: 'Anderson', attending: true, dietary: 'Sem lactose' },
      { name: 'Esposa', attending: true, dietary: null },
      { name: 'Miguel', attending: true, dietary: null },
    ],
  },
  {
    family_name: 'Renata, Evaldo, Gi e Gui',
    access_code: '69550442',
    phone: '(32) 99777-3344',
    notes: `${MOCK_TAG} família com crianças`,
    message: 'Que esta união seja sempre leve e cheia de cumplicidade. Estamos muito felizes por vocês.',
    members: [
      { name: 'Renata', attending: true, dietary: null },
      { name: 'Evaldo', attending: true, dietary: null },
      { name: 'Giovana', attending: false, dietary: null },
      { name: 'Guilherme', attending: true, dietary: null },
    ],
  },
  {
    family_name: 'Aline e Thiago',
    access_code: '29318812',
    phone: '(32) 99666-1100',
    notes: `${MOCK_TAG} padrinhos`,
    message: 'Contem sempre conosco. Que o casamento seja apenas o início de uma história extraordinária.',
    members: [
      { name: 'Aline', attending: true, dietary: null },
      { name: 'Thiago', attending: true, dietary: 'Vegetariano' },
    ],
  },
  {
    family_name: 'Marcelo e Kaline',
    access_code: '52017630',
    phone: '(32) 99544-8811',
    notes: `${MOCK_TAG} vizinhos`,
    message: 'Parabéns pelo casamento! Que nunca faltem amor, diálogo e momentos inesquecíveis.',
    members: [
      { name: 'Marcelo', attending: false, dietary: null },
      { name: 'Kaline', attending: false, dietary: null },
    ],
  },
];

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: USE_SSL ? { rejectUnauthorized: false } : undefined,
});

const withTransaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const run = async () => {
  const summary = await withTransaction(async (client) => {
    const removedFamilies = await client.query(
      `DELETE FROM guest_families
       WHERE notes LIKE $1
       RETURNING id`,
      [`${MOCK_TAG}%`]
    );

    let familyCount = 0;
    let memberCount = 0;
    let confirmationCount = 0;

    for (const family of families) {
      const insertedFamily = await client.query(
        `INSERT INTO guest_families (family_name, access_code, phone, notes)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (access_code) DO UPDATE
           SET family_name = EXCLUDED.family_name,
               phone = EXCLUDED.phone,
               notes = EXCLUDED.notes
         RETURNING id`,
        [family.family_name, family.access_code, family.phone, family.notes]
      );

      const familyId = insertedFamily.rows[0].id;

      await client.query('DELETE FROM family_members WHERE family_id = $1', [familyId]);

      for (const member of family.members) {
        const insertedMember = await client.query(
          `INSERT INTO family_members (family_id, name)
           VALUES ($1, $2)
           RETURNING id`,
          [familyId, member.name]
        );

        const memberId = insertedMember.rows[0].id;
        memberCount += 1;

        if (typeof member.attending === 'boolean') {
          await client.query(
            `INSERT INTO member_confirmations
              (member_id, attending, dietary_restrictions, message, confirmed_at, updated_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [memberId, member.attending, member.dietary, family.message]
          );
          confirmationCount += 1;
        }
      }

      familyCount += 1;
    }

    return {
      removed: removedFamilies.rowCount,
      families: familyCount,
      members: memberCount,
      confirmations: confirmationCount,
    };
  });

  console.log('Seed mock concluído com sucesso.');
  console.log(`Famílias mock removidas: ${summary.removed}`);
  console.log(`Famílias inseridas: ${summary.families}`);
  console.log(`Membros inseridos: ${summary.members}`);
  console.log(`Confirmações inseridas: ${summary.confirmations}`);
};

run()
  .catch((err) => {
    console.error('Erro ao inserir dados mockados:', err.message || err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
