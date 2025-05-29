import authRouter from './auth.router'
import userRouter from './user.router'
import uploadRouter from './upload.router'
import {prefixAdmin} from '../../configs/path'
import supportRouter from '../admin/support.router'
import shortenLinkRankingAdminRouter from './shorten-link-ranking.admin.router'

function routeAdmin(app) {
    const PATH_ADMIN = prefixAdmin
    app.use(PATH_ADMIN + '/auth', authRouter)
    app.use(PATH_ADMIN + '/users', userRouter)
    app.use(PATH_ADMIN + '/supports', supportRouter)
    app.use(PATH_ADMIN + '/shorten-link-ranking-admin', shortenLinkRankingAdminRouter)

    app.use('/upload', uploadRouter)
}

export default routeAdmin
