BEGIN;

CREATE TABLE IF NOT EXISTS status_coleta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    servico_id BIGINT NOT NULL REFERENCES servico(id),
    coleta_id UUID REFERENCES coleta(id),
    observado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    descricao TEXT NOT NULL,
    http_status SMALLINT CHECK (http_status BETWEEN 100 AND 599),
    tipo TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_status_coleta_servico_tempo
    ON status_coleta(servico_id, observado_em DESC);

COMMIT;
