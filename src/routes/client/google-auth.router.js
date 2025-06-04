import { Router } from 'express'
import passport from 'passport'
import { googleCallback, registerWithGoogle } from '../../app/controllers/client/google-auth.controller'

const router = Router()

// Middleware xử lý lỗi
const handleError = (err, req, res, next) => {
    console.error('Google auth error:', err)
    res.status(500).json({
        status: 500,
        success: false,
        message: 'Đã xảy ra lỗi khi xác thực Google',
        error: err.message
    })
}

router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
)

router.get('/google/callback',
    (req, res, next) => {
        passport.authenticate('google', { 
            session: false,
            failureRedirect: '/auth/login?error=google_auth_failed'
        })(req, res, next)
    },
    googleCallback,
    handleError
)

// Route đăng ký tài khoản bằng Google
router.post('/google/register', registerWithGoogle)

export default router 