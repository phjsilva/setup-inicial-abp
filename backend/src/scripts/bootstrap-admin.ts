import bcrypt from 'bcrypt';
import { ZodError } from 'zod';
import { AccountsRepository } from '../modules/accounts/accounts.repository.js';
import { pool } from '../db/connection.js';
import { emailSchema, nameSchema, passwordSchema } from '../modules/accounts/accounts.schema.js';

async function bootstrap() {
    const email = emailSchema.parse(process.env.BOOTSTRAP_ADMIN_EMAIL);
    const name = nameSchema.parse(process.env.BOOTSTRAP_ADMIN_NAME ?? 'Administrador');
    const password = passwordSchema.parse(process.env.BOOTSTRAP_ADMIN_PASSWORD);
    const hash = await bcrypt.hash(password, 12);
    await new AccountsRepository(pool).bootstrapAdmin(email, name, hash);
    process.stdout.write('Administrador inicial configurado.\n');
}

try {
    await bootstrap();
} catch (error) {
    console.error(
        error instanceof ZodError
            ? 'Confira as variáveis BOOTSTRAP_ADMIN_*.'
            : error instanceof Error
              ? error.message
              : 'Falha na configuração.',
    );
    process.exitCode = 1;
} finally {
    await pool.end();
}
