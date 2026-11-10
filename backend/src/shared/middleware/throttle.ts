import type { RequestHandler } from 'express';
import { AppError } from '../errors/AppError.js';

export function throttle(limit: number): RequestHandler {
    const attempts = new Map<string, number>();
    let expires = Date.now() + 15 * 60_000;
    return (req, _res, next) => {
        if (Date.now() >= expires) {
            attempts.clear();
            expires = Date.now() + 15 * 60_000;
        }
        const ip = req.ip ?? 'unknown';
        const count = attempts.get(ip) ?? 0;
        if (count >= limit || (!attempts.has(ip) && attempts.size >= 10_000)) {
            throw new AppError('Muitas tentativas. Aguarde alguns minutos.', 429);
        }
        attempts.set(ip, count + 1);
        next();
    };
}
