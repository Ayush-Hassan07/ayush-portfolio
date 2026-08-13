ALTER TABLE "admin_security_settings" ADD COLUMN IF NOT EXISTS "totp_pending_secret_encrypted" TEXT;
