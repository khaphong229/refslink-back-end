import ShortenTool from '@/models/client/shorten-tool'
import User from '@/models/client/user'

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

    next()
}

export async function validateBulkShortenRequest(req, res, next) {
    const { token, urls } = req.body

    if (!token || !urls || !Array.isArray(urls)) {
        return res.status(400).json({
            success: false,
            message: 'API token and array of URLs are required',
        })
    }

    try {
        const data = await ShortenTool.findOne({ token })

        if (!data) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy ShortenTool với token này',
            })
        }

        const user = await User.findOne({ _id: data.user_id })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy user tương ứng với token',
            })
        }

        req.currentUser = user
        next()
    } catch (err) {
        console.error('Lỗi khi truy vấn ShortenTool hoặc User:', err.message)
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi nội bộ server',
            error: err.message,
        })
    }
}
