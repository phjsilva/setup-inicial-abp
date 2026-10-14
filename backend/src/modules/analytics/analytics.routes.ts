import { Router } from 'express';
import { pool } from '../../db/connection.js';
import { validate } from '../../shared/middleware/validate.js';
import { AnalyticsRepository } from './analytics.repository.js';
import { AnalyticsService } from './analytics.service.js';
import { AnalyticsController } from './analytics.controller.js';
import { ServiceRepository } from '../services/services.repository.js';
import { getCollectionsByExternalIdSchema, getCollectionsQuerySchema } from './analytics.schema.js';
const analyticsRouter = Router();

const repository = new AnalyticsRepository(pool);
const serviceRepository = new ServiceRepository(pool);
const service = new AnalyticsService(repository, serviceRepository);
const controller = new AnalyticsController(service);

analyticsRouter.get(
    '/:externalId/collections',
    validate(getCollectionsByExternalIdSchema, 'params'),
    validate(getCollectionsQuerySchema, 'query'),
    controller.getCollectionsByExternalId,
);

export default analyticsRouter;
