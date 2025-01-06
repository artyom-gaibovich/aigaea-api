class ProxyClientEntity {
    constructor() {
        this.id = null;
        this.gaea_token = null;
        this.browser_id = null;
        this.proxies = [];
        this.browserIdFilePath = null;
    }

    setId(id) {
        this.id = id;
    }

    setGaeaToken(gaea_token) {
        this.gaea_token = gaea_token;
    }

    setBrowserId(browser_id) {
        this.browser_id = browser_id;
    }

    setProxies(proxies) {
        this.proxies = proxies;
    }

    setBrowserIdFilePath(browserIdFilePath) {
        this.browserIdFilePath = browserIdFilePath;
    }

    toJSON() {
        return {
            id: this.id,
            gaea_token: this.gaea_token,
            browser_id: this.browser_id,
            proxies: this.proxies,
            browserIdFilePath: this.browserIdFilePath
        };
    }
}

module.exports = ProxyClientEntity;
