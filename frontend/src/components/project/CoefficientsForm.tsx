import { useRef, useState, type FormEvent } from 'react';
import { errorMessage } from '@/api/authenticated';
import { FormFeedback } from '@/components/shared/FormFeedback';
import { Calculator } from 'lucide-react';
import { activateCoefficients, previewCoefficients } from '@/api/project';
import type { Coefficients, EstimatePreview } from '@/types/project';

const coefficientFields = [
    { id: 'cpuMaxWatts', label: 'Potência máxima da CPU', unit: 'W' },
    { id: 'ramWattsPerGb', label: 'Potência da RAM por GB', unit: 'W/GB' },
    { id: 'diskWattsPerGb', label: 'Potência do disco por GB', unit: 'W/GB' },
    { id: 'networkWattsPerGb', label: 'Potência da rede por GB', unit: 'W/GB' },
] as const;

const estimateRows = [
    { key: 'cpuWatts', label: 'CPU', unit: 'W' },
    { key: 'memoryWatts', label: 'RAM', unit: 'W' },
    { key: 'diskWatts', label: 'Disco', unit: 'W' },
    { key: 'networkWatts', label: 'Rede', unit: 'W' },
] as const;

const impactRows = [
    { key: 'powerW', label: 'Potência total', unit: 'W' },
    { key: 'energyKwh', label: 'Energia', unit: 'kWh' },
    { key: 'co2eG', label: 'Emissões', unit: 'g CO₂e' },
] as const;

const estimateNumber = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 8 });
const deltaNumber = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 8,
    signDisplay: 'exceptZero',
});

function EstimateComparison({ preview }: { preview: EstimatePreview }) {
    const { example, current, proposed } = preview;
    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
                Simulação de {example.collectionIntervalHours} h com intensidade de carbono de{' '}
                {example.carbonIntensity} g CO₂e/kWh.
            </p>
            <ul className="grid gap-3 lg:grid-cols-3" aria-label="Resumo da simulação">
                {impactRows.map(({ key, label, unit }) => (
                    <li
                        key={key}
                        className="min-w-0 rounded-lg border border-white/10 bg-white/5 p-3"
                    >
                        <h4 className="text-sm font-semibold">
                            {label}{' '}
                            <span className="font-normal text-muted-foreground">({unit})</span>
                        </h4>
                        <dl className="mt-3 grid grid-cols-3 gap-2 text-sm tabular-nums">
                            <div className="min-w-0">
                                <dt className="text-xs text-muted-foreground">Atual</dt>
                                <dd className="break-words">
                                    {current ? estimateNumber.format(current[key]) : '—'}
                                </dd>
                            </div>
                            <div className="min-w-0">
                                <dt className="text-xs text-muted-foreground">Proposta</dt>
                                <dd className="break-words font-semibold">
                                    {estimateNumber.format(proposed[key])}
                                </dd>
                            </div>
                            <div className="min-w-0">
                                <dt className="text-xs text-muted-foreground">Diferença</dt>
                                <dd className="break-words">
                                    {current
                                        ? deltaNumber.format(proposed[key] - current[key])
                                        : '—'}
                                </dd>
                            </div>
                        </dl>
                    </li>
                ))}
            </ul>
            {!current && (
                <p className="text-sm text-muted-foreground">
                    Nenhum conjunto ativo para comparar.
                </p>
            )}
            <details className="rounded-lg border border-border p-3">
                <summary className="cursor-pointer text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400">
                    Detalhamento do cálculo
                </summary>
                <div className="mt-3 space-y-3">
                    <p className="text-sm text-muted-foreground">
                        A amostra usa {example.cpuPercent}% de CPU, {example.memoryGb} GB de RAM,{' '}
                        {example.diskGb} GB de disco e {example.networkGb} GB de rede.
                    </p>
                    <div
                        className="overflow-x-auto"
                        role="region"
                        aria-label="Valores da simulação"
                        tabIndex={0}
                    >
                        <table className="gs-table tabular-nums">
                            <thead>
                                <tr>
                                    <th scope="col">Estimativa</th>
                                    <th scope="col">Atual</th>
                                    <th scope="col">Proposta</th>
                                    <th scope="col">Variação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estimateRows.map(({ key, label, unit }) => (
                                    <tr key={key}>
                                        <th scope="row">
                                            {label} ({unit})
                                        </th>
                                        <td>
                                            {current ? estimateNumber.format(current[key]) : '—'}
                                        </td>
                                        <td>{estimateNumber.format(proposed[key])}</td>
                                        <td>
                                            {current
                                                ? deltaNumber.format(proposed[key] - current[key])
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        A potência soma CPU, RAM, disco e rede. Para obter kWh, multiplique a
                        potência pelas horas da amostra e divida por mil. Multiplique o resultado
                        pela intensidade da região para obter as emissões.
                    </p>
                </div>
            </details>
        </div>
    );
}

function readCoefficients(form: HTMLFormElement) {
    const values = new FormData(form);
    return {
        cpuMaxWatts: Number(values.get('cpuMaxWatts')),
        ramWattsPerGb: Number(values.get('ramWattsPerGb')),
        diskWattsPerGb: Number(values.get('diskWattsPerGb')),
        networkWattsPerGb: Number(values.get('networkWattsPerGb')),
    };
}

export function CoefficientsForm({
    initial,
    token,
}: {
    initial: Coefficients | null;
    token: string;
}) {
    const [active, setActive] = useState(initial);
    const [pending, setPending] = useState<'save' | 'preview' | null>(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [simulation, setSimulation] = useState<{
        input: ReturnType<typeof readCoefficients>;
        result: EstimatePreview;
    } | null>(null);
    const canActivate =
        simulation !== null &&
        (!active || coefficientFields.some(({ id }) => simulation.input[id] !== active[id]));
    const formRef = useRef<HTMLFormElement>(null);

    async function simulate() {
        const form = formRef.current;
        if (!form?.reportValidity() || pending) return;
        const body = readCoefficients(form);
        setPending('preview');
        setError('');
        setMessage('');
        setSimulation(null);
        try {
            const result = await previewCoefficients(body, token);
            setSimulation({ input: body, result });
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setPending(null);
        }
    }

    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (pending || !canActivate) return;
        const body = readCoefficients(event.currentTarget);
        if (coefficientFields.some(({ id }) => body[id] !== simulation.input[id])) {
            setSimulation(null);
            setError('Simule novamente os valores preenchidos antes de ativar.');
            return;
        }
        setPending('save');
        setError('');
        setMessage('');
        try {
            const result = await activateCoefficients(body, token);
            setActive(result);
            setSimulation(null);
            setMessage('Novo conjunto ativado para as próximas coletas.');
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setPending(null);
        }
    }

    return (
        <form
            ref={formRef}
            key={active?.id}
            id="estimativas"
            tabIndex={-1}
            className="gs-card gs-project-section scroll-mt-24 space-y-4"
            onSubmit={save}
        >
            <header className="flex flex-wrap items-center justify-between gap-2">
                <h2>Parâmetros de estimativa</h2>
                {active && <span className="gs-pill">Conjunto #{active.id} ativo</span>}
            </header>
            <p className="text-sm text-muted-foreground">
                O novo conjunto vale para as próximas coletas. O histórico conserva os coeficientes
                que já usou.
            </p>
            <fieldset
                className="grid gap-4 sm:grid-cols-2"
                aria-label="Coeficientes"
                disabled={pending !== null}
                onChange={() => {
                    setSimulation(null);
                    setError('');
                    setMessage('');
                }}
            >
                {coefficientFields.map(({ id, label, unit }) => (
                    <label key={id}>
                        {label} ({unit})
                        <input
                            name={id}
                            type="number"
                            min={0}
                            max={999999.9999}
                            step={0.0001}
                            required
                            defaultValue={active?.[id]}
                        />
                    </label>
                ))}
            </fieldset>
            <section className="gs-summary-panel space-y-3" aria-labelledby="estimate-heading">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 font-semibold" id="estimate-heading">
                        <Calculator size={18} aria-hidden="true" /> Prévia da estimativa
                    </h3>
                    <button
                        type="button"
                        className={'gs-button' + (simulation ? '' : ' gs-primary')}
                        disabled={pending !== null}
                        onClick={() => void simulate()}
                    >
                        {pending === 'preview' ? 'Calculando…' : 'Simular cálculo'}
                    </button>
                </div>
                {simulation ? (
                    <EstimateComparison preview={simulation.result} />
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Compare os valores ativos e os preenchidos usando a mesma amostra de 1 hora.
                    </p>
                )}
                <p className="sr-only" role="status">
                    {pending === 'preview'
                        ? 'Calculando estimativa.'
                        : simulation
                          ? 'Simulação disponível no resumo.'
                          : ''}
                </p>
            </section>
            <FormFeedback error={error} message={message} />
            {!canActivate && !message && (
                <p className="text-sm text-muted-foreground">
                    {simulation
                        ? 'Altere os parâmetros e simule novamente para ativar um novo conjunto.'
                        : 'Simule os parâmetros preenchidos para liberar a ativação.'}
                </p>
            )}
            <button
                className={'gs-button' + (canActivate ? ' gs-primary' : '')}
                disabled={pending !== null || !canActivate}
            >
                {pending === 'save' ? 'Ativando…' : 'Ativar novos valores'}
            </button>
        </form>
    );
}
