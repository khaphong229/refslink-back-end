import * as apiWebService from '@/app/services/client/api-web.service'

export const readRoot = async (req, res) => {
    const limit = parseInt(req.query.limit)
    const current = parseInt(req.query.current)
    const result = await apiWebService.filter(req.query, limit, current, req)
    res.jsonify(result)
}

export const createApiWeb = async (req, res) => {
    await apiWebService.create(req.body, req)
    res.status(201).jsonify('Tạo mới api web thành công!')
}
