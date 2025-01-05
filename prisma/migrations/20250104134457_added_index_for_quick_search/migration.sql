-- CreateIndex
CREATE INDEX "clients_to_proxies_proxy_id_idx" ON "aigaea"."clients_to_proxies"("proxy_id");

-- CreateIndex
CREATE INDEX "clients_to_proxies_client_id_idx" ON "aigaea"."clients_to_proxies"("client_id");

-- CreateIndex
CREATE INDEX "proxies_id_idx" ON "aigaea"."proxies"("id");

-- CreateIndex
CREATE INDEX "proxy_client_state_idx" ON "aigaea"."proxy_client"("state");

-- CreateIndex
CREATE INDEX "proxy_client_email_idx" ON "aigaea"."proxy_client"("email");

-- CreateIndex
CREATE INDEX "proxy_client_browser_id_idx" ON "aigaea"."proxy_client"("browser_id");

-- CreateIndex
CREATE INDEX "proxy_client_gaea_token_idx" ON "aigaea"."proxy_client"("gaea_token");

-- CreateIndex
CREATE INDEX "proxy_client_expires_idx" ON "aigaea"."proxy_client"("expires");

-- CreateIndex
CREATE INDEX "proxy_client_proxy_count_idx" ON "aigaea"."proxy_client"("proxy_count");
