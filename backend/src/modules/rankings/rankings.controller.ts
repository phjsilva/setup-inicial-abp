import type { NextFunction, Request, Response } from 'express';
import type { RankingsQuery } from './rankings.schema.js';
import type { RankingsService } from './rankings.service.js';

export class RankingsController {
    constructor(private readonly service: RankingsService) {}

    list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.service.list(req.query as unknown as RankingsQuery);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
