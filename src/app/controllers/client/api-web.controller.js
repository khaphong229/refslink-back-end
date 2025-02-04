import * as apiWebService from '@/app/services/client/api-web.service'

export const readRoot = async (req, res) => {
    const limit = Math.max(1, parseInt(req.query.limit) || 10)
    const current = Math.max(1, parseInt(req.query.current) || 10)
    const result = await apiWebService.filter(req.query, limit, current, req)
    res.jsonify(result)
}

export const createApiWeb = async (req, res) => {
    await apiWebService.create(req.body, req)
    res.status(201).jsonify('Tạo mới api web thành công!')
}

export const detailApiWeb = async (req, res) => {
    const result = await apiWebService.detail(req.params.id, req)
    res.status(200).jsonify(result)
}

export const deleted = async (req, res) => {
    await apiWebService.deleted(req.params.id, req)
    res.status(200).jsonify('Xóa api web thành công.')
}

export const update = async (req, res) => {
    const result = await apiWebService.update(req.data, req.body)
    res.status(200).jsonify(result)
}
