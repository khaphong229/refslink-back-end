import apiWebRouter from './api-web.router'
import authRouter from './auth.router'
import dashboardRouter from './dashboard.router'
import shortenLinkRouter from './shorten-link.router'
import shortenToolRouter from './shorten-tool.router'
import supportRouter from './support.router'
import shortenLinkRankingUserRouter from './shorten-link-ranking.client.router'
import qrcodeRouter from './qrcode.router'
import referalRouter from './referal.router'
import withdrawRouter from './withdraw.router'
import referralLogRouter from './referral-log.router'

function routeClient(app) {
    app.use('/auth', authRouter)
    app.use('/api-webs', apiWebRouter)
    app.use('/shorten-link', shortenLinkRouter)
    app.use('/support', supportRouter)
    app.use('/', shortenToolRouter)
    app.use('/dashboard', dashboardRouter)
    app.use('/shorten-link-ranking-client', shortenLinkRankingUserRouter)
    app.use('/qrcode', qrcodeRouter)
    app.use('/referal', referalRouter)
    app.use('/withdraw', withdrawRouter)
    app.use('/referral-logs', referralLogRouter)
}

export default routeClient
