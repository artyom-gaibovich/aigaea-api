const container = require("../../../../di-container");
module.exports = () => {
    const { prisma } = container.cradle
    return {
        router: require('./router')({prisma}),
    }
};