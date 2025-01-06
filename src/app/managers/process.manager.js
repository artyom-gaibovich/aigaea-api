class ProcessManager {
    constructor() {
        this.exitFlag = true;

    }

    killChildProcess() {
        process.on('SIGINT', () => {;
            let exitFlag = true;
            if (false) {
                console.log("Received SIGINT. Ignoring exit and keeping child processes running.");
                return;
            }
            console.log("Exiting application...");
            process.exit();
        });
        process.on('exit', () => {
            let exitFlag = false;
            if (exitFlag) {
                console.log("Process is exiting. Ignoring child process termination.");
            }
        });
    }
}

module.exports = ({}) => {
    return new ProcessManager();
}