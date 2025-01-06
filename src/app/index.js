module.exports = ({processManager, server}) => {
    return {
        start: () => {
            const prom = Promise.resolve().then(processManager.killChildProcess).then(server.start)
            return prom
        }

    }
}