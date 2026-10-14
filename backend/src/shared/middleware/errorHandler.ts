import type { Request, Response, NextFunction } from 'express';
import { DatabaseError } from 'pg';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
    if (res.headersSent) {
        next(err);
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: { message: err.message },
        });
        return;
    }

    if (err instanceof ZodError) {
        res.status(400).json({
            error: {
                message: 'Dados inválidos',
                details: err.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            },
        });
        return;
    }

    if (err instanceof DatabaseError) {
        if (err.code === '23505') {
            res.status(409).json({
                error: { message: 'Registro duplicado' },
            });
            return;
        }

        if (err.code === '23503') {
            res.status(409).json({
                error: {
                    message: 'A operação conflita com registros relacionados',
                },
            });
            return;
        }
    }

    console.error(err);

    res.status(500).json({
        error: { message: 'Erro interno do servidor' },
    });
}
