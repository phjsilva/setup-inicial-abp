import { NextFunction, Request, Response } from 'express';
import { ServicesService } from './services.service.js';

export class ServicesController {
    constructor(private readonly service: ServicesService) {}

    getByExternalId = async (
        req: Request<{ externalId: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const overview = await this.service.getByExternalId(req.params.externalId);
            res.status(200).json(overview);
        } catch (error) {
            next(error);
        }
    };
}
