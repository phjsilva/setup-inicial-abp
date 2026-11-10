import type { WidgetId } from '@/types/dashboard';

export const widgets: Record<WidgetId, { name: string; group: string; description: string }> = {
    energy: { name: 'Energia estimada', group: 'Impacto', description: 'Consumo total no período' },
    carbon: { name: 'Emissões estimadas', group: 'Impacto', description: 'CO₂e total no período' },
    trend: {
        name: 'Energia ao longo do tempo',
        group: 'Gráficos',
        description: 'Consumo dos serviços no período',
    },
    'carbon-trend': {
        name: 'Emissões ao longo do tempo',
        group: 'Gráficos',
        description: 'CO₂e estimado em cada intervalo',
    },
    'cpu-trend': {
        name: 'CPU ao longo do tempo',
        group: 'Gráficos',
        description: 'Utilização média de CPU em cada intervalo',
    },
    'memory-trend': {
        name: 'Memória ao longo do tempo',
        group: 'Gráficos',
        description: 'Memória média em uso em cada intervalo',
    },
    'power-trend': {
        name: 'Potência ao longo do tempo',
        group: 'Gráficos',
        description: 'Potência média estimada em cada intervalo',
    },
    'energy-by-service': {
        name: 'Energia por serviço',
        group: 'Gráficos',
        description: 'Barras com até oito serviços de maior consumo',
    },
    power: {
        name: 'Potência estimada',
        group: 'Recursos',
        description: 'Potência média das amostras',
    },
    cpu: { name: 'Uso médio de CPU', group: 'Recursos', description: 'Média das amostras' },
    memory: { name: 'Memória em uso', group: 'Recursos', description: 'Uso médio de memória' },
    status: {
        name: 'Status dos serviços',
        group: 'Operação',
        description: 'Último status observado',
    },
    collections: {
        name: 'Últimas coletas',
        group: 'Operação',
        description: 'Última amostra por serviço no período',
    },
    availability: {
        name: 'Disponibilidade dos serviços',
        group: 'Operação',
        description: 'Contagem por status observado',
    },
    ranking: {
        name: 'Ranking de emissões',
        group: 'Análise',
        description: 'Serviços com maior CO₂e',
    },
    regions: {
        name: 'Intensidade por região',
        group: 'Análise',
        description: 'Emissões por kWh em cada região',
    },
    comparison: {
        name: 'Comparação de serviços',
        group: 'Análise',
        description: 'Consumo dos dois serviços escolhidos',
    },
};

export const templates: { name: string; description: string; widgets: WidgetId[] }[] = [
    {
        name: 'Impacto ambiental',
        description: 'Consumo por serviço, ranking de emissões e intensidade regional.',
        widgets: ['energy-by-service', 'ranking', 'regions'],
    },
    {
        name: 'Saúde dos serviços',
        description: 'Status, disponibilidade e coletas.',
        widgets: ['status', 'collections', 'availability', 'cpu'],
    },
    {
        name: 'Uso de recursos',
        description: 'CPU, memória e potência.',
        widgets: ['cpu', 'memory', 'power', 'cpu-trend'],
    },
    {
        name: 'Comparar serviços',
        description: 'Consumo lado a lado e ranking.',
        widgets: ['comparison', 'ranking', 'carbon'],
    },
    { name: 'Em branco', description: 'Escolha os widgets no catálogo.', widgets: [] },
];
