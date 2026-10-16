-- v3.2 «Giochi, riepilogo e tema» (spec 2026-10-16): ipotesi di «Indovina il totale», tema sull'account

CREATE TABLE wrapped_guesses (
    trip_id        UUID NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
    -- DEFERRABLE come le altre FK verso participants (V3)
    participant_id UUID NOT NULL REFERENCES participants (id) DEFERRABLE INITIALLY DEFERRED,
    amount         NUMERIC(12, 2) NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (trip_id, participant_id),
    CONSTRAINT wrapped_guesses_amount CHECK (amount >= 0)
);

ALTER TABLE users ADD COLUMN theme VARCHAR(8) NOT NULL DEFAULT 'SYSTEM';
ALTER TABLE users ADD CONSTRAINT users_theme CHECK (theme IN ('SYSTEM', 'LIGHT', 'DARK'));
