import { Router } from 'express';
import { pool } from '../../db/connection.js';
import { validate } from '../../shared/middleware/validate.js';
import { RankingsController } from './rankings.controller.js';
import { RankingsRepository } from './rankings.repository.js';
import { listRankingsQuerySchema } from './rankings.schema.js';
import { RankingsService } from './rankings.service.js';

const repository = new RankingsRepository(pool);
const service = new RankingsService(repository);
const controller = new RankingsController(service);

export const rankingsRouter = Router();

rankingsRouter.get('/', validate(listRankingsQuerySchema, 'query'), controller.list);
