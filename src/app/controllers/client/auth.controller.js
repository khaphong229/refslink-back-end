import { LINK_RESET_PASSWORD_URL, LINK_VERIFICATION_ACCOUNT, TOKEN_TYPE } from '@/configs'
import { abort, generateToken, getToken } from '@/utils/helpers'
import * as authService from '../../services/client/auth.service'
import * as userService from '../../services/admin/user.service'

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
