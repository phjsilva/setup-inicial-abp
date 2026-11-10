import { Router } from 'express';
import { CollectionsController } from './collections.controller.js';
import { createDefaultCollectionsService } from './collections.service.js';
import { validate } from '../../shared/middleware/validate.js';
import { listCollectionStatusesQuerySchema } from './collections.schema.js';

const service = createDefaultCollectionsService();
const controller = new CollectionsController(service);

export const collectionsRouter = Router();

collectionsRouter.get(
    '/status',
    validate(listCollectionStatusesQuerySchema, 'query'),
    controller.listStatuses,
);
