-- Password dimenticata (D-61): token monouso salvati solo come hash SHA-256, via con l'utente
CREATE TABLE password_reset_tokens (
    id          UUID PRIMARY KEY,
    user_id     UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash  VARCHAR(64) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL,
    CONSTRAINT password_reset_tokens_token_hash UNIQUE (token_hash)
);
CREATE INDEX password_reset_tokens_user ON password_reset_tokens (user_id);
