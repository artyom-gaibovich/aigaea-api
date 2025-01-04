-- CreateTable
CREATE TABLE "aigaea"."proxies" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMPTZ(6),

    CONSTRAINT "proxies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aigaea"."clients_to_proxies" (
    "proxy_id" TEXT NOT NULL,
    "client_id" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "proxies_id_key" ON "aigaea"."proxies"("id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_to_proxies_client_id_proxy_id_key" ON "aigaea"."clients_to_proxies"("client_id", "proxy_id");

-- AddForeignKey
ALTER TABLE "aigaea"."clients_to_proxies" ADD CONSTRAINT "clients_to_proxies_proxy_id_fkey" FOREIGN KEY ("proxy_id") REFERENCES "aigaea"."proxies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aigaea"."clients_to_proxies" ADD CONSTRAINT "clients_to_proxies_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "aigaea"."proxy_client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
