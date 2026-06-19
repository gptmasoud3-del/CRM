ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'in_review';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'proposal_sent';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'negotiation';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'disqualified';

ALTER TABLE "Lead"
  ADD COLUMN IF NOT EXISTS "firstName" TEXT,
  ADD COLUMN IF NOT EXISTS "lastName" TEXT,
  ADD COLUMN IF NOT EXISTS "fullName" TEXT,
  ADD COLUMN IF NOT EXISTS "businessName" TEXT,
  ADD COLUMN IF NOT EXISTS "mobile" TEXT,
  ADD COLUMN IF NOT EXISTS "website" TEXT,
  ADD COLUMN IF NOT EXISTS "nationalId" TEXT,
  ADD COLUMN IF NOT EXISTS "economicCode" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "businessType" TEXT,
  ADD COLUMN IF NOT EXISTS "industry" TEXT,
  ADD COLUMN IF NOT EXISTS "monthlyShipmentVolume" INTEGER,
  ADD COLUMN IF NOT EXISTS "averageDailyOrders" INTEGER,
  ADD COLUMN IF NOT EXISTS "originCities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "destinationCities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "mainServiceNeed" TEXT,
  ADD COLUMN IF NOT EXISTS "currentCourierProvider" TEXT,
  ADD COLUMN IF NOT EXISTS "painPoints" TEXT,
  ADD COLUMN IF NOT EXISTS "expectedStartDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "hasApiNeed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "hasCodPaymentNeed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "hasWarehousingNeed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "hasReverseLogisticsNeed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "probability" INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS "stage" TEXT,
  ADD COLUMN IF NOT EXISTS "assignedToId" TEXT,
  ADD COLUMN IF NOT EXISTS "lastContactAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "nextFollowUpAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "convertedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lostReason" TEXT,
  ADD COLUMN IF NOT EXISTS "disqualificationReason" TEXT,
  ADD COLUMN IF NOT EXISTS "createdById" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedById" TEXT,
  ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Lead"
SET
  "fullName" = COALESCE("fullName", "name"),
  "probability" = CASE "status"
    WHEN 'new' THEN 5
    WHEN 'assigned' THEN 10
    WHEN 'contacted' THEN 15
    WHEN 'qualified' THEN 40
    WHEN 'converted' THEN 100
    WHEN 'lost' THEN 0
    WHEN 'unqualified' THEN 0
    WHEN 'duplicate' THEN 0
    ELSE "probability"
  END,
  "isDeleted" = CASE WHEN "deletedAt" IS NULL THEN false ELSE true END
WHERE "fullName" IS NULL OR "probability" IS NULL OR "isDeleted" = false;

CREATE INDEX IF NOT EXISTS "Lead_source_idx" ON "Lead"("source");
CREATE INDEX IF NOT EXISTS "Lead_priority_idx" ON "Lead"("priority");
CREATE INDEX IF NOT EXISTS "Lead_assignedToId_idx" ON "Lead"("assignedToId");
CREATE INDEX IF NOT EXISTS "Lead_nextFollowUpAt_idx" ON "Lead"("nextFollowUpAt");
CREATE INDEX IF NOT EXISTS "Lead_isDeleted_idx" ON "Lead"("isDeleted");