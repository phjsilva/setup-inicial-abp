import { Router } from 'express';
import { pool } from '../../db/connection.js';
import { validate } from '../../shared/middleware/validate.js';
import { ServiceRepository } from './services.repository.js';
import { ServicesService } from './services.service.js';
import { ServicesController } from './services.controller.js';
import {
  getServiceParamsSchema,
  listServicesQuerySchema,
} from './services.schema.js';

const repository = new ServiceRepository(pool);
const service = new ServicesService(repository);
const controller = new ServicesController(service);

export const servicesRouter = Router();
servicesRouter.get(
  '/',
  validate(listServicesQuerySchema, 'query'),
  controller.list,
);

servicesRouter.get(
  '/:externalId',
  validate(getServiceParamsSchema, 'params'),
  controller.getByExternalId,
);
