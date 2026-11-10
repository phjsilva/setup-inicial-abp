import type { Pool } from 'pg';
import type { DashboardInput } from './dashboards.schema.js';
import type { Dashboard } from './types/dashboards.types.js';

const columns = 'id, nome AS name, periodo AS range, widgets';

export class DashboardsRepository {
    constructor(private readonly pool: Pool) {}
    async list(userId: string) {
        const { rows } = await this.pool.query<Dashboard>(
            `SELECT ${columns} FROM dashboard WHERE usuario_id = $1 ORDER BY id`,
            [userId],
        );
        return rows;
    }

    async create(userId: string, data: DashboardInput) {
        const { rows } = await this.pool.query<Dashboard>(
            `INSERT INTO dashboard (usuario_id, nome, periodo, widgets) VALUES ($1, $2, $3, $4::jsonb)
         RETURNING ${columns}`,
            [userId, data.name, data.range, JSON.stringify(data.widgets)],
        );
        return rows[0];
    }

    async update(id: string, userId: string, data: DashboardInput) {
        const { rows } = await this.pool.query<Dashboard>(
            `UPDATE dashboard SET nome = $3, periodo = $4, widgets = $5::jsonb
         WHERE id = $1 AND usuario_id = $2 RETURNING ${columns}`,
            [id, userId, data.name, data.range, JSON.stringify(data.widgets)],
        );
        return rows[0] ?? null;
    }
}
