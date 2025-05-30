import apiWebRouter from './api-web.router'
import authRouter from './auth.router'
import dashboardRouter from './dashboard.router'
import shortenLinkRouter from './shorten-link.router'
import shortenToolRouter from './shorten-tool.router'
import supportRouter from './support.router'

function routeClient(app) {
    app.use('/auth', authRouter)
    app.use('/api-webs', apiWebRouter)
    app.use('/shorten-link', shortenLinkRouter)
    app.use('/support', supportRouter)
    app.use('/', shortenToolRouter)
    app.use('/dashboard', dashboardRouter)
}

export default routeClient
