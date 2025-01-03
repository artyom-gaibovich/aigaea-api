class ProxyTaskManager {

    constructor(AIGAEAClient) {
        this.AIGAEAClient = AIGAEAClient;
    }

    async run(startConfig) {
        const {proxies, id8, headers, browserIdFilePath} = startConfig
        try {
            const tasks = proxies.map(proxy => this.AIGAEAClient.send({
                url: '',
                headers: headers,
                payload: {},
                proxy: proxy,
                id8: id8,
                browserIdFilePath: browserIdFilePath
            }));
            await Promise.all(tasks);
        } catch (error) {
            console.error('An error occurred:', error);
        }

    }
}


module.exports = ProxyTaskManager;