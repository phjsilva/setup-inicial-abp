import nodemailer from 'nodemailer';
import { AppError } from '../../shared/errors/AppError.js';

export function passwordResetMailer() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, APP_PUBLIC_URL } =
        process.env;
    const port = Number(SMTP_PORT ?? '587');
    if (
        !SMTP_HOST ||
        !SMTP_FROM ||
        !APP_PUBLIC_URL ||
        !Number.isInteger(port) ||
        port < 1 ||
        port > 65535 ||
        Boolean(SMTP_USER) !== Boolean(SMTP_PASSWORD)
    ) {
        throw new AppError('A recuperação de senha está temporariamente indisponível.', 503);
    }
    const url = new URL('/redefinir-senha', APP_PUBLIC_URL);
    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new AppError('A recuperação de senha está temporariamente indisponível.', 503);
    }
    const secure = port === 465;
    const transport = nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure,
        requireTLS: !secure && process.env.NODE_ENV === 'production',
        auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
        connectionTimeout: 10_000,
        socketTimeout: 15_000,
    });
    return async (email: string, token: string) => {
        url.hash = new URLSearchParams({ token }).toString();
        await transport.sendMail({
            from: SMTP_FROM,
            to: email,
            subject: 'Redefina sua senha do GreenER',
            text: `Abra o link em até 30 minutos para redefinir sua senha: ${url.href}\n\nSe você não fez o pedido, ignore este e-mail.`,
        });
    };
}
