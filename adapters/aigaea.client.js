class AIGAEAClient {
    constructor(httpSender, browserIdsManager) {
        this.httpSender = httpSender;
        this.browserIdsManager = browserIdsManager;
    }

    async send(requestConfig) {
        const {payload, proxy, id8, browserIdFilePath, headers} = requestConfig;
        const response = await this.httpSender.send('https://api.aigaea.net/api/auth/session', 'POST', payload, proxy, headers);
        if (response && response.data) {
            const uid = response.data.uid;
            const browser_id = await this.browserIdsManager.getByProxy(id8, proxy, browserIdFilePath);  // Get or generate a unique browser_id for this proxy
            console.log(`Authenticated for proxy ${proxy} with uid ${uid} and browser_id ${browser_id}`);

            this.ping({proxy, browser_id, uid, headers});
        } else {
            console.error(`Authentication failed for proxy ${proxy}`);
        }
    }

    async ping(requestConfig) {
        const {proxy, browser_id, uid, headers} = requestConfig;
        const timestamp = Math.floor(Date.now() / 1000);
        const pingPayload = {"uid": uid, "browser_id": browser_id, "timestamp": timestamp, "version": "1.0.1"};

        while (true) {
            try {
                const pingResponse = await this.httpSender.send('https://api.aigaea.net/api/network/ping', 'POST', pingPayload, proxy, headers);
                this.httpSender.send('https://api.aigaea.net/api/network/ip', 'GET', {}, proxy, headers)
                console.log(`Ping successful for proxy ${proxy}:`, pingResponse);
                if (pingResponse.data && pingResponse.data.score < 50) {
                    console.log(`Score below 50 for proxy ${proxy}, re-authenticating...`);
                    await this.send(requestConfig);
                    break;
                }
            } catch (error) {
                console.error(`Ping failed for proxy ${proxy}:`, error);
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

}


module.exports = AIGAEAClient;