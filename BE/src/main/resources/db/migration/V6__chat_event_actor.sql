-- v3 (revisione finale): chi ha causato una riga evento, per non contargliela come «non letta»
-- DEFERRABLE come le altre FK verso participants (V3): il cascade del viaggio arriva prima su participants
ALTER TABLE chat_messages ADD COLUMN actor_participant_id UUID REFERENCES participants (id) DEFERRABLE INITIALLY DEFERRED;
