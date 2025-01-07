import {Router} from 'express'
import requireAuthentication from '@/app/middleware/common/admin/require-authentication'
import validate from '@/app/middleware/common/validate'
import * as authMiddleware from '../../app/middleware/auth.middleware'
import * as authRequest from '../../app/requests/admin/auth.request'
import * as authController from '../../app/controllers/admin/auth.controller'
import {asyncHandler} from '@/utils/helpers'

const authRouter = Router()

authRouter.post('/login', asyncHandler(validate(authRequest.login)), asyncHandler(authController.login))

authRouter.post(
    '/register',
    asyncHandler(validate(authRequest.register)),
    asyncHandler(authController.register)
)

authRouter.post('/logout', asyncHandler(requireAuthentication), asyncHandler(authController.logout))

authRouter.get('/me', asyncHandler(requireAuthentication), asyncHandler(authController.me))

authRouter.put(
    '/me',
    asyncHandler(requireAuthentication),
    asyncHandler(validate(authRequest.updateProfile)),
    asyncHandler(authController.updateProfile)
)

authRouter.patch(
    '/change-password',
    asyncHandler(requireAuthentication),
    asyncHandler(validate(authRequest.changePassword)),
    asyncHandler(authController.changePassword)
)

authRouter.post(
    '/forgot-password',
    asyncHandler(validate(authRequest.forgotPassword)),
    authController.forgotPassword
)

authRouter.post(
    '/reset-password/:token',
    asyncHandler(authMiddleware.verifyForgotPasswordToken),
    asyncHandler(validate(authRequest.resetPassword)),
    asyncHandler(authController.resetPassword)
)

export default authRouter
