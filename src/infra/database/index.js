const {PrismaClient} = require("@prisma/client");


module.exports = () => {
    return new PrismaClient()
}

