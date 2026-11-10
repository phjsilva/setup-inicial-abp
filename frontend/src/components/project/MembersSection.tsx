import { useState, type FormEvent } from 'react';
import { errorMessage } from '@/api/authenticated';
import { FormFeedback } from '@/components/shared/FormFeedback';
import { fetchMembers, updateMember } from '@/api/project';
import type { Member } from '@/types/project';
import { useAccountSession } from '@/contexts/auth';

type MemberAccess = Pick<Member, 'role' | 'active'>;

function MemberRow({
    member,
    busy,
    onChange,
}: {
    member: Member;
    busy: boolean;
    onChange: (access: MemberAccess) => void;
}) {
    const [role, setRole] = useState(member.role);
    const roleChanged = role !== member.role;

    function toggleAccess() {
        if (
            member.active &&
            !window.confirm(`Desvincular ${member.name}? A pessoa perderá o acesso ao GreenER.`)
        ) {
            return;
        }
        onChange({ role: member.active ? member.role : role, active: !member.active });
    }

    return (
        <li className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <strong className="min-w-0 break-words">{member.name}</strong>
                    <span className="gs-pill">{member.active ? 'Vinculado' : 'Desvinculado'}</span>
                </div>
                <p className="break-words text-sm text-muted-foreground">{member.email}</p>
                <form
                    className="flex flex-wrap items-end gap-2"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (member.active && roleChanged && !busy) onChange({ role, active: true });
                    }}
                >
                    <label className="min-w-36">
                        Papel
                        <select
                            aria-label={`Papel de ${member.name}`}
                            disabled={busy}
                            value={role}
                            onChange={(event) => setRole(event.target.value as Member['role'])}
                        >
                            <option value="visualizador">Visualizador</option>
                            <option value="admin">Admin</option>
                        </select>
                    </label>
                    {member.active && (
                        <button type="submit" className="gs-button" disabled={busy || !roleChanged}>
                            Salvar papel
                        </button>
                    )}
                </form>
            </div>
            <div className="border-t border-border pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                <button
                    type="button"
                    className={`gs-button ${member.active ? 'text-red-300' : ''}`}
                    disabled={busy}
                    onClick={toggleAccess}
                >
                    {member.active ? 'Desvincular' : 'Vincular'}
                </button>
            </div>
        </li>
    );
}

export function MembersSection({ initial }: { initial: Member[] }) {
    const { session, setSession } = useAccountSession();
    const [members, setMembers] = useState(initial);
    const [search, setSearch] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    async function find(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        setError('');
        setMessage('');
        try {
            setMembers(await fetchMembers(session.token, search));
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setBusy(false);
        }
    }

    async function change(member: Member, access: MemberAccess) {
        if (busy) return;
        setBusy(true);
        setError('');
        setMessage('');
        try {
            const result = await updateMember(member.id, access, session.token);
            setMembers((current) => current.map((item) => (item.id === result.id ? result : item)));
            setMessage('Acesso atualizado.');
            if (result.id === session.user.id)
                setSession(result.active ? { ...session, user: result } : null);
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setBusy(false);
        }
    }

    return (
        <section
            id="usuarios"
            tabIndex={-1}
            className="gs-card gs-project-section scroll-mt-24 space-y-4"
        >
            <h2>Acesso de usuários</h2>
            <p className="text-sm text-muted-foreground">
                Pesquise por nome ou e-mail, altere papéis e vincule ou desvincule contas
                existentes.
            </p>
            <form className="flex flex-wrap items-end gap-3" onSubmit={find}>
                <label className="min-w-36 flex-1">
                    Buscar usuário
                    <input
                        type="search"
                        maxLength={100}
                        disabled={busy}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </label>
                <button className="gs-button" disabled={busy}>
                    Buscar
                </button>
            </form>
            <FormFeedback error={error} message={message} />
            {!members.length && (
                <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
            )}
            <ul className="divide-y divide-border">
                {members.map((member) => (
                    <MemberRow
                        key={`${member.id}:${member.role}:${member.active}`}
                        member={member}
                        busy={busy}
                        onChange={(access) => void change(member, access)}
                    />
                ))}
            </ul>
        </section>
    );
}
