-- Revisione finale v1.5: cancellando un viaggio in pianificazione con spese nel cestino, il cascade
-- trips → participants arrivava prima di trips → expenses → expense_shares e la FK verso participants
-- falliva (500). Con le FK verso participants controllate a fine transazione, i cascade si completano prima.
ALTER TABLE expenses       ALTER CONSTRAINT expenses_payer_participant_id_fkey    DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE expense_shares ALTER CONSTRAINT expense_shares_participant_id_fkey    DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE settlements    ALTER CONSTRAINT settlements_from_participant_id_fkey  DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE settlements    ALTER CONSTRAINT settlements_to_participant_id_fkey    DEFERRABLE INITIALLY DEFERRED;
