-- v1.5 «Divisioni smart» (D-30, D-31, D-33; spec 2026-10-14 §3)
-- 1. trip_members → participants: identità economica, anche senza account
ALTER TABLE trip_members RENAME TO participants;
ALTER TABLE participants RENAME CONSTRAINT trip_members_unique TO participants_user_unique;
ALTER TABLE participants
    ADD COLUMN display_name   VARCHAR(40),
    ADD COLUMN default_weight NUMERIC(6, 2) NOT NULL DEFAULT 1,
    ADD COLUMN arrival_date   DATE,
    ADD COLUMN departure_date DATE,
    ADD COLUMN left_at        TIMESTAMPTZ;
UPDATE participants p SET display_name = u.display_name FROM users u WHERE u.id = p.user_id;
ALTER TABLE participants ALTER COLUMN display_name SET NOT NULL;
ALTER TABLE participants ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE participants
    ADD CONSTRAINT participants_weight_positive CHECK (default_weight > 0),
    ADD CONSTRAINT participants_dates CHECK (arrival_date IS NULL OR departure_date IS NULL OR departure_date >= arrival_date);
CREATE INDEX idx_participants_trip ON participants (trip_id);

-- 2. Orfani: utenti usciti dal viaggio in v1 ma ancora citati nei soldi (anche nel cestino) → riga con left_at
INSERT INTO participants (id, trip_id, user_id, display_name, role, joined_at, left_at)
SELECT gen_random_uuid(), x.trip_id, x.user_id, u.display_name, 'MEMBER', now(), now()
FROM (
    SELECT trip_id, payer_id AS user_id FROM expenses
    UNION SELECT e.trip_id, s.user_id FROM expense_shares s JOIN expenses e ON e.id = s.expense_id
    UNION SELECT trip_id, from_user_id FROM settlements
    UNION SELECT trip_id, to_user_id FROM settlements
) x
JOIN users u ON u.id = x.user_id
WHERE NOT EXISTS (SELECT 1 FROM participants p WHERE p.trip_id = x.trip_id AND p.user_id = x.user_id);

-- 3. expenses: pagante → partecipante; S2 valuta/tasso/importo base; S4 tipi di divisione
ALTER TABLE expenses ADD COLUMN payer_participant_id UUID REFERENCES participants (id);
UPDATE expenses e SET payer_participant_id = p.id FROM participants p WHERE p.trip_id = e.trip_id AND p.user_id = e.payer_id;
ALTER TABLE expenses ALTER COLUMN payer_participant_id SET NOT NULL;
ALTER TABLE expenses DROP COLUMN payer_id;
ALTER TABLE expenses
    ADD COLUMN currency    VARCHAR(3),
    ADD COLUMN fx_rate     NUMERIC(18, 8) NOT NULL DEFAULT 1,
    ADD COLUMN amount_base NUMERIC(12, 2),
    ADD COLUMN day_basis   VARCHAR(8);
UPDATE expenses e SET currency = t.currency, amount_base = e.amount FROM trips t WHERE t.id = e.trip_id;
ALTER TABLE expenses ALTER COLUMN currency SET NOT NULL, ALTER COLUMN amount_base SET NOT NULL;
ALTER TABLE expenses DROP CONSTRAINT expenses_split_type_check;
ALTER TABLE expenses
    ADD CONSTRAINT expenses_split_type_check CHECK (split_type IN ('EQUAL', 'CUSTOM', 'WEIGHT', 'DAYS')),
    ADD CONSTRAINT expenses_day_basis_check CHECK (day_basis IN ('DAYS', 'NIGHTS')),
    ADD CONSTRAINT expenses_day_basis_only_for_days CHECK ((split_type = 'DAYS') = (day_basis IS NOT NULL));

-- 4. expense_shares: quota → partecipante; weight = input usato (peso o notti/giorni)
ALTER TABLE expense_shares ADD COLUMN participant_id UUID REFERENCES participants (id);
UPDATE expense_shares s SET participant_id = p.id
FROM expenses e, participants p
WHERE e.id = s.expense_id AND p.trip_id = e.trip_id AND p.user_id = s.user_id;
ALTER TABLE expense_shares ALTER COLUMN participant_id SET NOT NULL;
ALTER TABLE expense_shares DROP CONSTRAINT expense_shares_unique;
ALTER TABLE expense_shares DROP COLUMN user_id;
ALTER TABLE expense_shares
    ADD CONSTRAINT expense_shares_unique UNIQUE (expense_id, participant_id),
    ADD COLUMN weight NUMERIC(8, 2) CHECK (weight >= 0);

-- 5. settlements: da/a → partecipanti
ALTER TABLE settlements
    ADD COLUMN from_participant_id UUID REFERENCES participants (id),
    ADD COLUMN to_participant_id   UUID REFERENCES participants (id);
UPDATE settlements s SET from_participant_id = pf.id, to_participant_id = pt.id
FROM participants pf, participants pt
WHERE pf.trip_id = s.trip_id AND pf.user_id = s.from_user_id
  AND pt.trip_id = s.trip_id AND pt.user_id = s.to_user_id;
ALTER TABLE settlements ALTER COLUMN from_participant_id SET NOT NULL, ALTER COLUMN to_participant_id SET NOT NULL;
ALTER TABLE settlements DROP CONSTRAINT settlements_distinct_users;
ALTER TABLE settlements DROP COLUMN from_user_id, DROP COLUMN to_user_id;
ALTER TABLE settlements ADD CONSTRAINT settlements_distinct_participants CHECK (from_participant_id <> to_participant_id);
