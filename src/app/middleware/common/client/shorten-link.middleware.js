import ApiWebs from '@/models/client/api-webs'
import ShortenLink from '@/models/client/shorten-link'
import { abort } from '@/utils/helpers'
import { isValidObjectId } from 'mongoose'
const fetch = require('node-fetch')

export async function checkShortenLink(req, res, next) {
    const { original_link: url } = req.body
    if (!url) abort(404, 'Vui lòng nhập link cần rút gọn.')
    const result = await ShortenLink.findOne({ original_link: url })

    if (result) {
        abort(404, 'Link đã được rút gọn.')
    } else {
        console.log('check ok')
        next()
        return
    }
}

export async function getApiWebActive(req, res, next) {
    const user = req.currentUser
    const user_id = user._id
    if (!user_id) return abort(404, 'Lỗi tìm kiếm api web đang hoạt động.')
    let data = await ApiWebs.find({ user_id: user_id, status: 'active' })
    if (!data || data.length === 0) {
        return abort(404, 'Không tìm thấy api web nào đang hoạt động.')
    }

    data = data.sort((a, b) => a.priority - b.priority)
    req.apiWebActive = data[0]
    console.log('get ok')

    next()
    return
}

export async function shortenLink(api_url, root_link) {
    const url = `${api_url}${root_link}`

    try {
        const response = await fetch(url)
        const result = await response.json()

        if (result.status !== 'success') {
            abort(404, result.message)
            return null
        } else {
            return result.shortenedUrl
        }
    } catch (error) {
        abort(404, error)
        return null
    }
}

export async function checkId(req, res, next) {
    if (isValidObjectId(req.params.id)) {
        const data = await ShortenLink.findOne({ _id: req.params.id })
        if (data) {
            req.data = data
            next()
            return
        }
    }
    abort(404, 'Link rút gọn không tồn tại')
}

export async function checkShortenLinkDelete(req, res, next) {
    let data = null

    if (req.params.id) {
        try {
            data = await ShortenLink.find({ _id: req.params.id})
            console.log(data)
        } catch (error) {
            console.error('Error while finding shorten link:', error)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    if (data) {
        req.data = data
        return next()
    } else {
        return res.status(404).json({ message: 'Link rút gọn không tồn tại' })
    }
}
