import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { createServer as createSmtpServer } from 'node:net';
import type { Server as HttpServer } from 'node:http';
import type { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createTestDatabase, testDatabaseUrl, type TestDatabase } from '../helpers/database.js';

describe.skipIf(!testDatabaseUrl)('Fluxos de contas, dashboards, projeto e relatórios', () => {
    let db: TestDatabase;
    let appPool: Pool;
    let server: HttpServer;
    let base: string;
    let mail = '';
    const smtp = createSmtpServer((socket) => {
        socket.setEncoding('utf8');
        socket.write('220 localhost SMTP\r\n');
        let buffer = '';
        let data = false;
        socket.on('data', (chunk: string) => {
            buffer += chunk;
            let next = buffer.indexOf('\r\n');
            while (next !== -1) {
                const line = buffer.slice(0, next);
                buffer = buffer.slice(next + 2);
                if (data) {
                    if (line === '.') {
                        data = false;
                        socket.write('250 recebido\r\n');
                    } else mail += line + '\n';
                } else if (line === 'DATA') {
                    data = true;
                    socket.write('354 envie a mensagem\r\n');
                } else if (line === 'QUIT') socket.end('221 tchau\r\n');
                else socket.write('250 localhost\r\n');
                next = buffer.indexOf('\r\n');
            }
        });
    });

    beforeAll(async () => {
        db = await createTestDatabase();
        const url = new URL(db.connectionString);
        vi.stubEnv('DATABASE_HOST', url.hostname);
        vi.stubEnv('DATABASE_PORT', url.port);
        vi.stubEnv('DATABASE_USER', decodeURIComponent(url.username));
        vi.stubEnv('DATABASE_PASSWORD', decodeURIComponent(url.password));
        vi.stubEnv('DATABASE_NAME', url.pathname.slice(1));
        vi.stubEnv('JWT_SECRET', 'chave-isolada-para-testes-do-greener');
        smtp.listen(0, '127.0.0.1');
        await once(smtp, 'listening');
        const smtpAddress = smtp.address();
        if (!smtpAddress || typeof smtpAddress === 'string')
            throw new Error('SMTP de teste indisponível');
        vi.stubEnv('SMTP_HOST', '127.0.0.1');
        vi.stubEnv('SMTP_PORT', String(smtpAddress.port));
        vi.stubEnv('SMTP_FROM', 'greener@exemplo.test');
        vi.stubEnv('SMTP_USER', '');
        vi.stubEnv('SMTP_PASSWORD', '');
        vi.stubEnv('APP_PUBLIC_URL', 'http://localhost:5173');
        const { app } = await import('../../../src/app.js');
        ({ pool: appPool } = await import('../../../src/db/connection.js'));
        server = app.listen(0, '127.0.0.1');
        await once(server, 'listening');
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('API de teste indisponível');
        base = `http://127.0.0.1:${address.port}/api/v1`;
    }, 30_000);

    afterAll(async () => {
        if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
        if (smtp.listening) await new Promise<void>((resolve) => smtp.close(() => resolve()));
        await appPool?.end();
        await db?.close();
        vi.unstubAllEnvs();
    });

    function api(path: string, method = 'GET', body?: unknown, token?: string) {
        return fetch(base + path, {
            method,
            headers: {
                ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    }

    async function register(email: string) {
        const response = await api('/auth/register', 'POST', {
            name: 'Conta teste',
            email,
            password: 'senha-inicial',
        });
        expect(response.status).toBe(201);
        const session = (await response.json()) as {
            token: string;
            user: { id: string; role: string };
        };
        expect(session.user.role).toBe('visualizador');
        return session;
    }

    it('isola dashboards por usuário e protege o último Admin', async () => {
        const one = await register('um@exemplo.test');
        const two = await register('dois@exemplo.test');
        expect((await api('/dashboards')).status).toBe(401);
        expect((await api('/project/collection', 'GET', undefined, one.token)).status).toBe(403);
        const proposal = {
            cpuMaxWatts: 200,
            ramWattsPerGb: 0.375,
            diskWattsPerGb: 0.01,
            networkWattsPerGb: 0.02,
        };
        expect(
            (await api('/project/coefficients/preview', 'POST', proposal, one.token)).status,
        ).toBe(403);
        const dashboard = { name: 'Energia', range: '7d', widgets: ['energy', 'regions'] };
        const created = await api('/dashboards', 'POST', dashboard, one.token);
        expect(created.status).toBe(201);
        const { id } = (await created.json()) as { id: string };
        expect(await (await api('/dashboards', 'GET', undefined, two.token)).json()).toEqual([]);
        expect((await api(`/dashboards/${id}`, 'PATCH', dashboard, two.token)).status).toBe(404);
        expect(
            (
                await api(
                    `/dashboards/${id}`,
                    'PATCH',
                    {
                        ...dashboard,
                        widgets: [
                            'regions',
                            'energy',
                            'carbon-trend',
                            'cpu-trend',
                            'memory-trend',
                            'power-trend',
                            'energy-by-service',
                        ],
                    },
                    one.token,
                )
            ).status,
        ).toBe(200);
        expect(await (await api('/dashboards', 'GET', undefined, one.token)).json()).toMatchObject([
            {
                id,
                widgets: [
                    'regions',
                    'energy',
                    'carbon-trend',
                    'cpu-trend',
                    'memory-trend',
                    'power-trend',
                    'energy-by-service',
                ],
            },
        ]);

        await db.pool.query("UPDATE usuario SET papel = 'admin' WHERE id = $1", [one.user.id]);
        expect(
            (await api('/project/collection', 'PATCH', { intervalSeconds: 15 }, one.token)).status,
        ).toBe(200);
        expect(
            await (await api('/project/collection', 'GET', undefined, one.token)).json(),
        ).toMatchObject({ intervalSeconds: 15 });
        expect(
            (
                await api(
                    `/project/members/${one.user.id}`,
                    'PATCH',
                    { role: 'visualizador', active: true },
                    one.token,
                )
            ).status,
        ).toBe(409);
        expect(
            (
                await api(
                    `/project/members/${two.user.id}`,
                    'PATCH',
                    { role: 'visualizador', active: false },
                    one.token,
                )
            ).status,
        ).toBe(200);
        expect((await api('/profile', 'GET', undefined, two.token)).status).toBe(401);
        const activeBefore = await (
            await api('/project/coefficients', 'GET', undefined, one.token)
        ).json();
        const preview = await api('/project/coefficients/preview', 'POST', proposal, one.token);
        expect(preview.status).toBe(200);
        expect(await preview.json()).toMatchObject({
            example: { cpuPercent: 50, collectionIntervalHours: 1, carbonIntensity: 100 },
            current: {
                powerW: expect.closeTo(51.72, 8),
                energyKwh: expect.closeTo(0.05172, 8),
                co2eG: expect.closeTo(5.172, 8),
            },
            proposed: {
                powerW: expect.closeTo(101.72, 8),
                energyKwh: expect.closeTo(0.10172, 8),
                co2eG: expect.closeTo(10.172, 8),
            },
        });
        expect(
            await (await api('/project/coefficients', 'GET', undefined, one.token)).json(),
        ).toEqual(activeBefore);
        const changed = await api(
            '/project/coefficients',
            'POST',
            { cpuMaxWatts: 90, ramWattsPerGb: 0.3, diskWattsPerGb: 0.01, networkWattsPerGb: 0.02 },
            one.token,
        );
        expect(changed.status).toBe(201);
        expect(
            await (await api('/project/coefficients', 'GET', undefined, one.token)).json(),
        ).toMatchObject({ cpuMaxWatts: 90 });
    });

    it('envia um link pelo SMTP, aceita um único uso e revoga a sessão anterior', async () => {
        const account = await register('recuperar@exemplo.test');
        expect(
            (await api('/auth/forgot-password', 'POST', { email: 'recuperar@exemplo.test' }))
                .status,
        ).toBe(202);
        // O envio roda depois da resposta e o SMTP usa quoted-printable com quebras suaves.
        const token = await vi.waitFor(
            () => {
                const match = mail.replace(/=\n/g, '').match(/#token(?:=3D|=)([a-f0-9]{64})/);
                expect(match?.[1]).toBeDefined();
                return match![1];
            },
            { timeout: 5000 },
        );
        const hash = createHash('sha256').update(token).digest('hex');
        expect(
            (
                await db.pool.query(
                    'SELECT token_hash FROM redefinicao_senha WHERE usuario_id = $1',
                    [account.user.id],
                )
            ).rows,
        ).toEqual([{ token_hash: hash }]);
        const payload = { token, password: 'nova-senha-teste' };
        const responses = await Promise.all([
            api('/auth/reset-password', 'POST', payload),
            api('/auth/reset-password', 'POST', payload),
        ]);
        expect(responses.map((response) => response.status).sort()).toEqual([204, 400]);
        expect((await api('/profile', 'GET', undefined, account.token)).status).toBe(401);
        expect(
            (
                await api('/auth/login', 'POST', {
                    email: 'recuperar@exemplo.test',
                    password: payload.password,
                })
            ).status,
        ).toBe(200);
    }, 15_000);

    it('confirma a senha para trocar o e-mail e mantém a nova sessão válida', async () => {
        const account = await register('perfil@exemplo.test');
        const profile = { name: 'Novo nome', email: 'perfil-atualizado@exemplo.test' };

        expect((await api('/profile', 'PATCH', profile, account.token)).status).toBe(400);
        const changed = await api(
            '/profile',
            'PATCH',
            { ...profile, currentPassword: 'senha-inicial' },
            account.token,
        );
        expect(changed.status).toBe(200);
        const session = (await changed.json()) as { token: string };
        expect((await api('/profile', 'GET', undefined, account.token)).status).toBe(401);
        expect(await (await api('/profile', 'GET', undefined, session.token)).json()).toMatchObject(
            profile,
        );
    });

    it('usa os dados do histórico na prévia e gera um PDF', async () => {
        const account = await register('relatorio@exemplo.test');
        const filters = {
            title: ' Consumo da infraestrutura ',
            serviceIds: ['service-a', 'service-b'],
            range: '24h',
            metrics: ['energy', 'carbon', 'cpu', 'power'],
            visualization: 'bars',
            end: '2026-11-06T13:00:00.000Z',
        };
        const response = await api('/reports/preview', 'POST', filters, account.token);
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({
            title: 'Consumo da infraestrutura',
            metrics: filters.metrics,
            services: [
                { id: 'service-a', energy: 3 },
                { id: 'service-b', energy: 4 },
            ],
        });
        for (const visualization of ['bars', 'line', 'table']) {
            const pdf = await api(
                '/reports/pdf',
                'POST',
                { ...filters, visualization },
                account.token,
            );
            expect(pdf.status, visualization).toBe(200);
            expect(pdf.headers.get('content-type')).toContain('application/pdf');
            expect(
                Buffer.from(await pdf.arrayBuffer())
                    .subarray(0, 4)
                    .toString(),
            ).toBe('%PDF');
        }
    });
});
