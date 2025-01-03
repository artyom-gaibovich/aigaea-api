class BrowserIdsManager {
    constructor(browserIdsFileManager) {
        this.browserIdsFileManager = browserIdsFileManager;
    }

    async getByProxy(id8, proxy, browserIdFilePath) {
        const browserIds = await this.browserIdsFileManager.read(browserIdFilePath);
        if (browserIds[proxy]) {
            console.log(`Using existing browser_id for proxy ${proxy}`);
            return browserIds[proxy];
        } else {
            const newBrowserId = `${id8}${crypto.randomUUID().slice(8)}`;
            browserIds[proxy] = newBrowserId;
            await this.browserIdsFileManager.save(browserIdFilePath, browserIds);
            console.log(`Generated new browser_id for proxy ${proxy}: ${newBrowserId}`);
            return newBrowserId;
        }
    }
}


module.exports = BrowserIdsManager;