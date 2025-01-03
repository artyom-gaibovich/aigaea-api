class ClientProxy {
    constructor({id, gaea_token, proxies, browser_id, browserIdFilePath, proxyWorker}) {
        this.id = id;
        this.gaea_token = gaea_token;
        this.proxies = proxies;
        this.browser_id = browser_id;
        this.browserIdFilePath = browserIdFilePath;
        this.isActive = false;
        this.proxyWorker = proxyWorker;
    }

    run() {
        //proxies, id8, headers, browserIdFilePath
        this.proxyWorker.run(
            {
                proxies: this.proxies,
                id8: this.browser_id,
                browserIdFilePath: this.browserIdFilePath,
                headers: {
                    'Accept': 'application/json, text/plain, *!/!*',
                    'origin': 'chrome-extension://cpjicfogbgognnifjgmenmaldnmeeeib',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.gaea_token}`,
                    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
                },
            }
        )
    }


    getIsActive() {
        return this.isActive;
    }

    setIsActive() {
        this.isActive = true;
    }

}


module.exports = ClientProxy;