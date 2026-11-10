import { Router } from 'express';
import { pool } from '../../db/connection.js';
import { validate } from '../../shared/middleware/validate.js';
import { RegionsRepository } from './regions.repository.js';
import { RegionsService } from './regions.service.js';
import { RegionsController } from './regions.controller.js';
import { listRegionsQuerySchema } from './regions.schema.js';

const repository = new RegionsRepository(pool);
const service = new RegionsService(repository);
const controller = new RegionsController(service);

export const regionsRouter = Router();

regionsRouter.get('/', validate(listRegionsQuerySchema, 'query'), controller.list);
