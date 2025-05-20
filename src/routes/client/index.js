import apiWebRouter from './api-web.router'
import authRouter from './auth.router'
import shortenLinkRouter from './shorten-link.router'
import shortenToolRouter from './shorten-tool.router'

function routeClient(app) {
    app.use('/auth', authRouter)
    app.use('/api-webs', apiWebRouter)
    app.use('/shorten-link', shortenLinkRouter)
    app.use('/', shortenToolRouter)
}

export default routeClient
