const controller = require('./utils/create-controller')
const {Router, json} = require("express");
const compression = require('compression')
const bodyParser = require('body-parser')
const cors = require('cors')

module.exports = ({prisma}) => {
    const router = Router()

    const apiRouter = Router()
    apiRouter
        .use(cors({
            origin: [
                'http://localhost:3000'
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }))
        .use(bodyParser.json())
        .use(compression())
    apiRouter.use('/proxies', controller('proxies').router)
    apiRouter.use('/proxy-client', controller('proxy-client').router)
    apiRouter.use('/', controller('index'))


    router.use(`/api/v1`, apiRouter)
    return router;
}