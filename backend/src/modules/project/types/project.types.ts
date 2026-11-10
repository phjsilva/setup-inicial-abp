import type { Account } from '../../accounts/types/accounts.types.js';
import type { CoefficientsInput } from '../project.schema.js';

export interface Coefficients extends CoefficientsInput {
    id: string;
}
export interface ProjectMember extends Account {
    active: boolean;
}
