import { Router } from 'express';
import { pool } from '../../db/connection.js';
import { validate } from '../../shared/middleware/validate.js';
import { ServiceRepository } from '../services/services.repository.js';
import { ComparisonsController } from './comparisons.controller.js';
import { ComparisonsRepository } from './comparisons.repository.js';
import { createComparisonSchema } from './comparisons.schema.js';
import { ComparisonsService } from './comparisons.service.js';

const repository = new ComparisonsRepository(pool);
const serviceRepository = new ServiceRepository(pool);
const service = new ComparisonsService(repository, serviceRepository);
const controller = new ComparisonsController(service);

export const comparisonsRouter = Router();

comparisonsRouter.post('/', validate(createComparisonSchema, 'body'), controller.compare);
