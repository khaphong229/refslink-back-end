import _ from 'lodash'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'
import {Admin} from '@/models'
import {tokenBlocklist} from '@/app/services/admin/auth.service'
import {TOKEN_TYPE} from '@/configs'
import {abort, getToken, verifyToken} from '@/utils/helpers'

async function requireAuthentications(req, res, next) {
    try {
        const token = getToken(req.headers)
        if (!token) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: 'Vui lòng đăng nhập để tiếp tục.'
            })
        }

        const allowedToken = _.isUndefined(await tokenBlocklist.get(token))
        if (!allowedToken) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: 'Vui lòng đăng nhập để tiếp tục.'
            })
        }

        const {user_id} = verifyToken(token, TOKEN_TYPE.AUTHORIZATION)
        const admin = await Admin.findOne({_id: user_id})
        if (!admin) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: 'Vui lòng đăng nhập để tiếp tục.'
            })
        }

        req.currentUser = admin
        next()
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập để tiếp tục!'
            })
        }
        
        if (error instanceof JsonWebTokenError) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: 'Vui lòng đăng nhập để tiếp tục.'
            })
        }

        throw error
    }
}

export default requireAuthentications
