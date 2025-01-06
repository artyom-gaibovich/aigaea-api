class ProxyEntity {
    constructor(clientProxies) {
        this.proxies = clientProxies.map((ctp) => `http://${ctp.proxy.id}`);
    }

    toJSON() {
        return {
            proxies: this.proxies,
        };
    }
}

module.exports = ProxyEntity;