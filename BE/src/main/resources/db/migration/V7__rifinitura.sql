-- v3.1 «Rifinitura» (spec 2026-10-15): reazioni in chat, luogo a mano delle foto, preferenze sull'account

CREATE TABLE message_reactions (
    message_id     UUID NOT NULL REFERENCES chat_messages (id) ON DELETE CASCADE,
    -- DEFERRABLE come le altre FK verso participants (V3): il cascade del viaggio arriva prima su participants
    participant_id UUID NOT NULL REFERENCES participants (id) DEFERRABLE INITIALLY DEFERRED,
    emoji          VARCHAR(8) NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (message_id, participant_id, emoji),
    CONSTRAINT message_reactions_emoji CHECK (emoji IN ('👍', '❤️', '😂', '😮', '😢', '🎉'))
);

ALTER TABLE photos ADD COLUMN place_name VARCHAR(120);
ALTER TABLE photos ADD CONSTRAINT photos_place CHECK (place_name IS NULL OR (latitude IS NOT NULL AND longitude IS NOT NULL));

ALTER TABLE users ADD COLUMN preferred_currency VARCHAR(3) NOT NULL DEFAULT 'EUR';
ALTER TABLE users ADD COLUMN chat_sound BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN reduce_motion BOOLEAN NOT NULL DEFAULT FALSE;
