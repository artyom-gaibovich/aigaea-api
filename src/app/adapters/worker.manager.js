const {spawn} = require('child_process');

class WorkerManager {

    constructor(processManager) {
        this.processMap = new Map();
        this.processManager = processManager;
    }



}


module.exports = ({processManager}) => {
    return new WorkerManager(processManager);
};

