const ProxyClientEntity = require("../../domain/entities/proxy-client");
const {join} = require("path");
const {fork} = require("child_process");
const ClientEntity = require("../../domain/entities/client");
const ChildProcessHandler = require("../handlers/child-process.handler");

class WorkerManager {

    constructor({repository, factory}) {
        this.processMap = new Map();
        this.proxyClientRepository = repository.proxyClientRepository;
        this.proxyClientFactory = factory.proxyClientFactory;
    }


    /**
     *
     * @param id
     * @returns {string}
     */
    stopById(id) {
        const childProcess = this.processMap.get(id);
        if (!childProcess) {
            throw new Error(`Нет запущенного клиента с ID = ${id}`);
        }
        try {
            childProcess.kill();
            this.processMap.delete(id);
            return `Клиент с ID: ${id} был успешно выключен.`;
        } catch (error) {
            throw new Error(`Ошибка при остановке клиента с ID=${id} Ошибка: ${error.message}`);
        }
    }


    /*   async start(client) {
           const clientEntity = this.proxyClientFactory.create();
           clientEntity.setId(client.id);
           clientEntity.setGaeaToken(client.gaea_token);
           clientEntity.setBrowserId(client.browser_id);
           clientEntity.setProxies(client.ClientsToProxies.map((ctp) => `http://${ctp.proxy.id}`));
           clientEntity.setBrowserIdFilePath(join(__dirname, '..', '..', '..', 'uploads', `${client.browser_id}-browser_ids.json`));

           const childProcess = fork('./child.js', [JSON.stringify(clientEntity.toJSON())]);
           this.processMap.set(clientEntity.id, childProcess);
           childProcess.on('message', (message) => {
               console.log(`Child process ${clientEntity.id} Message: ${message}`);
           });
           childProcess.on('error', (error) => {
               console.error(`Child process ${clientEntity.id} Error: ${error.message}`);
           });
           childProcess.on('exit', (code) => {
               console.log(`Child process ${clientEntity.id} exited with code ${code}`);
               this.processMap.delete(clientEntity.id);
           });
       }*/



    start(client) {
        const clientEntity = new ClientEntity(client);
        const handler = new ChildProcessHandler(clientEntity, './child.js');
        const childProcess = handler.start();
        this.processMap.set(clientEntity.id, handler);
        childProcess.on('exit', () => {
            this.processMap.delete(clientEntity.id);
        });
    }


    /**
     *
     * @param clients
     */
    startAll(clients) {
        const newClients = clients.map((client) => new ClientEntity(client));
        const handlers = newClients.map((clientEntity) => new ChildProcessHandler(clientEntity, './child.js'));
        handlers.forEach(handler => {
            const childProcess = handler.start();
            this.processMap.set(handler.getClientEntity().id, handler);
            childProcess.on('exit', () => {
                this.processMap.delete(handler.getClientEntity().id);
            });
        })
    }

    stopAll() {

    }
}


module.exports = ({repository, factory}) => {
    return new WorkerManager({repository, factory});
};

