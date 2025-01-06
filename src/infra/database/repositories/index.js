const ProxyClientRepository = require("./proxy-client/proxy-client.repository");

module.exports = ({prisma}) => {
    return {
        proxyClientRepository : new ProxyClientRepository(prisma)
    }
}