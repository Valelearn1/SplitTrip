-- D-69: anche un rimborso può essere in un'altra valuta; quelli esistenti restano nella valuta del viaggio con cambio 1
ALTER TABLE settlements
    ADD COLUMN currency    VARCHAR(3),
    ADD COLUMN fx_rate     NUMERIC(18, 8) NOT NULL DEFAULT 1,
    ADD COLUMN amount_base NUMERIC(12, 2);
UPDATE settlements s SET currency = t.currency, amount_base = s.amount FROM trips t WHERE t.id = s.trip_id;
ALTER TABLE settlements ALTER COLUMN currency SET NOT NULL, ALTER COLUMN amount_base SET NOT NULL;
