import { z } from 'zod';

export const snapshotRangeSchema = z.enum(['1h', '6h', '24h', '7d', '30d']);
export type SnapshotRange = z.infer<typeof snapshotRangeSchema>;
