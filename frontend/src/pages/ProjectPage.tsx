import { useEffect, useState } from 'react';
import { fetchCollectionSettings, fetchCoefficients, fetchMembers } from '@/api/project';
import { errorMessage } from '@/api/authenticated';
import type { Coefficients, CollectionSettings, Member } from '@/types/project';
import { CollectionForm } from '@/components/project/CollectionForm';
import { CoefficientsForm } from '@/components/project/CoefficientsForm';
import { MembersSection } from '@/components/project/MembersSection';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageShell } from '@/components/shared/PageShell';
import { useAccountSession } from '@/contexts/auth';

export function ProjectPage() {
    const { session } = useAccountSession();
    const token = session.token;
    const [data, setData] = useState<[CollectionSettings, Coefficients | null, Member[]] | null>(
        null,
    );
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        Promise.all([
            fetchCollectionSettings(token, signal),
            fetchCoefficients(token, signal),
            fetchMembers(token, '', signal),
        ])
            .then((result) => {
                if (!controller.signal.aborted) setData(result);
            })
            .catch((failure: unknown) => {
                if (!controller.signal.aborted) setError(errorMessage(failure));
            });
        return () => controller.abort();
    }, [token]);

    return (
        <div className="greener-sprint">
            <PageShell>
                <PageHeader
                    title="Configuração do projeto"
                    description="Gerencie coleta, estimativas ambientais e acesso ao GreenER."
                    actions={<span className="gs-pill">Admin</span>}
                />
                {error ? (
                    <p className="gs-error" role="alert">
                        {error}
                    </p>
                ) : data ? (
                    <>
                        <nav aria-label="Seções da configuração" className="flex flex-wrap gap-2">
                            <a href="#coleta" className="gs-button">
                                Coleta
                            </a>
                            <a href="#estimativas" className="gs-button">
                                Estimativas
                            </a>
                            <a href="#usuarios" className="gs-button">
                                Usuários
                            </a>
                        </nav>
                        <CollectionForm settings={data[0]} token={token} />
                        <CoefficientsForm initial={data[1]} token={token} />
                        <MembersSection initial={data[2]} />
                    </>
                ) : (
                    <p role="status">Carregando configuração…</p>
                )}
            </PageShell>
        </div>
    );
}
