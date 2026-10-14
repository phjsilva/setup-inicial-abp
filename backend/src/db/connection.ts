import { Pool } from 'pg';
import 'dotenv/config';

export const pool = new Pool({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

pool.on('error', (err) => {
    console.error('[database] Erro em conexão ociosa do PostgreSQL:', err);
});
