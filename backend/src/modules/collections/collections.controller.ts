import type { Request, Response, NextFunction } from 'express';
import { CollectionsService } from './collections.service.js';
import type { CollectionStatusFilters } from './collections.schema.js';

export class CollectionsController {
    constructor(private readonly service: CollectionsService) {}

    listStatuses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const filters = req.query as unknown as CollectionStatusFilters;

            const statuses = await this.service.listCollectionStatuses(filters);

            res.status(200).json(statuses);
        } catch (error) {
            next(error);
        }
    };
}
