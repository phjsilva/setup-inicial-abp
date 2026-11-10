import type { NextFunction, Request, Response } from 'express';
import type { CreateComparisonInput } from './comparisons.schema.js';
import type { ComparisonsService } from './comparisons.service.js';

export class ComparisonsController {
    constructor(private readonly service: ComparisonsService) {}

    compare = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.service.compare(req.body as CreateComparisonInput);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
