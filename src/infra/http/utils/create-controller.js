const path = require('path');

module.exports = function (URI) {
    const controllerPath = path.resolve('src/infra/http/modules', URI);
    const Controller = require(controllerPath);
    return Controller();
};