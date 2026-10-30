-- MySQL schema for the TshedzaWebDev API (run once in cPanel → phpMyAdmin, in a NEW database).
-- Leads are kept 24 months (see purge in index.php / Privacy Policy).
CREATE TABLE IF NOT EXISTS leads (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ref                  VARCHAR(20)  NOT NULL UNIQUE,
  kind                 ENUM('estimate','contact') NOT NULL,
  created_at           DATETIME     NOT NULL,
  name                 VARCHAR(120) NOT NULL,
  email                VARCHAR(190) NOT NULL,
  phone                VARCHAR(40)  NULL,
  business             VARCHAR(160) NULL,
  message              TEXT         NULL,
  service_id           VARCHAR(40)  NULL,
  selection_json       JSON         NULL,
  one_off              INT          NULL,
  monthly              INT          NULL,
  low                  INT          NULL,
  high                 INT          NULL,
  deposit              INT          NULL,
  weeks                INT          NULL,
  pricebook_version    VARCHAR(40)  NULL,
  consent_at           DATETIME     NOT NULL,
  consent_version      VARCHAR(20)  NOT NULL,
  ip_hash              CHAR(64)     NOT NULL,
  email_client_sent    TINYINT(1)   NOT NULL DEFAULT 0,
  email_owner_sent     TINYINT(1)   NOT NULL DEFAULT 0,
  INDEX (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rate_events (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  action     VARCHAR(20) NOT NULL,
  ip_hash    CHAR(64)    NOT NULL,
  created_at DATETIME    NOT NULL,
  INDEX (action, ip_hash, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Community wall (/wall/). Notes are 'pending' until the owner approves them by email link.
CREATE TABLE IF NOT EXISTS wall_notes (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  created_at  DATETIME     NOT NULL,
  approved_at DATETIME     NULL,
  name        VARCHAR(40)  NULL,
  place       VARCHAR(40)  NULL,
  message     VARCHAR(400) NOT NULL,
  kind        VARCHAR(12)  NOT NULL,
  colour      VARCHAR(8)   NOT NULL,
  status      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  hearts      INT UNSIGNED NOT NULL DEFAULT 0,
  ip_hash     CHAR(64)     NOT NULL,
  INDEX (status, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wall_hearts (
  note_id    INT UNSIGNED NOT NULL,
  ip_hash    CHAR(64)     NOT NULL,
  created_at DATETIME     NOT NULL,
  PRIMARY KEY (note_id, ip_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
