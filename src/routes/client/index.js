import apiWebRouter from './api-web.router'
import authRouter from './auth.router'

function routeClient(app) {
    app.use('/auth', authRouter)
    app.use('/api-webs', apiWebRouter)
}

export default routeClient
