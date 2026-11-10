import type { Pool } from 'pg';
import { AppError } from '../../shared/errors/AppError.js';
import type { Credentials, SessionAccount } from './types/accounts.types.js';

export const accountColumns = 'id, nome AS name, email, papel AS role';

export class AccountsRepository {
    constructor(private readonly pool: Pool) {}
    async create(name: string, email: string, hash: string) {
        const { rows } = await this.pool.query<SessionAccount>(
            `INSERT INTO usuario (nome, email, senha_hash, papel) VALUES ($1, $2, $3, 'visualizador')
         RETURNING ${accountColumns}, versao_sessao AS "sessionVersion"`,
            [name, email, hash],
        );
        return rows[0];
    }

    async findActiveByEmail(email: string) {
        const { rows } = await this.pool.query<Credentials>(
            `SELECT ${accountColumns}, senha_hash AS "passwordHash", versao_sessao AS "sessionVersion"
         FROM usuario WHERE lower(email) = $1 AND acesso_ativo ORDER BY id LIMIT 1`,
            [email],
        );
        return rows[0] ?? null;
    }
    async findActiveById(id: string) {
        const { rows } = await this.pool.query<SessionAccount>(
            `SELECT ${accountColumns}, versao_sessao AS "sessionVersion" FROM usuario WHERE id = $1 AND acesso_ativo`,
            [id],
        );
        return rows[0] ?? null;
    }
    async issueReset(email: string, tokenHash: string) {
        const { rows } = await this.pool.query<{ email: string }>(
            `WITH candidate AS (
            SELECT id, email FROM usuario WHERE lower(email) = $1 AND acesso_ativo ORDER BY id LIMIT 1 FOR UPDATE
         ), issued AS (
            INSERT INTO redefinicao_senha (token_hash, usuario_id, expira_em)
            SELECT $2, id, now() + interval '30 minutes' FROM candidate
            RETURNING usuario_id
         )
         SELECT email FROM candidate JOIN issued ON issued.usuario_id = candidate.id`,
            [email, tokenHash],
        );
        return rows[0]?.email;
    }
    async consumeReset(tokenHash: string, hash: string) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const { rows } = await client.query<{ id: string }>(
                `SELECT u.id FROM usuario u JOIN redefinicao_senha r ON r.usuario_id = u.id
             WHERE r.token_hash = $1 AND r.usado_em IS NULL AND r.expira_em > now() AND u.acesso_ativo
             FOR UPDATE OF u`,
                [tokenHash],
            );
            const account = rows[0];
            const invalid = () =>
                new AppError('O link expirou ou já foi usado. Solicite outro.', 400);
            if (!account) throw invalid();
            const consumed = await client.query(
                `UPDATE redefinicao_senha SET usado_em = now()
             WHERE token_hash = $1 AND usado_em IS NULL AND expira_em > now()`,
                [tokenHash],
            );
            if (!consumed.rowCount) throw invalid();
            await client.query(
                `UPDATE usuario SET senha_hash = $2, versao_sessao = versao_sessao + 1 WHERE id = $1`,
                [account.id, hash],
            );
            await client.query('DELETE FROM redefinicao_senha WHERE usuario_id = $1', [account.id]);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    async updateProfile(
        id: string,
        name: string,
        email: string,
        verifyCurrentPassword: (hash: string) => Promise<boolean>,
    ) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const { rows: current } = await client.query<{ email: string; hash: string }>(
                'SELECT email, senha_hash AS hash FROM usuario WHERE id = $1 AND acesso_ativo FOR UPDATE',
                [id],
            );
            if (!current[0]) throw new AppError('Conta indisponível.', 401);
            const changedEmail = email !== current[0].email;
            if (changedEmail && !(await verifyCurrentPassword(current[0].hash))) {
                throw new AppError('Confirme sua senha atual para alterar o e-mail.', 400);
            }
            const { rows } = await client.query<SessionAccount>(
                `UPDATE usuario SET nome = $2, email = $3, versao_sessao = versao_sessao + $4
             WHERE id = $1 RETURNING ${accountColumns}, versao_sessao AS "sessionVersion"`,
                [id, name, email, changedEmail ? 1 : 0],
            );
            if (changedEmail) {
                await client.query('DELETE FROM redefinicao_senha WHERE usuario_id = $1', [id]);
            }
            await client.query('COMMIT');
            return rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async bootstrapAdmin(email: string, name: string, hash: string) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('SELECT pg_advisory_xact_lock(83651)');
            const existing = await client.query(
                "SELECT 1 FROM usuario WHERE papel = 'admin' AND acesso_ativo LIMIT 1",
            );
            if (existing.rowCount) throw new Error('Já existe um administrador ativo.');
            await client.query(
                `INSERT INTO usuario (email, nome, senha_hash, papel) VALUES ($1, $2, $3, 'admin')
             ON CONFLICT (lower(email)) DO UPDATE SET papel = 'admin', acesso_ativo = true, nome = EXCLUDED.nome,
             senha_hash = EXCLUDED.senha_hash, versao_sessao = usuario.versao_sessao + 1`,
                [email, name, hash],
            );
            await client.query(
                'DELETE FROM redefinicao_senha WHERE usuario_id = (SELECT id FROM usuario WHERE lower(email) = $1)',
                [email],
            );
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
