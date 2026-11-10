import { useState, type FormEvent } from 'react';
import { errorMessage } from '@/api/authenticated';
import { FormFeedback } from '@/components/shared/FormFeedback';
import { updateCollectionInterval } from '@/api/project';
import type { CollectionSettings } from '@/types/project';
import { useMonitoring } from '@/contexts/monitoring';
import { formatDateTime } from '@/lib/format';

export function CollectionForm({
    settings,
    token,
}: {
    settings: CollectionSettings;
    token: string;
}) {
    const [interval, setInterval] = useState(String(settings.intervalSeconds));
    const [persisted, setPersisted] = useState(settings.intervalSeconds);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const { status } = useMonitoring();
    const effective = status?.collectionIntervalSeconds ?? settings.effectiveIntervalSeconds;
    const last = status?.lastRoundFinishedAt ?? settings.lastRoundAt;
    const changed = Number(interval) !== persisted;

    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!changed || busy) return;
        setBusy(true);
        setError('');
        setMessage('');
        try {
            const result = await updateCollectionInterval(Number(interval), token);
            setPersisted(result.intervalSeconds);
            setInterval(String(result.intervalSeconds));
            setMessage('Intervalo salvo.');
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setBusy(false);
        }
    }
    return (
        <form
            id="coleta"
            tabIndex={-1}
            className="gs-card gs-project-section scroll-mt-24 space-y-4"
            onSubmit={save}
        >
            <h2>Coleta de métricas</h2>
            <dl className="grid gap-3 rounded-xl border border-border bg-white/5 px-4 py-3 sm:grid-cols-2">
                <div>
                    <dt className="text-sm text-muted-foreground">Intervalo em uso</dt>
                    <dd className="mt-1 text-xl font-semibold tabular-nums">{effective} s</dd>
                </div>
                <div>
                    <dt className="text-sm text-muted-foreground">Última rodada</dt>
                    <dd className="mt-1 font-medium">
                        {last ? (
                            <time dateTime={last}>{formatDateTime(last)}</time>
                        ) : (
                            'Nenhuma rodada registrada'
                        )}
                    </dd>
                </div>
            </dl>
            {persisted !== effective && (
                <p className="gs-notice">
                    O intervalo salvo de <strong>{persisted} s</strong> será usado no próximo
                    agendamento.
                </p>
            )}
            <p className="text-sm text-muted-foreground">
                Defina a pausa entre as rodadas automáticas, de 10 a 3.600 segundos.
            </p>
            <label className="max-w-72">
                Intervalo entre rodadas (s)
                <input
                    type="number"
                    min={10}
                    max={3600}
                    step={1}
                    required
                    disabled={busy}
                    value={interval}
                    onChange={(e) => {
                        setInterval(e.target.value);
                        setError('');
                        setMessage('');
                    }}
                />
            </label>
            <FormFeedback error={error} message={message} />
            <button className="gs-button gs-primary" disabled={busy || !changed}>
                {busy ? 'Salvando…' : 'Salvar intervalo'}
            </button>
        </form>
    );
}
