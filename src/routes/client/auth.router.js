import {Router} from 'express'
import requireAuthentication from '@/app/middleware/common/client/require-authentication'
import validate from '@/app/middleware/common/validate'
import * as authMiddleware from '../../app/middleware/auth.middleware'
import * as authRequest from '../../app/requests/client/auth.request'
import * as authController from '../../app/controllers/client/auth.controller'
import {asyncHandler} from '@/utils/helpers'
import passport from 'passport'
import * as authService from '../../app/services/client/auth.service'

const authRouter = Router()

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to the application
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                     expires_in:
 *                       type: integer
 *                     token_type:
 *                       type: string
 *                       example: Bearer
 *                     user:
 *                       type: object
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Unauthorized
 */
authRouter.post('/login', asyncHandler(validate(authRequest.login)), asyncHandler(authController.login))

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               full_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data
 */
authRouter.post(
    '/register',
    asyncHandler(validate(authRequest.register)),
    asyncHandler(authController.register)
)

/**
 * @swagger
 * /auth/verify-email/{token}:
 *   post:
 *     summary: Verify user email with token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
authRouter.post(
    '/verify-account/:token',
    asyncHandler(authMiddleware.verifyEmailToken),
    asyncHandler(authController.verifyEmailToken)
)

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Google authentication page
 */
authRouter.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}))

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback handler
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *     responses:
 *       200:
 *         description: Authentication successful
 *       400:
 *         description: Authentication failed
 */
authRouter.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/auth/login?error=google_auth_failed' }),
    (req, res) => {
        try {
            // Check if user is available in the request
            if (!req.user) {
                console.error('No user found in request after Google authentication')
                return res.status(400).jsonify({
                    status: 400,
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng sau khi xác thực Google',
                    data: null
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
                        avatar: req.user.avatar || ''
                    }
                }
            })
        } catch (error) {
            console.error('Error in Google callback:', error)
            res.status(500).jsonify({
                status: 500,
                success: false,
                message: 'Đã xảy ra lỗi khi xử lý đăng nhập Google',
                data: null
            })
        }
    }
)

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *       401:
 *         description: Unauthorized
 */
authRouter.get('/me', asyncHandler(requireAuthentication), asyncHandler(authController.me))

/**
 * @swagger
 * /auth/me:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
authRouter.put(
    '/me',
    asyncHandler(requireAuthentication),
    asyncHandler(validate(authRequest.updateProfile)),
    asyncHandler(authController.updateProfile)
)

/**
 * @swagger
 * /auth/login/success:
 *   get:
 *     summary: Check login success
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Login success status
 */
authRouter.get('/login/success', asyncHandler(authController.loginSuccess))

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout from the application
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
authRouter.post('/logout', asyncHandler(requireAuthentication), asyncHandler(authController.logout))

/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     summary: Change user password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - old_password
 *               - password
 *               - password_confirmation
 *             properties:
 *               old_password:
 *                 type: string
 *               password:
 *                 type: string
 *               password_confirmation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
authRouter.patch(
    '/change-password',
    asyncHandler(requireAuthentication),
    asyncHandler(validate(authRequest.changePassword)),
    asyncHandler(authController.changePassword)
)

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Invalid email
 */
authRouter.post(
    '/forgot-password',
    asyncHandler(validate(authRequest.forgotPassword)),
    authController.forgotPassword
)

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - password_confirmation
 *             properties:
 *               password:
 *                 type: string
 *               password_confirmation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or password mismatch
 */
authRouter.post(
    '/reset-password/:token',
    asyncHandler(authMiddleware.verifyForgotPasswordToken),
    asyncHandler(validate(authRequest.resetPassword)),
    asyncHandler(authController.resetPassword)
)

export default authRouter
