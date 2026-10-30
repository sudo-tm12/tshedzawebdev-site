-- SQLite equivalent of schema.sql, used only for local tests.
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT, ref TEXT NOT NULL UNIQUE, kind TEXT NOT NULL, created_at TEXT NOT NULL,
  name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, business TEXT, message TEXT, service_id TEXT, selection_json TEXT,
  one_off INTEGER, monthly INTEGER, low INTEGER, high INTEGER, deposit INTEGER, weeks INTEGER, pricebook_version TEXT,
  consent_at TEXT NOT NULL, consent_version TEXT NOT NULL, ip_hash TEXT NOT NULL,
  email_client_sent INTEGER NOT NULL DEFAULT 0, email_owner_sent INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS rate_events (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL, ip_hash TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS wall_notes (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, approved_at TEXT, name TEXT, place TEXT, message TEXT NOT NULL,
  kind TEXT NOT NULL, colour TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', hearts INTEGER NOT NULL DEFAULT 0, ip_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS wall_hearts (note_id INTEGER NOT NULL, ip_hash TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (note_id, ip_hash));
