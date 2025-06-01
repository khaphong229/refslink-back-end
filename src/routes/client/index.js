import apiWebRouter from './api-web.router'
import authRouter from './auth.router'
import shortenLinkRouter from './shorten-link.router'
import shortenToolRouter from './shorten-tool.router'
import supportRouter from './support.router'
// import shortenLinkRankingRouter from './shorten-link-ranking.router'
import shortenLinkRankingUserRouter from './shorten-link-ranking.client.router'
import qrcodeRouter from './qrcode.router'

function routeClient(app) {
    app.use('/auth', authRouter)
    app.use('/api-webs', apiWebRouter)
    app.use('/shorten-link', shortenLinkRouter)
    app.use('/support',supportRouter) 
    app.use('/', shortenToolRouter)
    app.use('/shorten-link-ranking-client', shortenLinkRankingUserRouter)
    app.use('/qrcode', qrcodeRouter)
}

export default routeClient
