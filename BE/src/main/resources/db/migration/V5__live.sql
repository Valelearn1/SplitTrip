-- v3 «Live» (spec 2026-10-15 §3): chat del viaggio, «letto fino a», consigli AI

CREATE TABLE chat_messages (
    id                    UUID PRIMARY KEY,
    trip_id               UUID NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
    -- DEFERRABLE come le altre FK verso participants (V3): il cascade del viaggio arriva prima su participants
    author_participant_id UUID REFERENCES participants (id) DEFERRABLE INITIALLY DEFERRED,
    kind                  VARCHAR(10) NOT NULL CHECK (kind IN ('TEXT', 'EVENT')),
    content               VARCHAR(1000),
    event_type            VARCHAR(30) CHECK (event_type IN ('EXPENSE_CREATED', 'SETTLEMENT_CREATED', 'PARTICIPANT_JOINED')),
    ref_id                UUID,
    created_at            TIMESTAMPTZ NOT NULL,
    deleted_at            TIMESTAMPTZ,
    CONSTRAINT chat_kind CHECK (
        (kind = 'TEXT' AND author_participant_id IS NOT NULL AND event_type IS NULL)
        OR (kind = 'EVENT' AND author_participant_id IS NULL AND event_type IS NOT NULL AND content IS NOT NULL AND deleted_at IS NULL)),
    CONSTRAINT chat_content CHECK (
        (deleted_at IS NULL AND char_length(content) BETWEEN 1 AND 1000)
        OR (deleted_at IS NOT NULL AND content IS NULL))
);
CREATE INDEX idx_chat_trip_created ON chat_messages (trip_id, created_at DESC, id DESC);

ALTER TABLE participants ADD COLUMN chat_read_at TIMESTAMPTZ;

CREATE TABLE ai_suggestions (
    id         UUID PRIMARY KEY,
    trip_id    UUID NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
    kind       VARCHAR(10) NOT NULL CHECK (kind IN ('TIPS', 'PACKING')),
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_ai_trip_created ON ai_suggestions (trip_id, created_at DESC);
