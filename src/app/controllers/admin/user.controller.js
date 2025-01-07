import * as userService from '../../services/admin/user.service'

export async function readRoot(req, res) {
    const result = await userService.filter(req.query)
    res.jsonify(result)
}

export async function readItem(req, res) {
    const result = await userService.details(req.params.id)
    res.jsonify(result)
}

export async function createItem(req, res) {
    await userService.create(req.body)
    res.status(201).jsonify('Tạo mới người dùng thành công.')
}

export async function updateItem(req, res) {
    await userService.update(req.user, req.body)
    res.status(201).jsonify('Cập nhật người dùng thành công.')
}

export async function removeItem(req, res) {
    await userService.remove(req.user)
    res.jsonify('Xoá người dùng thành công.')
}

export async function resetPassword(req, res) {
    await userService.resetPassword(req.user, req.body.new_password)
    res.status(201).jsonify('Đặt lại mật khẩu thành công.')
}
