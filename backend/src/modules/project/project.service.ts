import { calculateEmissions } from '../collections/collections.estimate.js';
import type { MonitoringService } from '../monitoring/monitoring.service.js';
import type { ProjectRepository } from './project.repository.js';
import type { CoefficientsInput, MemberAccess, MembersQuery } from './project.schema.js';

const example = {
    cpuPercent: 50,
    memoryGb: 4,
    diskGb: 20,
    networkGb: 1,
    collectionIntervalHours: 1,
    carbonIntensity: 100,
};

function estimateExample(values: CoefficientsInput) {
    return calculateEmissions(
        example,
        {
            cpu_max_watts: values.cpuMaxWatts,
            ram_watts_per_gb: values.ramWattsPerGb,
            disk_watts_per_gb: values.diskWattsPerGb,
            network_watts_per_gb: values.networkWattsPerGb,
        },
        example.carbonIntensity,
    );
}

export class ProjectService {
    constructor(
        private readonly repository: ProjectRepository,
        private readonly monitoring: MonitoringService,
    ) {}
    async collectionSettings() {
        const intervalSeconds = await this.repository.getInterval();
        const monitoring = this.monitoring.getStatus();
        return {
            intervalSeconds: intervalSeconds ?? monitoring.collectionIntervalSeconds,
            effectiveIntervalSeconds: monitoring.collectionIntervalSeconds,
            lastRoundAt: monitoring.lastRoundFinishedAt,
            nextRoundAt: monitoring.nextCollectionAt,
        };
    }
    async updateInterval(intervalSeconds: number, actor: string) {
        await this.repository.updateInterval(intervalSeconds, actor);
        return { intervalSeconds };
    }
    activeCoefficients() {
        return this.repository.activeCoefficients();
    }
    async previewCoefficients(proposed: CoefficientsInput) {
        const active = await this.repository.activeCoefficients();
        return {
            example,
            current: active ? estimateExample(active) : null,
            proposed: estimateExample(proposed),
        };
    }
    activateCoefficients(input: CoefficientsInput) {
        return this.repository.activateCoefficients(input);
    }
    listMembers(query: MembersQuery) {
        return this.repository.listMembers(query);
    }
    updateMember(id: string, actor: string, access: MemberAccess) {
        return this.repository.updateMember(id, actor, access);
    }
}
