import { useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { authenticate, requestPasswordReset, resetPassword } from '@/api/accounts';
import { errorMessage } from '@/api/authenticated';
import { AccessShell } from '@/components/account/AccessShell';
import { useAuth } from '@/contexts/auth';

export function AccessPage({ flow = 'access' }: { flow?: 'access' | 'forgot' | 'reset' }) {
    const [signup, setSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const confirmRef = useRef<HTMLInputElement>(null);
    const auth = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const resetToken = new URLSearchParams(location.hash.slice(1)).get('token');
    const from = (location.state as { from?: string } | null)?.from;
    const target = typeof from === 'string' && /^\/(?![/\\])/.test(from) ? from : '/visao-geral';
    const needsConfirmation = signup || flow === 'reset';
    const passwordsDiffer = needsConfirmation && confirm.length > 0 && password !== confirm;

    if (auth.session && flow === 'access') return <Navigate to={target} replace />;
    if (auth.loading && flow === 'access')
        return (
            <p className="p-6" role="status">
                Carregando conta…
            </p>
        );

    function selectMode(value: boolean) {
        setSignup(value);
        setPassword('');
        setConfirm('');
        setError('');
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setMessage('');
        if (passwordsDiffer) {
            confirmRef.current?.focus();
            return;
        }
        setBusy(true);
        try {
            if (flow === 'forgot') {
                const response = await requestPasswordReset(email);
                setMessage(response.message);
            } else if (flow === 'reset') {
                await resetPassword(resetToken, password);
                auth.setSession(null);
                navigate('/login', { replace: true, state: { reset: true } });
            } else {
                const session = await authenticate(
                    signup ? { name, email, password } : { email, password },
                    signup,
                );
                auth.setSession(session);
                navigate(target, { replace: true });
            }
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setBusy(false);
        }
    }

    const title =
        flow === 'forgot'
            ? 'Esqueceu sua senha?'
            : flow === 'reset'
              ? 'Defina uma nova senha'
              : signup
                ? 'Criar conta'
                : 'Entrar no GreenER';
    const resetDone = (location.state as { reset?: boolean } | null)?.reset;

    return (
        <AccessShell>
            {flow === 'access' && (
                <div className="gs-tabs mb-4 sm:mb-5" aria-label="Tipo de acesso" role="group">
                    <button
                        type="button"
                        aria-pressed={!signup}
                        onClick={() => selectMode(false)}
                        disabled={busy}
                    >
                        Entrar
                    </button>
                    <button
                        type="button"
                        aria-pressed={signup}
                        onClick={() => selectMode(true)}
                        disabled={busy}
                    >
                        Cadastrar
                    </button>
                </div>
            )}
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
                {flow === 'forgot'
                    ? 'Enviaremos um link para o e-mail da conta.'
                    : flow === 'reset'
                      ? 'Atualize a senha da sua conta.'
                      : signup
                        ? 'Consulte métricas e relatórios dos seus serviços.'
                        : 'Acesse suas métricas e dashboards.'}
            </p>
            {(message || (flow === 'access' && resetDone)) && (
                <p role="status" className="gs-notice mt-4">
                    {message || 'Senha redefinida. Entre com a nova senha.'}
                </p>
            )}
            {flow === 'reset' && !resetToken ? (
                <p className="gs-error mt-5" role="alert">
                    O link está incompleto.{' '}
                    <Link className="gs-link" to="/esqueci-a-senha">
                        Solicitar outro link
                    </Link>
                </p>
            ) : (
                <form onSubmit={submit} className="mt-4 grid gap-3 sm:mt-5 sm:gap-4">
                    {flow === 'access' && signup && (
                        <label>
                            Nome
                            <input
                                required
                                maxLength={100}
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </label>
                    )}
                    {flow !== 'reset' && (
                        <label>
                            E-mail
                            <input
                                required
                                type="email"
                                maxLength={254}
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </label>
                    )}
                    {flow !== 'forgot' && (
                        <div className="grid gap-1.5">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                                <label htmlFor="access-password">
                                    {flow === 'reset' ? 'Nova senha' : 'Senha'}
                                </label>
                                {flow === 'access' && !signup && (
                                    <Link className="gs-link" to="/esqueci-a-senha">
                                        Esqueci minha senha
                                    </Link>
                                )}
                            </div>
                            <input
                                id="access-password"
                                required
                                minLength={8}
                                type="password"
                                autoComplete={
                                    needsConfirmation ? 'new-password' : 'current-password'
                                }
                                aria-describedby={
                                    needsConfirmation ? 'access-password-hint' : undefined
                                }
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {needsConfirmation && (
                                <p
                                    id="access-password-hint"
                                    className="text-xs text-muted-foreground"
                                >
                                    Use pelo menos 8 caracteres.
                                </p>
                            )}
                        </div>
                    )}
                    {needsConfirmation && (
                        <div className="grid gap-1.5">
                            <label>
                                Confirmar senha
                                <input
                                    ref={confirmRef}
                                    required
                                    minLength={8}
                                    type="password"
                                    autoComplete="new-password"
                                    aria-invalid={passwordsDiffer || undefined}
                                    aria-describedby={
                                        passwordsDiffer ? 'access-password-mismatch' : undefined
                                    }
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                />
                            </label>
                            {passwordsDiffer && (
                                <p
                                    id="access-password-mismatch"
                                    className="text-xs text-red-300"
                                    role="status"
                                >
                                    As senhas precisam ser iguais.
                                </p>
                            )}
                        </div>
                    )}
                    {error && (
                        <p role="alert" className="gs-error">
                            {error}
                        </p>
                    )}
                    <button className="gs-button gs-primary" disabled={busy}>
                        {busy
                            ? 'Aguarde…'
                            : flow === 'forgot'
                              ? 'Enviar link'
                              : flow === 'reset'
                                ? 'Redefinir senha'
                                : signup
                                  ? 'Criar conta'
                                  : 'Entrar'}
                    </button>
                </form>
            )}
            {flow !== 'access' && (
                <Link className="gs-link mt-4 inline-block" to="/login">
                    Voltar ao login
                </Link>
            )}
        </AccessShell>
    );
}
