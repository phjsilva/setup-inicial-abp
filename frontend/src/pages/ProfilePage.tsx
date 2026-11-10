import { useState, type FormEvent } from 'react';
import { updateProfile } from '@/api/accounts';
import { errorMessage } from '@/api/authenticated';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageShell } from '@/components/shared/PageShell';
import { useAccountSession } from '@/contexts/auth';

export function ProfilePage() {
    const { session, setSession } = useAccountSession();
    const [name, setName] = useState(session.user.name);
    const [email, setEmail] = useState(session.user.email);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [busy, setBusy] = useState(false);
    const normalizedEmail = email.trim().toLowerCase();
    const changingEmail = normalizedEmail !== session.user.email;
    const hasChanges =
        name.trim() !== session.user.name.trim() ||
        normalizedEmail !== session.user.email.trim().toLowerCase();

    function clearFeedback() {
        setError('');
        setSaved(false);
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!hasChanges || busy) return;
        setBusy(true);
        clearFeedback();
        try {
            const result = await updateProfile(
                {
                    name: name.trim(),
                    email: normalizedEmail,
                    currentPassword: changingEmail ? password : undefined,
                },
                session.token,
            );
            setSession(result);
            setName(result.user.name);
            setEmail(result.user.email);
            setPassword('');
            setSaved(true);
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="greener-sprint">
            <PageShell>
                <div className="mx-auto max-w-2xl space-y-4">
                    <PageHeader title="Meu perfil" description="Gerencie os dados da sua conta." />
                    <section
                        className="gs-card gs-profile-summary grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 min-[360px]:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-5"
                        aria-label="Conta atual"
                    >
                        <span className="gs-avatar" aria-hidden="true">
                            {session.user.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0 break-words">
                            <h2 className="text-lg font-semibold">{session.user.name}</h2>
                            <p className="text-muted-foreground">{session.user.email}</p>
                        </div>
                        <span className="gs-pill col-start-2 w-fit min-[360px]:col-start-auto">
                            {session.user.role === 'admin' ? 'Admin' : 'Visualizador'}
                        </span>
                    </section>
                    <section className="gs-card">
                        <h2 className="text-lg font-semibold">Dados da conta</h2>
                        <form className="mt-5 grid gap-4" onSubmit={submit}>
                            <fieldset disabled={busy} className="grid min-w-0 gap-4">
                                <label>
                                    Nome
                                    <input
                                        required
                                        maxLength={100}
                                        autoComplete="name"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            clearFeedback();
                                        }}
                                    />
                                </label>
                                <div className="space-y-1.5">
                                    <label>
                                        E-mail
                                        <input
                                            required
                                            type="email"
                                            maxLength={254}
                                            autoComplete="email"
                                            aria-describedby="profile-email-hint"
                                            value={email}
                                            onChange={(e) => {
                                                const nextEmail = e.target.value;
                                                setEmail(nextEmail);
                                                if (
                                                    nextEmail.trim().toLowerCase() ===
                                                    session.user.email
                                                ) {
                                                    setPassword('');
                                                }
                                                clearFeedback();
                                            }}
                                        />
                                    </label>
                                    <p
                                        id="profile-email-hint"
                                        className="text-xs text-muted-foreground"
                                    >
                                        Para trocar o e-mail, confirme sua senha atual.
                                    </p>
                                </div>
                                {changingEmail && (
                                    <label className="max-w-sm">
                                        Senha atual
                                        <input
                                            required
                                            minLength={8}
                                            type="password"
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                clearFeedback();
                                            }}
                                        />
                                    </label>
                                )}
                            </fieldset>
                            {error && (
                                <p className="gs-error" role="alert">
                                    {error}
                                </p>
                            )}
                            {saved && (
                                <p className="gs-notice" role="status">
                                    Dados da conta salvos.
                                </p>
                            )}
                            <div>
                                <button
                                    className="gs-button gs-primary"
                                    disabled={busy || !hasChanges}
                                >
                                    {busy ? 'Salvando…' : 'Salvar alterações'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </PageShell>
        </div>
    );
}
