import type { RequestHandler, Response } from 'express';
import { pool } from '../../db/connection.js';
import { AccountsRepository } from '../../modules/accounts/accounts.repository.js';
import { authSecret, verifySession } from '../../modules/accounts/accounts.session.js';
import type { Account } from '../../modules/accounts/types/accounts.types.js';
import { AppError } from '../errors/AppError.js';

const accounts = new AccountsRepository(pool);

export function accountFrom(response: Response): Account {
    return response.locals.account as Account;
}

export const requireAccount: RequestHandler = async (req, res, next) => {
    const match = /^Bearer (\S+)$/i.exec(req.get('authorization') ?? '');
    const unauthorized = () => new AppError('Entre na sua conta para continuar.', 401);
    if (!match) throw unauthorized();
    const secret = authSecret();
    let claims;
    try {
        claims = verifySession(match[1], secret);
    } catch {
        throw unauthorized();
    }
    if (typeof claims === 'string' || !claims.sub || !/^[0-9]{1,19}$/.test(claims.sub)) {
        throw unauthorized();
    }
    const account = await accounts.findActiveById(claims.sub);
    if (!account || claims.version !== account.sessionVersion) throw unauthorized();
    res.locals.account = account;
    next();
};

export const requireAdmin: RequestHandler = (_req, res, next) => {
    if (accountFrom(res).role !== 'admin') {
        throw new AppError('Apenas administradores podem acessar a configuração do projeto.', 403);
    }
    next();
};
