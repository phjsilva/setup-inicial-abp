import { NextFunction, Request, Response } from 'express';
import { RegionsService } from './regions.service.js';
import type { RegionsQuery } from './regions.schema.js';

export class RegionsController {
    constructor(private readonly service: RegionsService) {}

    list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            res.status(200).json(await this.service.list(req.query as unknown as RegionsQuery));
        } catch (error) {
            next(error);
        }
    };
}
