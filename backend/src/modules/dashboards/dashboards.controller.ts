import type { Request, Response } from 'express';
import { accountFrom } from '../../shared/middleware/auth.js';
import type { DashboardInput, DashboardMetricsQuery } from './dashboards.schema.js';
import type { DashboardsService } from './dashboards.service.js';

export class DashboardsController {
    constructor(private readonly service: DashboardsService) {}
    list = async (_req: Request, res: Response) => {
        res.json(await this.service.list(accountFrom(res).id));
    };
    metrics = async (req: Request, res: Response) => {
        res.json(await this.service.metrics(req.query as unknown as DashboardMetricsQuery));
    };
    create = async (req: Request, res: Response) => {
        res.status(201).json(
            await this.service.create(accountFrom(res).id, req.body as DashboardInput),
        );
    };
    update = async (req: Request<{ id: string }>, res: Response) => {
        res.json(
            await this.service.update(
                req.params.id,
                accountFrom(res).id,
                req.body as DashboardInput,
            ),
        );
    };
}
