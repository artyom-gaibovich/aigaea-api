export class ProcessManager {
    constructor() {
        this.exitFlag = true;

    }

    killChildProcess() {
        process.on('SIGINT', () => {
            if (!this.exitFlag) {
                console.log("Received SIGINT. Ignoring exit and keeping child processes running.");
                return;
            }
            console.log("Exiting application...");
            process.exit();
        });
        process.on('exit', () => {
            if (!this.exitFlag) {
                console.log("Process is exiting. Ignoring child process termination.");
            }
        });
    }
}

module.exports = {
    ProcessManager,
};