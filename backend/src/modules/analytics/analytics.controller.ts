import { CollectionsQuery } from './analytics.schema.js';
import { AnalyticsService } from './analytics.service.js';
import { NextFunction, Request, Response } from 'express';

export class AnalyticsController {
    constructor(private readonly service: AnalyticsService) {}

    getCollectionsByExternalId = async (
        req: Request<{ externalId: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { range, maxPoints, to } = req.query as unknown as CollectionsQuery;

            const result = await this.service.getCollectionsByExternalId(
                req.params.externalId,
                range,
                maxPoints,
                to,
            );

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
