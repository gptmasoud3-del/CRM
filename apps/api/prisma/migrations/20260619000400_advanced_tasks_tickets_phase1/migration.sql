ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'escalated';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'canceled';

ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'general';
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "priorityScore" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "resultNote" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "reminderAt" TIMESTAMP(3);
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "Ticket" ALTER COLUMN "customerId" DROP NOT NULL;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "leadId" TEXT;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "opportunityId" TEXT;
ALTER TABLE "Ticket" ALTER COLUMN "description" SET DEFAULT '';
UPDATE "Ticket" SET "description" = '' WHERE "description" IS NULL;
ALTER TABLE "Ticket" ALTER COLUMN "description" SET NOT NULL;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'general_request';
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "typeScore" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "channel" TEXT NOT NULL DEFAULT 'phone';
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "channelScore" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "statusScore" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "priorityScore" INTEGER NOT NULL DEFAULT 2;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "team" TEXT NOT NULL DEFAULT 'support';
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "firstResponseAt" TIMESTAMP(3);
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP(3);
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "resolution" TEXT;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "cancelReason" TEXT;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "internalNote" TEXT;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

UPDATE "Ticket"
SET "code" = 'TCK-1405-' || LPAD(row_number::TEXT, 4, '0')
FROM (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS row_number
  FROM "Ticket"
  WHERE "code" IS NULL
) numbered
WHERE "Ticket"."id" = numbered."id";

CREATE UNIQUE INDEX IF NOT EXISTS "Ticket_code_key" ON "Ticket"("code");
CREATE INDEX IF NOT EXISTS "Task_type_idx" ON "Task"("type");
CREATE INDEX IF NOT EXISTS "Task_entityType_entityId_idx" ON "Task"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "Ticket_leadId_idx" ON "Ticket"("leadId");
CREATE INDEX IF NOT EXISTS "Ticket_opportunityId_idx" ON "Ticket"("opportunityId");
CREATE INDEX IF NOT EXISTS "Ticket_team_idx" ON "Ticket"("team");
CREATE INDEX IF NOT EXISTS "Ticket_slaDueAt_idx" ON "Ticket"("slaDueAt");
CREATE INDEX IF NOT EXISTS "Ticket_deletedAt_idx" ON "Ticket"("deletedAt");

DO $$ BEGIN
  ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "TicketHistory" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "ticketId" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT NOT NULL,
  "changedById" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TicketHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TicketAttachment" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "ticketId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "mimeType" TEXT,
  "size" INTEGER,
  "uploadedById" TEXT,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TicketAttachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TicketHistory_ticketId_idx" ON "TicketHistory"("ticketId");
CREATE INDEX IF NOT EXISTS "TicketHistory_changedById_idx" ON "TicketHistory"("changedById");
CREATE INDEX IF NOT EXISTS "TicketAttachment_ticketId_idx" ON "TicketAttachment"("ticketId");