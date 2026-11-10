import type { NextFunction, Request, Response } from 'express';
import { MonitoringService } from './monitoring.service.js';

export class MonitoringController {
    constructor(private readonly service: MonitoringService) {}

    getStatus = (_req: Request, res: Response, next: NextFunction): void => {
        try {
            res.status(200).json(this.service.getStatus());
        } catch (error) {
            next(error);
        }
    };
}
