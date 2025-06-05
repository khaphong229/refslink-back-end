import ShortenTool from '@/models/client/shorten-tool'
import User from '@/models/client/user'
import * as shortenLinkMiddleWare from '@/app/middleware/common/client/shorten-link.middleware'
import { abort } from '@/utils/helpers'

export async function validateGetTokenRequest(req, res, next) {
    const userId = req.currentUser?._id

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: user not found in request',
        })
    }

    const existingTool = await ShortenTool.findOne({ user_id: userId })

    if (existingTool) {
        return res.status(200).json({
            success: true,
            token: existingTool.token,
        })
    }

    next()
}

export async function validateShortenToolRequest(req, res, next) {
    const { token, url } = req.query

    if (!token || !url) {
        return res.status(400).json({
            success: false,
            message: 'API token and URL are required',
        })
    }

    const data = await ShortenTool.findOne({ token })
    if (!data) {
        return res.status(401).json({
            success: false,
            message: 'Invalid API token',
        })
    }

    const user = await User.findById(data.user_id)
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found for this token',
        })
    }

    req.currentUser = user
    req.body.original_link = url
    req.token = token

    return await shortenLinkMiddleWare.checkShortenLink(req, res, next)
}

export function validateBulkShortenRequest(req, res, next) {
    const { urls } = req.body

    if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({
            success: false,
            message: 'API token and array of URLs are required',
        })
    }
    next()
}

export async function validateDevelopApi(req, res, next) {
    const { api, url, alias } = req.query

    if (!api || !url || !alias) {
        abort(404, 'Vui lòng nhập đầy đủ tham số.')
    }

    const data = await ShortenTool.findOne({ token: api })
    if (!data) {
        abort(404, 'API không hợp lệ.')
    }

    const user = await User.findById(data.user_id)
    if (!user) {
        abort(404, 'Người dùng không tồn tại')
    }

    req.currentUser = user
    req.data = { api, url, alias }
    req.body.original_link = url

    return await shortenLinkMiddleWare.checkShortenLink(req, res, next)
}
