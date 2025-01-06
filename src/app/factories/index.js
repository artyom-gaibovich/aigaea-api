const ProxyClientFactory = require("./proxy-client/proxy-client.factory");

module.exports = () => {
    return {
        proxyClientFactory: new ProxyClientFactory()
    }
}