import * as googleAuthService from '../../services/client/google-auth.service'
import { authToken } from '../../services/client/auth.service'

export function googleCallback(req, res) {
    try {
        console.log('Google callback received:', req.user)
        
        const user = req.user
        if (!user) {
            console.error('No user found in request')
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'Không tìm thấy thông tin người dùng từ Google',
                data: null,
            })
        }

        // If user is a profile object (new user), return registration required
        if (!user._id) {
            return res.status(200).json({
                status: 200,
                success: false,
                message: 'Bạn chưa đăng ký tài khoản. Vui lòng đăng ký để tiếp tục.',
                data: {
                    profile: user,
                    isNewUser: true
                }
            })
        }
        
        console.log('Generating token for user:', user._id)
        const token = authToken(user)
        
        console.log('Sending successful response')
        res.status(200).json({
            status: 200,
            success: true,
            message: 'Login successful',
            data: {
                access_token: token.access_token,
                expires_in: token.expire_in,
                token_type: 'Bearer',
                user: {
                    id: user._id.toString(),
                    name: user.name || user.full_name || '',
                    email: user.email || '',
                    avatar: user.avatar || '',
                },
            },
        })
    } catch (error) {
        console.error('Error in googleCallback:', error)
        res.status(500).json({
            status: 500,
            success: false,
            message: 'Đã xảy ra lỗi khi xử lý đăng nhập Google',
            data: null,
            error: error.message
        })
    }
}

export async function registerWithGoogle(req, res) {
    try {
        const { profile } = req.body
        
        if (!profile || !profile.googleId) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'Thông tin đăng ký không hợp lệ',
                data: null
            })
        }

        const result = await googleAuthService.registerWithGoogle(profile)
        
        res.status(200).json({
            status: 200,
            success: true,
            message: 'Đăng ký tài khoản thành công',
            data: {
                access_token: result.token.access_token,
                expires_in: result.token.expire_in,
                token_type: 'Bearer',
                user: {
                    id: result.user._id.toString(),
                    name: result.user.name || result.user.full_name || '',
                    email: result.user.email || '',
                    avatar: result.user.avatar || '',
                }
            }
        })
    } catch (error) {
        console.error('Error in registerWithGoogle:', error)
        res.status(500).json({
            status: 500,
            success: false,
            message: error.message || 'Đã xảy ra lỗi khi đăng ký tài khoản',
            data: null
        })
    }
} 