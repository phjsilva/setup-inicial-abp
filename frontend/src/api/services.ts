import type {
  ServiceLocation,
  ServiceMetrics,
  ServiceStatus,
  ServiceSummary,
} from '@/types/service';

const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');
export const REFRESH_MS = 5_000;
export type Range = '1h' | '6h' | '24h' | '7d' | '30d';
export interface Collection {
  collectedAt: string;
  collectionIntervalSeconds: number;
  metrics: ServiceMetrics;
  estimates: {
    powerWatts: number;
    energyKwh: number;
    co2eGrams: number;
    carbonIntensityGco2ePerKwh: number;
  };
}
export interface ApiService {
  id: string;
  name: string;
  active: boolean;
  status: ServiceStatus;
  statusUpdatedAt: string;
  lastSeenAt: string;
  location:
    (ServiceLocation & { currentCarbonIntensityGco2ePerKwh?: number }) | null;
}
export interface Overview {
  service: ApiService;
  latestCollection: Collection | null;
}
export interface Analytics {
  serviceId: string;
  range: Range;
  period: { from: string; to: string };
  summary: {
    sampleCount: number;
    energyKwh: number | null;
    co2eGrams: number | null;
  };
  points: {
    timestamp: string;
    cpuPercent: number;
    memoryGb: number;
    powerWatts: number;
    co2ePerCollectionGrams: number;
  }[];
}
export interface Monitoring {
  serverTime: string;
  collectionIntervalSeconds: number;
  lastSuccessfulCollectionAt: string | null;
  nextCollectionAt: string | null;
  running: boolean;
  dependencies: { metricsDiscovery: string; carbon: string; database: string };
}
type JsonObject = Record<string, unknown>;
const object = (value: unknown): value is JsonObject =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const number = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const date = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));
const textOrNull = (value: unknown) =>
  value === null || typeof value === 'string';
const numberOrNull = (value: unknown) => value === null || number(value);
const fields = (value: unknown, names: string[]) =>
  object(value) && names.every((name) => number(value[name]));
const location = (value: unknown) =>
  value === null ||
  (object(value) &&
    typeof value.regionCode === 'string' &&
    typeof value.country === 'string' &&
    typeof value.region === 'string' &&
    textOrNull(value.city) &&
    numberOrNull(value.latitude) &&
    numberOrNull(value.longitude) &&
    (value.currentCarbonIntensityGco2ePerKwh === undefined ||
      number(value.currentCarbonIntensityGco2ePerKwh)));
const service = (value: unknown) =>
  object(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.active === 'boolean' &&
  typeof value.status === 'string' &&
  ['available', 'metrics_missing', 'unavailable'].includes(
    String(value.status),
  ) &&
  date(value.statusUpdatedAt) &&
  date(value.lastSeenAt) &&
  location(value.location);
const collection = (value: unknown) =>
  value === null ||
  (object(value) &&
    date(value.collectedAt) &&
    number(value.collectionIntervalSeconds) &&
    value.collectionIntervalSeconds > 0 &&
    fields(value.metrics, ['cpuPercent', 'memoryGb', 'diskGb', 'networkGb']) &&
    fields(value.estimates, [
      'powerWatts',
      'energyKwh',
      'co2eGrams',
      'carbonIntensityGco2ePerKwh',
    ]));
const overview = (value: unknown): value is Overview =>
  object(value) && service(value.service) && collection(value.latestCollection);
const servicesResponse = (value: unknown): value is ServicesResponse =>
  object(value) &&
  date(value.generatedAt) &&
  object(value.filters) &&
  textOrNull(value.filters.regionCode) &&
  (value.filters.active === null ||
    typeof value.filters.active === 'boolean') &&
  Array.isArray(value.services) &&
  value.services.every(
    (item) =>
      service(item) && object(item) && collection(item.latestCollection),
  );
const analytics = (value: unknown): value is Analytics =>
  object(value) &&
  typeof value.serviceId === 'string' &&
  typeof value.range === 'string' &&
  ['1h', '6h', '24h', '7d', '30d'].includes(String(value.range)) &&
  object(value.period) &&
  date(value.period.from) &&
  date(value.period.to) &&
  object(value.summary) &&
  number(value.summary.sampleCount) &&
  numberOrNull(value.summary.energyKwh) &&
  numberOrNull(value.summary.co2eGrams) &&
  Array.isArray(value.points) &&
  value.points.every(
    (point) =>
      object(point) &&
      date(point.timestamp) &&
      fields(point, [
        'cpuPercent',
        'memoryGb',
        'powerWatts',
        'co2ePerCollectionGrams',
      ]),
  );
const monitoring = (value: unknown): value is Monitoring =>
  object(value) &&
  date(value.serverTime) &&
  number(value.collectionIntervalSeconds) &&
  value.collectionIntervalSeconds > 0 &&
  (value.lastSuccessfulCollectionAt === null ||
    date(value.lastSuccessfulCollectionAt)) &&
  (value.nextCollectionAt === null || date(value.nextCollectionAt)) &&
  typeof value.running === 'boolean' &&
  object(value.dependencies) &&
  ['metricsDiscovery', 'carbon', 'database'].every(
    (key) =>
      object(value.dependencies) &&
      typeof value.dependencies[key] === 'string' &&
      ['available', 'unavailable', 'unknown'].includes(
        String(value.dependencies[key]),
      ),
  );

export async function request<T>(
  path: string,
  signal?: AbortSignal,
  validate?: (value: unknown) => value is T,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1${path}`, {
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(10_000)])
        : AbortSignal.timeout(10_000),
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(
      'Não foi possível conectar à API. Verifique a conexão e tente novamente.',
      {
        cause: error,
      },
    );
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error?.message ??
        `Falha ao consultar a API (HTTP ${response.status}).`,
    );
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error('A API demorou para enviar os dados. Tente novamente.', {
        cause: error,
      });
    }
    throw new Error('A API retornou uma resposta JSON inválida.', {
      cause: error,
    });
  }
  if (validate && !validate(data))
    throw new Error(
      'A API retornou dados incompletos ou inválidos para esta consulta.',
    );
  return data as T;
}

// O próximo poll só é agendado após o anterior terminar. O cleanup aborta a
// requisição e impede callbacks antigos após mudança de filtro, ID ou período.
export function poll<T>(
  load: (signal: AbortSignal) => Promise<T>,
  success: (data: T) => void,
  failure: (message: string) => void,
) {
  const controller = new AbortController();
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  async function tick() {
    try {
      const data = await load(controller.signal);
      if (!stopped) success(data);
    } catch (error) {
      if (!stopped)
        failure(
          error instanceof Error ? error.message : 'Erro ao carregar os dados.',
        );
    } finally {
      if (!stopped) timer = setTimeout(tick, REFRESH_MS);
    }
  }
  void tick();
  return () => {
    stopped = true;
    controller.abort();
    clearTimeout(timer);
  };
}

export interface ServicesResponse {
  generatedAt: string;
  filters: { regionCode: string | null; active: boolean | null };
  services: (ApiService & { latestCollection: Collection | null })[];
}
export async function fetchServices(
  filters: { regionCode?: string; active?: boolean } = {},
  signal?: AbortSignal,
) {
  const query = new URLSearchParams();
  if (filters.regionCode !== undefined)
    query.set('regionCode', filters.regionCode);
  if (filters.active !== undefined) query.set('active', String(filters.active));
  const data = await request<ServicesResponse>(
    `/services${query.size ? `?${query}` : ''}`,
    signal,
    servicesResponse,
  );
  const services: ServiceSummary[] = data.services.map(
    ({ latestCollection, ...service }) => ({
      ...service,
      collectedAt: latestCollection?.collectedAt ?? null,
      metrics: latestCollection?.metrics ?? null,
      environmental: latestCollection
        ? {
            ...latestCollection.estimates,
            carbonIntensity:
              latestCollection.estimates.carbonIntensityGco2ePerKwh,
            renewableSharePercent: null,
          }
        : null,
    }),
  );
  return { ...data, services };
}
export const fetchOverview = (id: string, signal?: AbortSignal) =>
  request<Overview>(
    `/services/${encodeURIComponent(id)}`,
    signal,
    (value): value is Overview => overview(value) && value.service.id === id,
  );
export const fetchAnalytics = (
  id: string,
  range: Range,
  signal?: AbortSignal,
) =>
  request<Analytics>(
    `/services/${encodeURIComponent(id)}/collections?range=${range}&maxPoints=120`,
    signal,
    (value): value is Analytics =>
      analytics(value) && value.serviceId === id && value.range === range,
  );
export const fetchMonitoring = (signal?: AbortSignal) =>
  request<Monitoring>('/monitoring/status', signal, monitoring);
