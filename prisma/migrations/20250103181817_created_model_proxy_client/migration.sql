-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "aigaea";

-- CreateTable
CREATE TABLE "aigaea"."proxy_client" (
    "id" UUID NOT NULL,
    "state" BOOLEAN NOT NULL,
    "browser_id" VARCHAR(256) NOT NULL,
    "gaea_token" VARCHAR(512) NOT NULL,
    "proxy_list" TEXT NOT NULL,
    "proxy_count" INTEGER NOT NULL,

    CONSTRAINT "proxy_client_pkey" PRIMARY KEY ("id")
);
