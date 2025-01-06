const express = require('express')

module.exports = ({router}) => {
    const app = express();

    app.disable('x-powered-by')
    app.use(express.text({limit: '10mb'}));

    app.use(express.raw({type: 'application/octet-stream', limit: '1mb'}));
    app.use(router);
    app.use(express.static('public/docs'))


    return {
        app,
        start: () => new Promise((resolve) => {
            const http = app.listen(process.env['PORT'], () => {
                const {port} = http.address();
                console.log(`🤘 API - Port ${port}`);
            })
        })
    }
}