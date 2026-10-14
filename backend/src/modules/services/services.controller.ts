import { NextFunction, Request, Response } from 'express';
import { ServicesService } from './services.service.js';
import type { ServicesFilters } from './services.schema.js';

export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      res
        .status(200)
        .json(await this.service.list(req.query as unknown as ServicesFilters));
    } catch (error) {
      next(error);
    }
  };

  getByExternalId = async (
    req: Request<{ externalId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const overview = await this.service.getByExternalId(
        req.params.externalId,
      );
      res.status(200).json(overview);
    } catch (error) {
      next(error);
    }
  };
}
