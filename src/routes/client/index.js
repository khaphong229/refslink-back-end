import authRouter from './auth.router'

function routeClient(app) {
    app.use('/auth', authRouter)
}

export default routeClient
