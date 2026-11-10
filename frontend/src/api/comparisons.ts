import { postJson } from '@/api/services';

import type { ComparisonRequest, ComparisonResponse } from '@/types/comparison';

export async function compareServices(request: ComparisonRequest): Promise<ComparisonResponse> {
    return postJson<ComparisonRequest, ComparisonResponse>('/comparisons', request);
}
