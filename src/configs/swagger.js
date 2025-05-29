import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import path from 'path'

// Swagger definition
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'RefsLink API Documentation',
        version: '1.0.0',
        description: 'API documentation for RefsLink Backend',
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
        },
        contact: {
            name: 'API Support',
            email: 'support@refslink.com',
        },
    },
    servers: [
        {
            url: 'http://localhost:3111',
            description: 'Development server',
        },
        {
            url: 'https://api.refslink.com',
            description: 'Production server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
}

// Options for the swagger docs
const options = {
    swaggerDefinition,
    // Path to the API docs
    apis: [
        path.join(__dirname, '../routes/**/*.js'),
        path.join(__dirname, '../models/*.js'),
    ],
}

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options)

// Initialize Swagger middleware
export const setupSwagger = (app) => {
    // Serve swagger docs
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'RefsLink API Documentation',
    }))

    // Serve swagger spec as JSON
    app.get('/swagger.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerSpec)
    })

    console.log('Swagger documentation available at /api-docs')
}
