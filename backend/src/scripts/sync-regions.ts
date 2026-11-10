// src/scripts/sync-regions.ts
import 'dotenv/config';
import { pool } from '../db/connection.js';
import { CarbonClient } from '../integrations/carbon-api.js';
import { MetricsClient } from '../integrations/metrics-api.js';
import { CollectionsRepository } from '../modules/collections/collections.repository.js';
import { CollectionsService } from '../modules/collections/collections.service.js';

const carbonUrl = process.env.CARBON_API_URL;
const metricsUrl = process.env.METRICS_API_URL;
if (!carbonUrl || !metricsUrl) throw new Error('URLs das APIs não configuradas');

const service = new CollectionsService(
    new CollectionsRepository(pool),
    new CarbonClient(carbonUrl),
    new MetricsClient(metricsUrl),
);

try {
    await service.syncRegions();
} catch (err) {
    console.error('Falhou:', err);
} finally {
    await pool.end(); // senão o processo fica preso com o pool aberto
}
