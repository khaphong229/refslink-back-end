const swaggerJsdoc = require('swager-jsdoc')
const swaggerUi = require('swagger-ui-express')
import { APP_URL_CLIENT } from './constants.js'

const options = {
    definition : {
        openapi: '3.0.0',
        info: {
            title: 'Refslink api',
            version: '1.0.0',
            description: 'Doc swagger api of refslink'
        },
        servers: [
            {
                url: APP_URL_CLIENT,
            }
        ]
    },
    apis: ['./routes/*/js'],
}

const swaggerSpec = swaggerJsdoc(options)

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.server, swaggerUi.setup(swaggerSpec))
}

module.exports = setupSwagger
