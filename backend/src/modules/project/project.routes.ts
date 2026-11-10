import { Router } from 'express';
import { pool } from '../../db/connection.js';
import { requireAccount, requireAdmin } from '../../shared/middleware/auth.js';
import { validate } from '../../shared/middleware/validate.js';
import { monitoringService } from '../monitoring/monitoring.service.js';
import { ProjectController } from './project.controller.js';
import { ProjectRepository } from './project.repository.js';
import {
    coefficientsSchema,
    collectionSettingsSchema,
    memberAccessSchema,
    memberIdSchema,
    membersQuerySchema,
} from './project.schema.js';
import { ProjectService } from './project.service.js';

const controller = new ProjectController(
    new ProjectService(new ProjectRepository(pool), monitoringService),
);
export const projectRouter = Router();
projectRouter.use(requireAccount, requireAdmin);
projectRouter.get('/collection', controller.getCollection);
projectRouter.patch('/collection', validate(collectionSettingsSchema), controller.updateCollection);
projectRouter.get('/coefficients', controller.getCoefficients);
projectRouter.post(
    '/coefficients/preview',
    validate(coefficientsSchema),
    controller.previewCoefficients,
);
projectRouter.post('/coefficients', validate(coefficientsSchema), controller.activateCoefficients);
projectRouter.get('/members', validate(membersQuerySchema, 'query'), controller.listMembers);
projectRouter.patch(
    '/members/:id',
    validate(memberIdSchema, 'params'),
    validate(memberAccessSchema),
    controller.updateMember,
);
