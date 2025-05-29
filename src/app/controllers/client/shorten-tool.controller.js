import * as ShortenToolService from '@/app/services/client/shorten-tool.service'

export async function getOrCreateToken(req, res) {
    try {
        const user_id = req.currentUser._id
        const token = await ShortenToolService.getOrCreateToken(user_id)
        res.status(201).jsonify(token)
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export async function shortenUrl(req, res) {
    try {
        const { token, url } = req.query

        if (!token || !url) {
            return res.status(400).json({
                success: false,
                message: 'API token and URL are required',
            })
        }

        const results = await ShortenToolService.shortenUrl(req)
        res.status(201).jsonify(results)
    } catch (error) {
        res.status(500).jsonify(error)
    }
}

export async function shortenBulkUrls(req, res) {
    try {
        const token = req.body.token
        const urls = req.body.urls

        if (!token || !urls || !Array.isArray(urls)) {
            return res.status(400).json({
                success: false,
                message: 'API token and array of URLs are required',
            })
        }

        const results = await ShortenToolService.shortenBulkUrls(req, token, urls)

        res.status(201).jsonify(results)
    } catch (error) {
        res.status(500).jsonify(error)
    }
}

// export function fullPageScriptHandler(req, res) {
//     try {
//         const apiToken = req.currentUser.api_token
//         if (!apiToken) {
//             return res.status(404).json({ success: false, message: 'No API token found for this user' })
//         }
//     } catch (err) {
//         res.status(500).json({ success: false, message: err.message })
//     }
// }
