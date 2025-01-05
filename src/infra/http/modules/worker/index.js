const container = require("../../../../di-container");
module.exports = () => {
    const { prisma, workerManager } = container.cradle
    return {
        router: require('./router')({prisma, workerManager}),
    }
};