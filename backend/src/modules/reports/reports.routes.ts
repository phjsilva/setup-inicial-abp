import { Router } from 'express';
import { pool } from '../../db/connection.js';
import { requireAccount } from '../../shared/middleware/auth.js';
import { validate } from '../../shared/middleware/validate.js';
import { MetricsSnapshotRepository } from '../analytics/metrics-snapshot.repository.js';
import { ReportsController } from './reports.controller.js';
import { reportFiltersSchema } from './reports.schema.js';
import { ReportsService } from './reports.service.js';

const controller = new ReportsController(new ReportsService(new MetricsSnapshotRepository(pool)));
export const reportsRouter = Router();
reportsRouter.use(requireAccount);
reportsRouter.post('/preview', validate(reportFiltersSchema), controller.preview);
reportsRouter.post('/pdf', validate(reportFiltersSchema), controller.exportPdf);
