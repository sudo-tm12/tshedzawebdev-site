-- TshedzaWebDev API database (Cloudflare D1, SQLite). Same tables as the old PHP API.
-- Leads are kept 24 months (Privacy Policy); unpublished wall notes 30 days.

CREATE TABLE IF NOT EXISTS leads (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  ref               TEXT    NOT NULL UNIQUE,
  kind              TEXT    NOT NULL CHECK (kind IN ('estimate', 'contact')),
  created_at        TEXT    NOT NULL,
  name              TEXT    NOT NULL,
  email             TEXT    NOT NULL,
  phone             TEXT,
  business          TEXT,
  message           TEXT,
  service_id        TEXT,
  selection_json    TEXT,
  one_off           INTEGER,
  monthly           INTEGER,
  low               INTEGER,
  high              INTEGER,
  deposit           INTEGER,
  weeks             INTEGER,
  pricebook_version TEXT,
  consent_at        TEXT    NOT NULL,
  consent_version   TEXT    NOT NULL,
  ip_hash           TEXT    NOT NULL,
  email_client_sent INTEGER NOT NULL DEFAULT 0,
  email_owner_sent  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS leads_created ON leads (created_at);

CREATE TABLE IF NOT EXISTS rate_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  action     TEXT NOT NULL,
  ip_hash    TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_lookup ON rate_events (action, ip_hash, created_at);

CREATE TABLE IF NOT EXISTS wall_notes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT    NOT NULL,
  approved_at TEXT,
  name        TEXT,
  place       TEXT,
  message     TEXT    NOT NULL,
  kind        TEXT    NOT NULL,
  colour      TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  hearts      INTEGER NOT NULL DEFAULT 0,
  ip_hash     TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS wall_public ON wall_notes (status, id);

CREATE TABLE IF NOT EXISTS wall_hearts (
  note_id    INTEGER NOT NULL,
  ip_hash    TEXT    NOT NULL,
  created_at TEXT    NOT NULL,
  PRIMARY KEY (note_id, ip_hash)
);

-- Only used when MAIL_TRANSPORT = "outbox" (local testing): emails are stored, not sent.
CREATE TABLE IF NOT EXISTS outbox (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at      TEXT NOT NULL,
  to_addr         TEXT NOT NULL,
  reply_to        TEXT,
  subject         TEXT NOT NULL,
  html            TEXT NOT NULL,
  text            TEXT NOT NULL,
  attachment_name TEXT,
  attachment_b64  TEXT
);
