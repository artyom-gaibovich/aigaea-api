-- AlterTable
ALTER TABLE "aigaea"."proxy_client" ADD COLUMN     "created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "expires" TIMESTAMP(3),
ADD COLUMN     "is_verified" BOOLEAN,
ADD COLUMN     "is_wallet_created" BOOLEAN,
ADD COLUMN     "modified" TIMESTAMPTZ(6);
