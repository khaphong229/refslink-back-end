import { generateTokenAPI } from '@/utils/generateAlias'
import ShortenTool from '@/models/client/shorten-tool'
import * as shortenLinkService from '@/app/services/client/shorten-link.service'
import { pick } from 'lodash'

export async function getOrCreateToken(userId) {
    let tool = await ShortenTool.findOne({ user_id: userId })

    if (!tool) {
        const token = generateTokenAPI()
        tool = new ShortenTool({
            user_id: userId,
            token: token,
        })
        await tool.save()
    }

    return tool.token
}

export async function shortenUrl(req) {
    const token = req.token
    const tool = await ShortenTool.findOne({ token })

    if (!tool) {
        throw new Error('Invalid API token')
    }

    const data = await shortenLinkService.create(req.body, req)

    return data
}

export async function shortenBulkUrls(req, res, urls) {
    const results = []
    for (const url of urls) {
        try {
            req.body.original_link = url
            const data = await shortenLinkService.create(req.body, req)
            const filteredData = pick(data, ['_id', 'alias', 'shorten_link', 'created_at', 'updated_at'])
            results.push({
                message: 'success',
                data: filteredData,
            })
        } catch (error) {
            results.push({
                message: 'error',
                original_link: url,
                error: error.message || 'Failed to shorten link',
            })
        }
    }

    return results
}

// export async function fullPageScriptHandler(req, token) {
//     try {
//         const apiToken = req.currentUser.api_token
//         if (!apiToken) {
//             return res.status(404).json({ success: false, message: 'No API token found for this user' })
//         }
//         const urls = []

//         const response = await shortenBulkUrls(req, token,)

//         res.json(response.data)
//     } catch (err) {
//         res.status(500).json({ success: false, message: err.message })
//     }
// }
