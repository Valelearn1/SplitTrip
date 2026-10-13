CREATE TABLE users (
    id            UUID PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(40)  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL
);

CREATE TABLE trips (
    id          UUID PRIMARY KEY,
    name        VARCHAR(80)  NOT NULL,
    destination VARCHAR(120) NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    currency    VARCHAR(3) NOT NULL DEFAULT 'EUR',
    invite_code VARCHAR(9) NOT NULL UNIQUE,
    status      VARCHAR(16) NOT NULL CHECK (status IN ('PLANNING', 'ONGOING', 'CLOSED')),
    owner_id    UUID NOT NULL REFERENCES users (id),
    created_at  TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL,
    CONSTRAINT trips_dates CHECK (end_date >= start_date)
);

CREATE TABLE trip_members (
    id        UUID PRIMARY KEY,
    trip_id   UUID NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
    user_id   UUID NOT NULL REFERENCES users (id),
    role      VARCHAR(16) NOT NULL CHECK (role IN ('ORGANIZER', 'MEMBER')),
    joined_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT trip_members_unique UNIQUE (trip_id, user_id)
);

CREATE TABLE expenses (
    id          UUID PRIMARY KEY,
    trip_id     UUID NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
    payer_id    UUID NOT NULL REFERENCES users (id),
    description VARCHAR(120) NOT NULL,
    amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    date        DATE NOT NULL,
    category    VARCHAR(16) NOT NULL CHECK (category IN ('FOOD', 'TRANSPORT', 'LODGING', 'ACTIVITY', 'OTHER')),
    split_type  VARCHAR(16) NOT NULL CHECK (split_type IN ('EQUAL', 'CUSTOM')),
    created_by  UUID NOT NULL REFERENCES users (id),
    created_at  TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL,
    deleted_at  TIMESTAMPTZ
);
CREATE INDEX idx_expenses_trip ON expenses (trip_id);

CREATE TABLE expense_shares (
    id         UUID PRIMARY KEY,
    expense_id UUID NOT NULL REFERENCES expenses (id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users (id),
    amount     NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    CONSTRAINT expense_shares_unique UNIQUE (expense_id, user_id)
);

CREATE TABLE settlements (
    id           UUID PRIMARY KEY,
    trip_id      UUID NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES users (id),
    to_user_id   UUID NOT NULL REFERENCES users (id),
    amount       NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    date         DATE NOT NULL,
    note         VARCHAR(200),
    created_by   UUID NOT NULL REFERENCES users (id),
    created_at   TIMESTAMPTZ NOT NULL,
    deleted_at   TIMESTAMPTZ,
    CONSTRAINT settlements_distinct_users CHECK (from_user_id <> to_user_id)
);
CREATE INDEX idx_settlements_trip ON settlements (trip_id);
