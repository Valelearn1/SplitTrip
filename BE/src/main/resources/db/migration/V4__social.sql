-- v2 «Social» (D-34..D-37; spec 2026-10-14-v2-social-design.md §3)
CREATE TABLE todo_lists (
    id         UUID PRIMARY KEY,
    trip_id    UUID NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
    title      VARCHAR(60) NOT NULL,
    type       VARCHAR(16) NOT NULL CHECK (type IN ('PACKING', 'GENERAL')),
    created_by UUID NOT NULL REFERENCES users (id),
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_todo_lists_trip ON todo_lists (trip_id);

CREATE TABLE todo_items (
    id                      UUID PRIMARY KEY,
    list_id                 UUID NOT NULL REFERENCES todo_lists (id) ON DELETE CASCADE,
    text                    VARCHAR(120) NOT NULL,
    done                    BOOLEAN NOT NULL DEFAULT FALSE,
    -- DEFERRABLE come le altre FK verso participants (V3): il cascade del viaggio arriva prima su participants
    assignee_participant_id UUID REFERENCES participants (id) DEFERRABLE INITIALLY DEFERRED,
    created_by              UUID NOT NULL REFERENCES users (id),
    created_at              TIMESTAMPTZ NOT NULL,
    updated_at              TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_todo_items_list ON todo_items (list_id);

CREATE TABLE photos (
    id          UUID PRIMARY KEY,
    trip_id     UUID NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES users (id),
    kind        VARCHAR(8) NOT NULL CHECK (kind IN ('PHOTO', 'RECEIPT')),
    expense_id  UUID REFERENCES expenses (id) ON DELETE CASCADE,
    image       BYTEA NOT NULL,
    thumbnail   BYTEA NOT NULL,
    width       INTEGER NOT NULL,
    height      INTEGER NOT NULL,
    caption     VARCHAR(200),
    taken_at    TIMESTAMPTZ,
    latitude    NUMERIC(9, 6),
    longitude   NUMERIC(9, 6),
    created_at  TIMESTAMPTZ NOT NULL,
    CONSTRAINT photos_kind_expense CHECK ((kind = 'RECEIPT') = (expense_id IS NOT NULL)),
    CONSTRAINT photos_location CHECK ((latitude IS NULL) = (longitude IS NULL)
        AND (latitude IS NULL OR (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)))
);
CREATE INDEX idx_photos_trip_created ON photos (trip_id, created_at DESC);
CREATE UNIQUE INDEX photos_receipt_unique ON photos (expense_id) WHERE kind = 'RECEIPT';

CREATE TABLE user_avatars (
    user_id    UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    image      BYTEA NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE notifications (
    id         UUID PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    trip_id    UUID NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
    type       VARCHAR(24) NOT NULL CHECK (type IN ('EXPENSE_ADDED', 'SETTLEMENT_ADDED', 'PARTICIPANT_JOINED', 'TODO_ASSIGNED')),
    message    VARCHAR(200) NOT NULL,
    link       VARCHAR(200) NOT NULL,
    read_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_notifications_user ON notifications (user_id, read_at, created_at DESC);

-- Coordinate della destinazione per il meteo, calcolate al primo uso (spec v2 §4)
ALTER TABLE trips ADD COLUMN latitude NUMERIC(9, 6), ADD COLUMN longitude NUMERIC(9, 6);
