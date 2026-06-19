ALTER TYPE "CustomerStatus" ADD VALUE IF NOT EXISTS 'blocked';

DO $$ BEGIN
  CREATE TYPE "CustomerTier" AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'vip');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ChurnRisk" AS ENUM ('low', 'medium', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "assignedCustomersPlaceholder" TEXT;
ALTER TABLE "Team" DROP COLUMN IF EXISTS "assignedCustomersPlaceholder";

ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "customerCode" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "fullName" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "displayName" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "mobile" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "nationalId" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "economicCode" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "registrationNumber" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "tierLevel" "CustomerTier";
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "assignedTeamId" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "industry" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(65,30);
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(65,30);
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "totalRevenue" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "totalDeals" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "openDealsCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "wonDealsCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "lostDealsCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "lastInteractionAt" TIMESTAMP(3);
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "nextFollowUpAt" TIMESTAMP(3);
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "churnRisk" "ChurnRisk" NOT NULL DEFAULT 'low';
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "satisfactionScore" INTEGER;

UPDATE "Customer"
SET
  "fullName" = COALESCE("fullName", "name"),
  "displayName" = COALESCE("displayName", "companyName", "name"),
  "mobile" = COALESCE("mobile", "phone"),
  "tierLevel" = COALESCE("tierLevel", CASE
    WHEN lower(COALESCE("tier", '')) IN ('طلایی', 'gold') THEN 'gold'::"CustomerTier"
    WHEN lower(COALESCE("tier", '')) IN ('نقره‌ای', 'silver') THEN 'silver'::"CustomerTier"
    WHEN lower(COALESCE("tier", '')) IN ('پلاتینیوم', 'platinum') THEN 'platinum'::"CustomerTier"
    WHEN lower(COALESCE("tier", '')) IN ('ویژه', 'vip') THEN 'vip'::"CustomerTier"
    ELSE 'bronze'::"CustomerTier"
  END);

UPDATE "Customer"
SET "customerCode" = 'CUS-' || LPAD(row_number::TEXT, 6, '0')
FROM (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS row_number
  FROM "Customer"
  WHERE "customerCode" IS NULL
) numbered
WHERE "Customer"."id" = numbered."id";

CREATE UNIQUE INDEX IF NOT EXISTS "Customer_customerCode_key" ON "Customer"("customerCode");
CREATE INDEX IF NOT EXISTS "Customer_mobile_idx" ON "Customer"("mobile");
CREATE INDEX IF NOT EXISTS "Customer_customerCode_idx" ON "Customer"("customerCode");
CREATE INDEX IF NOT EXISTS "Customer_nationalId_idx" ON "Customer"("nationalId");
CREATE INDEX IF NOT EXISTS "Customer_economicCode_idx" ON "Customer"("economicCode");
CREATE INDEX IF NOT EXISTS "Customer_assignedTeamId_idx" ON "Customer"("assignedTeamId");
CREATE INDEX IF NOT EXISTS "Customer_tierLevel_idx" ON "Customer"("tierLevel");
CREATE INDEX IF NOT EXISTS "Customer_healthScore_idx" ON "Customer"("healthScore");
CREATE INDEX IF NOT EXISTS "Customer_lastInteractionAt_idx" ON "Customer"("lastInteractionAt");
CREATE INDEX IF NOT EXISTS "Customer_nextFollowUpAt_idx" ON "Customer"("nextFollowUpAt");

DO $$ BEGIN
  ALTER TABLE "Customer" ADD CONSTRAINT "Customer_assignedTeamId_fkey" FOREIGN KEY ("assignedTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
