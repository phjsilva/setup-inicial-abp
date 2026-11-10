import { Router } from 'express';
import { pool } from '../../db/connection.js';
import { requireAccount } from '../../shared/middleware/auth.js';
import { validate } from '../../shared/middleware/validate.js';
import { MetricsSnapshotRepository } from '../analytics/metrics-snapshot.repository.js';
import { DashboardsController } from './dashboards.controller.js';
import { DashboardsRepository } from './dashboards.repository.js';
import { dashboardSchema, dashboardIdSchema, dashboardMetricsSchema } from './dashboards.schema.js';
import { DashboardsService } from './dashboards.service.js';

const controller = new DashboardsController(
    new DashboardsService(new DashboardsRepository(pool), new MetricsSnapshotRepository(pool)),
);
export const dashboardsRouter = Router();
dashboardsRouter.use(requireAccount);
dashboardsRouter.get('/data', validate(dashboardMetricsSchema, 'query'), controller.metrics);
dashboardsRouter.get('/', controller.list);
dashboardsRouter.post('/', validate(dashboardSchema), controller.create);
dashboardsRouter.patch(
    '/:id',
    validate(dashboardIdSchema, 'params'),
    validate(dashboardSchema),
    controller.update,
);
