import { Router } from 'express';
import { MonitoringController } from './monitoring.controller.js';
import { monitoringService } from './monitoring.service.js';

const monitoringRouter = Router();
const controller = new MonitoringController(monitoringService);

monitoringRouter.get('/status', controller.getStatus);

export default monitoringRouter;
