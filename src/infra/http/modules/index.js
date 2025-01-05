const swaggerJSDoc = require('swagger-jsdoc')
const Status = require('http-status')
const {Router} = require('express')
const swaggerUi = require('swagger-ui-express');
const path = require('path');
module.exports = () => {
    const router = Router()

    // swagger definition

    const swaggerDefinition = {
        info: {
            title: 'Dynastic Search Express API Explorer',
            version: '1.0.0',
            description: 'Available REST Endpoints of Node DDD RESTful API'
        },
        host: `${process.env.API_SWAGGER}:${process.env.PORT}/api/${process.env.APP_VERSION}`,
        basePath: '/',
        servers: [
            {
                url: 'http://localhost:3002',
            },
        ],
        securityDefinitions: {
            JWT: {
                description: '',
                type: 'apiKey',
                name: 'Authorization',
                in: 'header'
            }
        }
    }

    const options = {
        swaggerDefinition: swaggerDefinition,
        apis: ['src/infra/http/modules/**/*.js']
    }

    const swaggerSpec = swaggerJSDoc(options)

    /**
     * @swagger
     * responses:
     *   Unauthorized:
     *     description: Unauthorized
     *   BadRequest:
     *     description: BadRequest / Invalid Input
     */

    /**
     * @swagger
     * /:
     *   get:
     *     tags:
     *       - Status
     *     description: Returns API status
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: API Status
     */
    router.get('/', (req, res) => {
        res.status(Status.OK).json({status: 'API working'})
    })

    router.get('/swagger.json', (req, res) => {
        res.status(Status.OK).json(swaggerSpec)
    })

    return router
}
