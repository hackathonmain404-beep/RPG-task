import path from 'path';
import { fileURLToPath } from 'url';
import embeddedPg from 'embedded-postgres';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EmbeddedPostgres = embeddedPg.default || embeddedPg;

export function isPortOpen(port = 5432, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

export async function startPostgres() {
  const isOpen = await isPortOpen(5432);
  if (isOpen) {
    return null;
  }

  const pg = new EmbeddedPostgres({
    port: 5432,
    databaseDir: path.join(__dirname, '../.pgdata'),
    user: 'postgres',
    password: 'password',
    persistent: true,
  });

  await pg.start();
  try {
    await pg.createDatabase('liferpg');
  } catch {
    // Already exists
  }
  return pg;
}

// If run directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pg = await startPostgres();
  if (pg) {
    console.log('Local PostgreSQL started and listening on 127.0.0.1:5432');
    process.on('SIGINT', async () => {
      await pg.stop();
      process.exit(0);
    });
    // Keep alive
    setInterval(() => {}, 10000);
  } else {
    console.log('PostgreSQL is already active on 127.0.0.1:5432');
  }
}
