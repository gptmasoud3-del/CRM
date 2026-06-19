ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "leadId" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "contactPerson" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "expectedMonthlyRevenue" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "expectedShipmentCount" INTEGER;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "weightedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "serviceType" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "priority" "Priority" NOT NULL DEFAULT 'medium';
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "competitor" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP(3);
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "nextAction" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "nextFollowUpAt" TIMESTAMP(3);
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "lastActivityAt" TIMESTAMP(3);
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "originCities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "destinationCities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "shipmentType" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "deliverySLA" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "codRequired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "apiIntegrationRequired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "warehousingRequired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "fulfillmentRequired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "insuranceRequired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "specialHandling" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "createdById" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "updatedById" TEXT;

UPDATE "Opportunity" SET "weightedAmount" = COALESCE("amount", 0) * COALESCE("probability", 0) / 100;

CREATE INDEX IF NOT EXISTS "Opportunity_leadId_idx" ON "Opportunity"("leadId");
CREATE INDEX IF NOT EXISTS "Opportunity_priority_idx" ON "Opportunity"("priority");
CREATE INDEX IF NOT EXISTS "Opportunity_expectedCloseDate_idx" ON "Opportunity"("expectedCloseDate");

DO $$ BEGIN
  ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");
CREATE INDEX IF NOT EXISTS "Notification_entityType_entityId_idx" ON "Notification"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");

DO $$ BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;