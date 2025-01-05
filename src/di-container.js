const {createContainer, asValue, asFunction} = require('awilix')
const prisma = require('../src/infra/database/index')
const app = require('../src/app/index')
const server = require('../src/infra/http/server')
const router = require('../src/infra/http/router')
const diContainer = createContainer();

diContainer.register({
    app: asFunction(app).singleton(),
    router: asFunction(router).singleton(),
    server: asFunction(server).singleton(),
    prisma: asFunction(prisma).singleton()
});

module.exports = diContainer;