module.exports = ({prisma, server}) => {
    return {
        start: () => {
            const prom =  Promise.resolve().then(server.start)
            return prom
        }

    }
}