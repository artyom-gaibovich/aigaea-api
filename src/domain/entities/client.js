const ProxyEntity = require("./proxy");
const FileEntity = require("./file");

class ClientEntity {
    constructor(client) {
        this.id = client.id;
        this.gaea_token = client.gaea_token;
        this.browser_id = client.browser_id;
        this.proxy = new ProxyEntity(client.ClientsToProxies);
        this.file = new FileEntity(client.browser_id);
    }

    toJSON() {
        return {
            id: this.id,
            gaea_token: this.gaea_token,
            browser_id: this.browser_id,
            ...this.proxy.toJSON(),
            ...this.file.toJSON(),
        };
    }
}

module.exports = ClientEntity;