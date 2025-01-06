const {fork} = require('child_process');

class ChildProcessHandler {
    constructor(clientEntity, scriptPath) {
        this.clientEntity = clientEntity;
        this.scriptPath = scriptPath;
        this.childProcess = null;
    }

    start() {
        this.childProcess = fork(this.scriptPath, [JSON.stringify(this.clientEntity.toJSON())]);
        this.registerEvents();
        return this.childProcess;
    }

    getClientEntity() {
        return this.clientEntity;
    }

    registerEvents() {
        this.childProcess.on('message', (message) => {
            console.log(`Child process ${this.clientEntity.id} Message: ${message}`);
        });

        this.childProcess.on('error', (error) => {
            console.error(`Child process ${this.clientEntity.id} Error: ${error.message}`);
        });

        this.childProcess.on('exit', (code) => {
            console.log(`Child process ${this.clientEntity.id} exited with code ${code}`);
        });
    }

    stop() {
        if (this.childProcess) {
            this.childProcess.kill();
            console.log(`Child process ${this.clientEntity.id} stopped.`);
        }
    }
}

module.exports = ChildProcessHandler;