-- D-71: la copertina del viaggio è una foto scelta da chi è nel viaggio; se la foto viene eliminata, sparisce anche la scelta
ALTER TABLE trips ADD COLUMN cover_photo_id UUID REFERENCES photos (id) ON DELETE SET NULL;
