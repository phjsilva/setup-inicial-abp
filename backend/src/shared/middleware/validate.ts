import { ZodType } from 'zod';
import { Request, Response, NextFunction } from 'express';

type RequestPart = 'body' | 'params' | 'query';

export function validate<T extends ZodType>(schema: T, source: RequestPart = 'body') {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            next(result.error);
            return;
        }

        if (source === 'query') {
            Object.defineProperty(req, 'query', {
                value: result.data,
                writable: true,
                configurable: true,
                enumerable: true,
            });
        } else {
            const target = req[source] as Record<string, unknown>;

            Object.keys(target).forEach((key) => delete target[key]);
            Object.assign(target, result.data);
        }

        next();
    };
}
