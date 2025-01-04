const fs = require('fs').promises;

class ProxyReader {

    async read(path = 'proxy.txt') {
        const proxyList =  await fs.readFile(path, 'utf-8');
        const proxies = proxyList.split('\n').map(proxy => `http://${proxy.trim()}`).filter(proxy => proxy);

        if (proxies.length === 0) {
            console.error("No proxies found in proxy.txt");
            throw new Error('No proxies found in proxy.txt')
        }
        return proxies;

    }

    readNew(proxyList) {
        const proxies = proxyList.split('\n').map(proxy => `http://${proxy.trim()}`).filter(proxy => proxy);

        if (proxies.length === 0) {
            console.error("No proxies found in proxy.txt");
            throw new Error('No proxies found in proxy.txt')
        }
        return proxies;

    }

}

module.exports = ProxyReader;