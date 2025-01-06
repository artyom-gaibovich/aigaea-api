const ProxyClientEntity = require('../../../domain/entities/proxy-client')

class ProxyClientFactory {
    constructor() {

    }

    create() {
        return new ProxyClientEntity();
    }
}

module.exports = ProxyClientFactory;

