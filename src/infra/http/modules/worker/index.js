const container = require("../../../../di-container");
module.exports = () => {
    const {prisma, workerManager, repository, middlewares} = container.cradle
    return {
        router: require('./router')({prisma, workerManager, repository, middlewares}),
    }
};