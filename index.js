const diContainer = require('./src/di-container');

const app = diContainer.resolve('app');

app
    .start()
    .catch((error) => {
        console.error(error.stack);
        process.exit()
    })
