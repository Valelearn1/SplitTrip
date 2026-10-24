-- D-73: quando l'account ha accettato i Termini e condizioni; vuota per gli account creati prima della casella
ALTER TABLE users ADD COLUMN terms_accepted_at TIMESTAMPTZ;
