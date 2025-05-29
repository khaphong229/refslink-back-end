import { generateTokenAPI } from '@/utils/generateAlias'
import ShortenTool from '@/models/client/shorten-tool'
import ShortenLink from '@/models/client/shorten-link'
import { pick } from 'lodash'
import * as shortenLinkService from '@/app/services/client/shorten-link.service'
import * as shortenLinkMiddleware from '@/app/middleware/common/client/shorten-link.middleware'

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

export async function shortenBulkUrls(req, token, urls) {
    const tool = await ShortenTool.findOne({ token })

    if (!tool) {
        throw new Error('Invalid API token')
    }

    const results = []
    for (const url of urls) {
        try {
            req.body.original_link = url
            if (await shortenLinkMiddleware.checkValidLink(url)) {
                
                let data = await ShortenLink.findOne({original_link : url, user_id : req.currentUser.id})
                if (!data) {
                    data = await shortenLinkService.create(req.body, req)
                    console.log(req.body.alias)
                }

                const filteredData = pick(data, ['_id', 'alias', 'shorten_link', 'created_at', 'updated_at'])
                results.push({
                    message: 'success',
                    data: filteredData,
                })
            } else {
                results.push({
                    message: 'error',
                    original_link: url,
                    error: 'Link vi phạm chính sách cộng đồng',
                })
            }
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
