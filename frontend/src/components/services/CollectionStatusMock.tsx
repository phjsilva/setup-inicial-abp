import { Fragment, useState } from 'react';
import {
    Activity,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock3,
    Search,
    TriangleAlert,
} from 'lucide-react';

type Result =
    'success' | 'timeout' | 'metrics_missing' | 'service_missing' | 'bad_status' | 'pending';
const labels: Record<Result, string> = {
    success: 'Coleta realizada',
    timeout: 'Tempo de espera excedido',
    metrics_missing: 'Métricas indisponíveis',
    service_missing: 'Serviço não encontrado',
    bad_status: 'Erro na plataforma',
    pending: 'Sem tentativas',
};
const descriptions: Record<Result, string> = {
    success: 'Métricas coletadas e salvas com sucesso.',
    timeout: 'A plataforma de métricas não respondeu dentro do tempo limite.',
    metrics_missing: 'Não foi possível obter as métricas deste serviço.',
    service_missing: 'O serviço não foi encontrado na consulta de métricas.',
    bad_status: 'A plataforma de métricas está temporariamente indisponível.',
    pending: 'Este serviço ainda não possui tentativas de coleta.',
};
const mockServices: {
    id: string;
    name: string;
    region: string;
    result: Result;
    lastSuccess: string | null;
    history: Result[];
}[] = [
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'checkout-worker',
        name: 'Checkout Worker',
        region: 'Virgínia · US',
        result: 'timeout',
        lastSuccess: '13:28:30',
        history: ['timeout', 'timeout', 'timeout', 'success', 'success'],
    },
    {
        id: 'recommendation-ai',
        name: 'Recommendation AI',
        region: 'Frankfurt · DE',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'success', 'success'],
    },
    {
        id: 'inventory-sync',
        name: 'Inventory Sync',
        region: 'São Paulo · BR',
        result: 'metrics_missing',
        lastSuccess: '13:29:00',
        history: ['metrics_missing', 'metrics_missing', 'success', 'success', 'success'],
    },
    {
        id: 'email-dispatcher',
        name: 'Email Dispatcher',
        region: 'Londres · GB',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'bad_status', 'success', 'success'],
    },
    {
        id: 'fraud-detector',
        name: 'Fraud Detector',
        region: 'Virgínia · US',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'success', 'success'],
    },
    {
        id: 'reporting-batch',
        name: 'Reporting Batch',
        region: 'Frankfurt · DE',
        result: 'service_missing',
        lastSuccess: '13:28:00',
        history: [
            'service_missing',
            'service_missing',
            'service_missing',
            'service_missing',
            'success',
        ],
    },
    {
        id: 'audit-stream',
        name: 'Audit Stream',
        region: 'Londres · GB',
        result: 'pending',
        lastSuccess: null,
        history: [],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
    {
        id: 'billing-api',
        name: 'Billing API',
        region: 'São Paulo · BR',
        result: 'success',
        lastSuccess: '13:30:00',
        history: ['success', 'success', 'success', 'timeout', 'success'],
    },
];
const timeAt = (index: number) =>
    `13:${String(30 - Math.ceil(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`;
const isFailure = (result: Result) => result !== 'success' && result !== 'pending';

function ResultBadge({ result }: { result: Result }) {
    const Icon =
        result === 'success' ? CheckCircle2 : result === 'pending' ? Clock3 : TriangleAlert;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${result === 'success' ? 'bg-primary/10 text-primary' : result === 'pending' ? 'bg-white/5 text-muted-foreground' : 'bg-amber-400/10 text-amber-300'}`}
        >
            <Icon size={13} aria-hidden="true" />
            {labels[result]}
        </span>
    );
}

export function CollectionStatusMock() {
    const [search, setSearch] = useState('');
    const [resultFilter, setResultFilter] = useState('all');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [historyType, setHistoryType] = useState('all');
    const scope = mockServices.filter((service) =>
        `${service.name} ${service.id}`.toLowerCase().includes(search.toLowerCase()),
    );
    const visible = scope.filter(
        (service) =>
            resultFilter === 'all' ||
            (resultFilter === 'failed'
                ? isFailure(service.result)
                : service.result === resultFilter),
    );
    const cards = [
        {
            label: 'Serviços monitorados',
            count: scope.length,
            note: 'Nesta demonstração',
            icon: Activity,
            color: 'text-cyan-300',
            filter: 'all',
        },
        {
            label: 'Coletas em dia',
            count: scope.filter((s) => s.result === 'success').length,
            note: 'Última tentativa com sucesso',
            icon: CheckCircle2,
            color: 'text-primary',
            filter: 'success',
        },
        {
            label: 'Precisam de atenção',
            count: scope.filter((s) => isFailure(s.result)).length,
            note: 'Última tentativa com falha',
            icon: TriangleAlert,
            color: 'text-amber-300',
            filter: 'failed',
        },
        {
            label: 'Aguardando coleta',
            count: scope.filter((s) => s.result === 'pending').length,
            note: 'Sem tentativas registradas',
            icon: Clock3,
            color: 'text-muted-foreground',
            filter: 'pending',
        },
    ];

    return (
        <section aria-label="Demonstração do status de coleta" className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-300/20 bg-cyan-300/5 px-4 py-3 text-sm">
                <div>
                    <span className="mr-2 rounded bg-cyan-300/15 px-2 py-1 text-xs font-semibold text-cyan-300">
                        DEMONSTRAÇÃO
                    </span>
                    <span className="text-muted-foreground">
                        Dados fictícios para visualizar a proposta.
                    </span>
                </div>
                <span className="text-xs text-muted-foreground">
                    Cenário: 28/10/2026 · 13:30 (Brasília)
                </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map(({ label, count, note, icon: Icon, color, filter }) => (
                    <button
                        key={label}
                        type="button"
                        aria-pressed={resultFilter === filter}
                        onClick={() => setResultFilter(filter)}
                        className={`rounded-xl border bg-card p-5 text-left transition-colors hover:bg-white/10 ${resultFilter === filter ? 'border-primary/40' : 'border-white/10'}`}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-muted-foreground">{label}</span>
                            <Icon size={18} className={color} aria-hidden="true" />
                        </div>
                        <p className={`mt-3 text-3xl font-semibold tabular-nums ${color}`}>
                            {count}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                    </button>
                ))}
            </div>
            <div className="overflow-hidden rounded-xl border bg-card">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b p-5">
                    <div>
                        <h2 className="text-lg font-semibold">Acompanhamento das coletas</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Veja a última tentativa e investigue o histórico de cada serviço.
                        </p>
                    </div>
                    <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                        {visible.length} de {scope.length} serviços
                    </span>
                </div>
                <div className="flex flex-wrap gap-3 p-5">
                    <label className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border bg-background/40 px-3">
                        <Search size={16} className="text-muted-foreground" aria-hidden="true" />
                        <input
                            aria-label="Buscar serviço"
                            placeholder="Buscar por nome ou identificador..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-transparent py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        Resultado
                        <select
                            value={resultFilter}
                            onChange={(e) => setResultFilter(e.target.value)}
                            className="rounded-lg border bg-secondary px-3 py-2.5 text-foreground"
                        >
                            <option value="all">Todos os resultados</option>
                            <option value="success">Sucesso</option>
                            <option value="failed">Com falha</option>
                            <option value="pending">Sem tentativas</option>
                        </select>
                    </label>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <caption className="sr-only">
                            Última tentativa de coleta por serviço, dados fictícios de 28 de outubro
                            de 2026
                        </caption>
                        <thead className="border-y bg-background/25 text-xs text-muted-foreground">
                            <tr>
                                {[
                                    'Serviço',
                                    'Última tentativa',
                                    'Resultado da coleta',
                                    'Último sucesso',
                                    'Histórico',
                                ].map((title) => (
                                    <th
                                        key={title}
                                        scope="col"
                                        className="whitespace-nowrap px-5 py-3 font-medium"
                                    >
                                        {title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {visible.map((service) => (
                                <Fragment key={service.id}>
                                    <tr className="hover:bg-white/[0.025]">
                                        <td className="px-5 py-4">
                                            <p className="font-medium">{service.name}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {service.region}
                                            </p>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 tabular-nums">
                                            {service.result === 'pending' ? (
                                                <span className="text-muted-foreground">
                                                    Sem registro
                                                </span>
                                            ) : (
                                                <>
                                                    <p>13:30:00</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        28 out. 2026
                                                    </p>
                                                </>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <ResultBadge result={service.result} />
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 tabular-nums">
                                            <p>{service.lastSuccess ?? '—'}</p>
                                            {service.lastSuccess && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    28 out. 2026
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                aria-label={`${expanded === service.id ? 'Fechar' : 'Ver'} histórico de ${service.name}`}
                                                aria-expanded={expanded === service.id}
                                                aria-controls={`history-${service.id}`}
                                                onClick={() => {
                                                    setExpanded(
                                                        expanded === service.id ? null : service.id,
                                                    );
                                                    setHistoryType('all');
                                                }}
                                                className="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-2 text-xs font-medium text-primary hover:bg-primary/10"
                                            >
                                                {expanded === service.id
                                                    ? 'Fechar'
                                                    : 'Ver histórico'}
                                                {expanded === service.id ? (
                                                    <ChevronDown size={14} />
                                                ) : (
                                                    <ChevronRight size={14} />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                    {expanded === service.id && (
                                        <tr id={`history-${service.id}`}>
                                            <td colSpan={5} className="bg-background/40 px-5 py-5">
                                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                                    <div>
                                                        <h3 className="font-medium">
                                                            Histórico · {service.name}
                                                        </h3>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            28/10/2026, 13:28–13:30 · Horário de
                                                            Brasília · Dados fictícios
                                                        </p>
                                                    </div>
                                                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        Tipo
                                                        <select
                                                            value={historyType}
                                                            onChange={(e) =>
                                                                setHistoryType(e.target.value)
                                                            }
                                                            className="rounded-md border bg-secondary px-3 py-2 text-foreground"
                                                        >
                                                            <option value="all">
                                                                Todos os tipos
                                                            </option>
                                                            {[...new Set(service.history)].map(
                                                                (type) => (
                                                                    <option key={type} value={type}>
                                                                        {labels[type]} (
                                                                        {
                                                                            service.history.filter(
                                                                                (t) => t === type,
                                                                            ).length
                                                                        }
                                                                        )
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </label>
                                                </div>
                                                {service.history.length === 0 ? (
                                                    <p className="py-4 text-sm text-muted-foreground">
                                                        O histórico aparecerá após a primeira
                                                        tentativa de coleta.
                                                    </p>
                                                ) : (
                                                    <ul className="divide-y rounded-lg border px-4">
                                                        {service.history
                                                            .map((type, index) => ({ type, index }))
                                                            .filter(
                                                                (item) =>
                                                                    historyType === 'all' ||
                                                                    item.type === historyType,
                                                            )
                                                            .map(({ type, index }) => (
                                                                <li
                                                                    key={index}
                                                                    className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3"
                                                                >
                                                                    <span className="font-mono text-xs text-muted-foreground">
                                                                        {timeAt(index)}
                                                                    </span>
                                                                    <ResultBadge result={type} />
                                                                    <span className="flex-1 text-xs text-muted-foreground">
                                                                        {descriptions[type]}
                                                                    </span>
                                                                    {[
                                                                        'metrics_missing',
                                                                        'service_missing',
                                                                        'bad_status',
                                                                    ].includes(type) && (
                                                                        <span className="font-mono text-xs text-muted-foreground">
                                                                            HTTP{' '}
                                                                            {type ===
                                                                            'metrics_missing'
                                                                                ? 500
                                                                                : type ===
                                                                                    'service_missing'
                                                                                  ? 404
                                                                                  : 503}
                                                                        </span>
                                                                    )}
                                                                </li>
                                                            ))}
                                                    </ul>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                            {visible.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-5 py-12 text-center text-muted-foreground"
                                    >
                                        Nenhum serviço encontrado com esses filtros.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <p className="border-t px-5 py-3 text-xs text-muted-foreground">
                    Uma falha na coleta pode indicar dificuldade de acesso às métricas e não
                    confirma que o serviço esteja fora do ar.
                </p>
            </div>
        </section>
    );
}
