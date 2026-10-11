// Helper: run a command with DATABASE_URL pointed at StreamPro_test.
// Usage: node test/run-e2e.js migrate|test [jest args...]
// Creates the test database on first use (needs a Postgres superuser DB
// reachable with the credentials from .env).
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const envText = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const match = envText.match(/^DATABASE_URL=(.+)$/m);
if (!match) throw new Error('DATABASE_URL not found in .env');
const base = match[1].trim().replace(/^"|"$/g, '');
const testUrl = new URL(base);
testUrl.pathname = '/StreamPro_test';

const mode = process.argv[2];
const rest = process.argv.slice(3);
const env = {
  ...process.env,
  DATABASE_URL: testUrl.toString(),
  DATABASE_URL_TEST: testUrl.toString(),
};

async function ensureTestDatabase() {
  const { Client } = require('pg');
  const adminUrl = new URL(testUrl.toString());
  adminUrl.pathname = '/postgres';
  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  try {
    const { rows } = await admin.query(
      `SELECT 1 FROM pg_database WHERE datname = 'StreamPro_test'`,
    );
    if (rows.length === 0) {
      await admin.query('CREATE DATABASE "StreamPro_test"');
      console.log('created database StreamPro_test');
    }
  } finally {
    await admin.end();
  }
}

let result;
(async () => {
  await ensureTestDatabase();
  if (mode === 'migrate') {
    result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
      env,
      stdio: 'inherit',
      shell: true,
    });
  } else if (mode === 'test') {
    result = spawnSync(
      'npx',
      ['jest', '--config', './test/jest-e2e.json', '--runInBand', ...rest],
      { env, stdio: 'inherit', shell: true },
    );
  } else {
    console.error('usage: node test/run-e2e.js migrate|test [jest args...]');
    process.exit(2);
  }
  process.exit(result.status ?? 1);
})().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
