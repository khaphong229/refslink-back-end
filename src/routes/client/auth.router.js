import { Router } from 'express'
import requireAuthentication from '@/app/middleware/common/client/require-authentication'
import validate from '@/app/middleware/common/validate'
import * as authMiddleware from '../../app/middleware/auth.middleware'
import * as authRequest from '../../app/requests/client/auth.request'
import * as authController from '../../app/controllers/client/auth.controller'
import { asyncHandler } from '@/utils/helpers'
import passport from 'passport'
import * as authService from '../../app/services/client/auth.service'

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

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

authRouter.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/auth/login?error=google_auth_failed',
    }),
    (req, res) => {
        try {
            // Check if user is available in the request
            if (!req.user) {
                console.error('No user found in request after Google authentication')
                return res.status(400).jsonify({
                    status: 400,
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng sau khi xác thực Google',
                    data: null,
                })
            }

            // Tạo token JWT cho user
            const result = authService.authToken(req.user)

            console.log('Authentication successful. Returning token...')

            // Trả về response theo định dạng yêu cầu
            res.status(200).jsonify({
                status: 200,
                success: true,
                message: 'Login successful',
                data: {
                    access_token: result.access_token,
                    expires_in: result.expire_in,
                    token_type: 'Bearer',
                    user: {
                        id: req.user._id.toString(),
                        name: req.user.name || req.user.full_name || '',
                        email: req.user.email || '',
                        avatar: req.user.avatar || '',
                    },
                },
            })
        } catch (error) {
            console.error('Error in Google callback:', error)
            res.status(500).jsonify({
                status: 500,
                success: false,
                message: 'Đã xảy ra lỗi khi xử lý đăng nhập Google',
                data: null,
            })
        }
    }
)

authRouter.get('/me', asyncHandler(requireAuthentication), asyncHandler(authController.me))

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
