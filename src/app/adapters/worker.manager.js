const {spawn} = require('child_process');

class WorkerManager {

    constructor() {
        this.processMap = new Map();
    }

    startClient(clientData) {
        const process = spawn('node', ['path/to/client/script.js', JSON.stringify(clientData)], {
            stdio: 'inherit',
        });

        this.processMap.set(clientData.id, process.pid);
        console.log(`Client ${clientData.id} started with PID: ${process.pid}`);
    }


    stopClient(clientId) {
        const pid = this.processMap.get(clientId);
        if (!pid) {
            console.error(`No process found for client ${clientId}`);
            return;
        }

        try {
            process.kill(pid);
            this.processMap.delete(clientId);
            console.log(`Client ${clientId} stopped.`);
        } catch (err) {
            console.error(`Failed to stop client ${clientId}:`, err);
        }
    }

}


module.exports = WorkerManager;