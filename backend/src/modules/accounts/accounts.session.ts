import jwt from 'jsonwebtoken';
import { AppError } from '../../shared/errors/AppError.js';
import type { SessionAccount } from './types/accounts.types.js';

const issuer = 'greener';
const audience = 'greener-web';

export function authSecret(): string {
    const value = process.env.JWT_SECRET;
    if (!value || (process.env.NODE_ENV === 'production' && Buffer.byteLength(value) < 32)) {
        throw new AppError('Autenticação indisponível. Configure JWT_SECRET.', 503);
    }
    return value;
}

export function createSession(account: SessionAccount) {
    const { id, name, email, role, sessionVersion } = account;
    return {
        token: jwt.sign({ version: sessionVersion }, authSecret(), {
            algorithm: 'HS256',
            subject: id,
            issuer,
            audience,
            expiresIn: '8h',
        }),
        user: { id, name, email, role },
    };
}

export function verifySession(token: string, secret: string) {
    return jwt.verify(token, secret, { algorithms: ['HS256'], issuer, audience });
}
