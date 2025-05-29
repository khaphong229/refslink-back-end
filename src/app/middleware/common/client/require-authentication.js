import _ from 'lodash'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'
import {User} from '@/models'
import {tokenBlocklist} from '@/app/services/admin/auth.service'
import {TOKEN_TYPE} from '@/configs'
import {getToken, verifyToken} from '@/utils/helpers'

async function requireAuthentication(req, res, next) {
    try {
        const token = getToken(req.headers)

        if (token) {
            const allowedToken = _.isUndefined(await tokenBlocklist.get(token))
            if (allowedToken) {
                const {user_id} = verifyToken(token, TOKEN_TYPE.AUTHORIZATION)
                const user = await User.findOne({_id: user_id})
                if (user) {
                    req.currentUser = user
                    next()
                    return
                }
            }
        }
    } catch (error) {
        if (!(error instanceof JsonWebTokenError)) {
            throw error
        }
        if (error instanceof TokenExpiredError) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: 'Vui lòng đăng nhập để tiếp tục.'
            })
        }
    }
    return res.status(401).json({
        status: 401,
        success: false,
        message: 'Vui lòng đăng nhập để tiếp tục.'
    })
}

export default requireAuthentication
