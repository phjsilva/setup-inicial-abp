import { Router } from 'express';
import { servicesRouter } from './modules/services/services.routes.js';
import analyticsRouter from './modules/analytics/analytics.routes.js';
import monitoringRouter from './modules/monitoring/monitoring.routes.js';

const router = Router();
router.use('/services', servicesRouter);
router.use('/services', analyticsRouter);
router.use('/service', servicesRouter);
router.use('/service', analyticsRouter);
router.use('/monitoring', monitoringRouter);
export default router;
