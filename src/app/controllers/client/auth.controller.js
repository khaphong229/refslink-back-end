import { LINK_RESET_PASSWORD_URL, LINK_VERIFICATION_ACCOUNT, TOKEN_TYPE } from '@/configs'
import { abort, generateToken, getToken } from '@/utils/helpers'
import * as authService from '../../services/client/auth.service'
import * as userService from '../../services/admin/user.service'
// controllers/auth.controller.js

import jwt from 'jsonwebtoken'
import { User } from '@/models'

export async function login(req, res) {
    const [validLogin, result] = await authService.checkValidLogin(req.body)

    if (validLogin) {
        res.jsonify(authService.authToken(result))
    } else {
        abort(400, result)
    }
}

export async function register(req, res) {
    const newUser = await authService.register(req.body)
    const result = authService.authToken(newUser)

    const { access_token } = result
    if (access_token) {
        res.sendMail(req.body?.email, 'Xác minh tài khoản Refslink', 'emails/verification-account', {
            name: req.body?.name,
            linkVerificationAccount: `${LINK_VERIFICATION_ACCOUNT}/${encodeURIComponent(access_token)}`,
        })
    }
    res.status(200).jsonify('Gửi yêu cầu xác minh tài khoản thành công! Vui lòng kiểm tra email.')
}

export async function verifyAccount(req, res) {
    await authService.updateProfile(req.currentUser, {
        name: req.currentUser.name,
        email: req.currentUser.email,
        status: 'active',
    })
    res.status(200).jsonify('Xác minh tài khoản thông qua email thành công!')
}



export async function verifyEmailToken(req, res) {
    const { token } = req.params
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(payload.user_id)
        console.log(user)
        if (!user) return res.status(404).jsonify('Không tìm thấy người dùng')

        // Cập nhật trạng thái
        user.status = 'active'
        
        await user.save()

        res.status(200).jsonify('Xác minh tài khoản thành công!')
    } catch (err) {
        res.status(400).jsonify('Token không hợp lệ hoặc đã hết hạn.')
    }
}


export async function logout(req, res) {
    const token = getToken(req.headers)
    await authService.blockToken(token)
    res.jsonify('Đăng xuất thành công.')
}

export async function me(req, res) {
    const result = await authService.profile(req.currentUser._id)
    res.jsonify(result)
}

export async function updateProfile(req, res) {
    await authService.updateProfile(req.currentUser, req.body)
    res.status(201).jsonify('Cập nhật thông tin cá nhân thành công.')
}

export async function changePassword(req, res) {
    await userService.resetPassword(req.currentUser, req.body.new_password)
    res.status(201).jsonify('Cập nhật mật khẩu thành công.')
}

export function forgotPassword(req, res) {
    const token = generateToken({ user_id: req.currentUser._id }, TOKEN_TYPE.FORGOT_PASSWORD, 600)
    res.sendMail(req.currentUser.email, 'Quên mật khẩu', 'emails/forgot-password', {
        name: req.currentUser.name,
        linkResetPassword: `${LINK_RESET_PASSWORD_URL}?token=${encodeURIComponent(token)}`,
    })
    res.status(200).jsonify('Yêu cầu lấy lại mật khẩu thành công! Vui lòng kiểm tra email của bạn.')
}

export async function resetPassword(req, res) {
    await userService.resetPassword(req.currentUser, req.body.new_password)
    await authService.blockToken(req.params.token)
    res.status(201).jsonify('Cập nhật mật khẩu thành công.')
}

export async function loginSuccess(req, res) {
    const token = req.query.token
    if (!token) {
        return res.status(400).jsonify({ 
            status: 400,
            success: false,
            message: 'Token không hợp lệ',
            data: null
        })
    }
    
    try {
        // Lấy thông tin user từ token
        const decoded = req.user
        const user = await authService.profile(decoded?._id || decoded?.user_id)
        
        // Trả về định dạng JSON theo yêu cầu
        res.status(200).jsonify({
            status: 200,
            success: true,
            message: 'Login successful',
            data: {
                access_token: token,
                expires_in: 3600, 
                token_type: 'Bearer',
                user: user ? {
                    id: user._id.toString(),
                    name: user.name || user.full_name || '',
                    email: user.email || '',
                    avatar: user.avatar || ''
                } : null
            }
        })
    } catch (error) {
        console.error('Error in login success handler:', error)
        res.status(500).jsonify({
            status: 500,
            success: false,
            message: 'Đã xảy ra lỗi khi xử lý token',
            data: null
        })
    }
}
