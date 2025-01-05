const path = require('path');

module.exports = function (URI) {
    const controllerPath = path.resolve(URI, 'controllers');
    const Controller = require(controllerPath);
    return Controller();
};