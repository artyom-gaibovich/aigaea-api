const {createContainer, asValue, asFunction, asClass} = require('awilix')
const prisma = require('../src/infra/database/index')
const app = require('../src/app/index')
const server = require('../src/infra/http/server')
const router = require('../src/infra/http/router')
const WorkerManager = require("./app/managers/worker.manager");
const repository = require('../src/infra/database/repositories');
const factory = require('../src/app/factories/index');
const processManager = require("./app/managers/process.manager");
const middlewares = require('./infra/http/middleware/index');

const diContainer = createContainer();
diContainer.register({
    app: asFunction(app).singleton(),
    middlewares: asFunction(middlewares).singleton(),
    router: asFunction(router).singleton(),
    server: asFunction(server).singleton(),
    prisma: asFunction(prisma).singleton(),
    workerManager: asFunction(WorkerManager).singleton(),
    repository: asFunction(repository).singleton(),
    factory: asFunction(factory).singleton(),
    processManager: asFunction(processManager).singleton(),
});

module.exports = diContainer;