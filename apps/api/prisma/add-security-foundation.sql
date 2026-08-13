CREATE TABLE IF NOT EXISTS "admin_security_settings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "admin_id" UUID NOT NULL UNIQUE,
  "email_otp_enabled" BOOLEAN NOT NULL DEFAULT true,
  "totp_enabled" BOOLEAN NOT NULL DEFAULT false,
  "totp_secret_encrypted" TEXT,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_security_settings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_security_settings_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "media_asset" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "storage_key" TEXT NOT NULL UNIQUE,
  "mime_type" VARCHAR(80) NOT NULL,
  "byte_size" INTEGER NOT NULL,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "media_asset_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "admin_security_settings" ADD COLUMN IF NOT EXISTS "totp_pending_secret_encrypted" TEXT;
