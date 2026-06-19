ALTER TYPE "ActivityEntityType" ADD VALUE IF NOT EXISTS 'task';
ALTER TYPE "ActivityEntityType" ADD VALUE IF NOT EXISTS 'contract';
ALTER TYPE "ActivityEntityType" ADD VALUE IF NOT EXISTS 'shipment';
ALTER TYPE "ActivityEntityType" ADD VALUE IF NOT EXISTS 'general';

ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'whatsapp';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'visit';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'contract_review';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'support_followup';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'finance_followup';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'other';

DO $$ BEGIN
  CREATE TYPE "ActivityStatus" AS ENUM ('open', 'completed', 'cancelled', 'needs_followup', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ActivityPriority" AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ActivityResult" AS ENUM ('successful', 'no_answer', 'busy', 'not_interested', 'interested', 'needs_followup', 'scheduled_meeting', 'sent_proposal', 'resolved', 'unresolved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ActivityChannel" AS ENUM ('phone', 'in_person', 'email', 'sms', 'whatsapp', 'system', 'internal', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "status" "ActivityStatus" NOT NULL DEFAULT 'open';
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "priority" "ActivityPriority" NOT NULL DEFAULT 'medium';
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "result" "ActivityResult";
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "channel" "ActivityChannel";
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "relatedName" TEXT;
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "assignedToId" TEXT;
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "activityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "nextFollowUpAt" TIMESTAMP(3);
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

UPDATE "Activity" SET "activityAt" = "occurredAt" WHERE "activityAt" IS NULL;
UPDATE "Activity" SET "status" = 'completed' WHERE "outcome" IS NOT NULL AND "status" = 'open';

CREATE INDEX IF NOT EXISTS "Activity_assignedToId_idx" ON "Activity"("assignedToId");
CREATE INDEX IF NOT EXISTS "Activity_activityAt_idx" ON "Activity"("activityAt");
CREATE INDEX IF NOT EXISTS "Activity_nextFollowUpAt_idx" ON "Activity"("nextFollowUpAt");
CREATE INDEX IF NOT EXISTS "Activity_status_idx" ON "Activity"("status");
CREATE INDEX IF NOT EXISTS "Activity_activityType_idx" ON "Activity"("activityType");
CREATE INDEX IF NOT EXISTS "Activity_deletedAt_idx" ON "Activity"("deletedAt");