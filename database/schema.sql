BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE usuario (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    papel TEXT NOT NULL DEFAULT 'admin'
        CHECK (papel IN ('admin', 'visualizador')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE regiao (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    pais TEXT NOT NULL,
    regiao TEXT NOT NULL,
    cidade TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    carbon_intensity NUMERIC NOT NULL CHECK (carbon_intensity >= 0),
    renewable_share_percent NUMERIC NOT NULL CHECK (renewable_share_percent BETWEEN 0 AND 100),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE servico (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    external_id TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    metrics_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'metrics_missing', 'unavailable')),
    status_atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    ativo BOOLEAN NOT NULL DEFAULT true,
    ultima_vez_visto_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    regiao_id BIGINT NOT NULL REFERENCES regiao(id)
);

CREATE TABLE parametro_estimativa (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cpu_max_watts NUMERIC(10,4) NOT NULL CHECK (cpu_max_watts >= 0),
    ram_watts_per_gb NUMERIC(10,4) NOT NULL CHECK (ram_watts_per_gb >= 0),
    disk_watts_per_gb NUMERIC(10,4) NOT NULL CHECK (disk_watts_per_gb >= 0),
    network_watts_per_gb NUMERIC(10,4) NOT NULL CHECK (network_watts_per_gb >= 0),
    ativo BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ux_parametro_estimativa_ativo
    ON parametro_estimativa(ativo)
    WHERE ativo = true;

CREATE TABLE configuracao_sistema (
    id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
    intervalo_coleta_segundos INTEGER NOT NULL DEFAULT 300
        CHECK (intervalo_coleta_segundos BETWEEN 10 AND 3600),
    atualizado_por BIGINT REFERENCES usuario(id),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE coleta (
    -- Perfeito: UUID configurado corretamente com o DEFAULT
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    servico_id BIGINT NOT NULL REFERENCES servico(id),
    parametro_estimativa_id BIGINT NOT NULL REFERENCES parametro_estimativa(id),
    coletado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    intervalo_metrica_segundos INTEGER NOT NULL CHECK (intervalo_metrica_segundos > 0),
    cpu_percent DOUBLE PRECISION NOT NULL CHECK (cpu_percent BETWEEN 0 AND 100),
    memory_gb DOUBLE PRECISION NOT NULL CHECK (memory_gb >= 0),
    disk_gb DOUBLE PRECISION NOT NULL CHECK (disk_gb >= 0),
    network_gb DOUBLE PRECISION NOT NULL CHECK (network_gb >= 0),
    cpu_watts NUMERIC(14,6) NOT NULL CHECK (cpu_watts >= 0),
    memory_watts NUMERIC(14,6) NOT NULL CHECK (memory_watts >= 0),
    disk_watts NUMERIC(14,6) NOT NULL CHECK (disk_watts >= 0),
    network_watts NUMERIC(14,6) NOT NULL CHECK (network_watts >= 0),
    potencia_estimada_w NUMERIC(14,6) NOT NULL CHECK (potencia_estimada_w >= 0),
    energia_estimada_kwh NUMERIC(20,10) NOT NULL CHECK (energia_estimada_kwh >= 0),
    carbon_intensity NUMERIC(12,4) NOT NULL CHECK (carbon_intensity >= 0),
    co2e_estimado_g NUMERIC(20,10) NOT NULL CHECK (co2e_estimado_g >= 0),
    
    UNIQUE (servico_id, coletado_em)
);

CREATE INDEX idx_servico_regiao ON servico(regiao_id);
CREATE INDEX idx_servico_ativo ON servico(ativo);
CREATE INDEX idx_coleta_servico_tempo ON coleta(servico_id, coletado_em DESC);
CREATE INDEX idx_coleta_tempo ON coleta(coletado_em DESC);

INSERT INTO parametro_estimativa (cpu_max_watts, ram_watts_per_gb, disk_watts_per_gb, network_watts_per_gb, ativo)
VALUES (100, 0.375, 0.01, 0.02, true);

INSERT INTO configuracao_sistema DEFAULT VALUES;

COMMIT;
