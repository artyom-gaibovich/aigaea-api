const ProxyEntity = require("./proxy");
const FileEntity = require("./file");

class ClientEntity {
    constructor(client) {
        this.id = client.id;
        this.gaeaToken = client.gaea_token;
        this.browserId = client.browser_id;
        this.proxy = new ProxyEntity(client.ClientsToProxies);
        this.file = new FileEntity(client.browser_id);
    }

    toJSON() {
        return {
            id: this.id,
            gaeaToken: this.gaeaToken,
            browserId: this.browserId,
            ...this.proxy.toJSON(),
            ...this.file.toJSON(),
        };
    }
}

module.exports = ClientEntity;