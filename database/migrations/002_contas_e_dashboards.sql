BEGIN;

ALTER TABLE usuario
    ALTER COLUMN papel SET DEFAULT 'visualizador',
    ADD COLUMN IF NOT EXISTS nome TEXT,
    ADD COLUMN IF NOT EXISTS acesso_ativo BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS versao_sessao INTEGER NOT NULL DEFAULT 0;

UPDATE usuario SET nome = LEFT(split_part(email, '@', 1), 100) WHERE nome IS NULL;
ALTER TABLE usuario ALTER COLUMN nome SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_usuario_email_lower ON usuario(lower(email));

CREATE TABLE IF NOT EXISTS redefinicao_senha (
    token_hash TEXT PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    expira_em TIMESTAMPTZ NOT NULL,
    usado_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_redefinicao_usuario ON redefinicao_senha(usuario_id);

CREATE TABLE IF NOT EXISTS dashboard (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    nome TEXT NOT NULL CHECK (char_length(btrim(nome)) BETWEEN 1 AND 48),
    periodo TEXT NOT NULL CHECK (periodo IN ('1h', '6h', '24h', '7d', '30d')),
    widgets JSONB NOT NULL CHECK (jsonb_typeof(widgets) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_dashboard_usuario ON dashboard(usuario_id, id);

COMMIT;
