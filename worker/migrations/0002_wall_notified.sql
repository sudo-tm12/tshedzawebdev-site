-- Whether the owner's approval email for a wall note went out. The cron retries notes where it
-- didn't (src/retry.ts), like it does for leads with email_client_sent / email_owner_sent = 0.
ALTER TABLE wall_notes ADD COLUMN owner_notified INTEGER NOT NULL DEFAULT 0;
