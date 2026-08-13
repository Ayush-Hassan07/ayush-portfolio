CREATE TABLE IF NOT EXISTS "admin_otp_challenge" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "admin_id" UUID NOT NULL,
  "code_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(6) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "consumed" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_otp_challenge_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_otp_challenge_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "admin_otp_challenge_admin_id_created_at_idx" ON "admin_otp_challenge" ("admin_id", "created_at");
