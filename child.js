const ClientProxy = require("./adapters/task/ClientProxy");
const ProxyTaskManager = require("./adapters/ProxyWorker");
const AIGAEAClient = require("./adapters/aigaea.client");
const HttpSender = require("./adapters/http-sender");
const BrowserIdsManager = require("./adapters/browser-ids/browser-ids-manager");
const BrowserIdsFileManager = require("./adapters/browser-ids/browser-ids-file-manager");

const clientData = JSON.parse(process.argv[2]);

(async () => {
    const proxyWorker = new ProxyTaskManager(new AIGAEAClient(new HttpSender(), new BrowserIdsManager(new BrowserIdsFileManager())))
    const client = new ClientProxy({...clientData, proxyWorker});
    await client.run();

})();
