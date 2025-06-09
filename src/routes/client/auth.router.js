import { Router } from 'express'
import requireAuthentication from '@/app/middleware/common/client/require-authentication'
import validate from '@/app/middleware/common/validate'
import * as authMiddleware from '../../app/middleware/auth.middleware'
import * as authRequest from '../../app/requests/client/auth.request'
import * as authController from '../../app/controllers/client/auth.controller'
import { asyncHandler } from '@/utils/helpers'
import passport from 'passport'
import * as authService from '../../app/services/client/auth.service'
import { redirect } from 'statuses'
import { APP_URL_CLIENT } from '@/configs'


const authRouter = Router()

authRouter.post('/login', asyncHandler(validate(authRequest.login)), asyncHandler(authController.login))

authRouter.post(
    '/register',
    asyncHandler(validate(authRequest.register)),
    asyncHandler(authController.register)
)

authRouter.post(
    '/verify-email/:token',
    asyncHandler(authMiddleware.verifyEmailToken),
    asyncHandler(authController.verifyEmailToken)
)

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }))

authRouter.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/auth/login?error=google_auth_failed',
    }),
    (req, res) => {
        try {
            if (!req.user) {
                return redirect(`${APP_URL_CLIENT}/login/?error=user_not_found`)
            }

            const result = authService.authToken(req.user)

            const redirectUrl = `${APP_URL_CLIENT}/user/login/success?token=${result.access_token}`

            return res.redirect(redirectUrl)
        } catch (error) {
            console.error('Error in Google callback:', error)
            return res.redirect(`${APP_URL_CLIENT}/login/?error=server_failed`)
        }
    }
)

authRouter.get('/me', asyncHandler(requireAuthentication), asyncHandler(authController.me))

authRouter.get(
    '/update-earnings',
    asyncHandler(requireAuthentication),
    asyncHandler(authController.updateUserEarnings)
)

authRouter.put(
    '/me',
    asyncHandler(requireAuthentication),
    asyncHandler(validate(authRequest.updateProfile)),
    asyncHandler(authController.updateProfile)
)

authRouter.get('/login/success', asyncHandler(authController.loginSuccess))

authRouter.post('/logout', asyncHandler(requireAuthentication), asyncHandler(authController.logout))

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
