import { generateTokenAPI } from '@/utils/generateAlias'
import ShortenTool from '@/models/client/shorten-tool'
import * as shortenLinkService from '@/app/services/client/shorten-link.service'

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
            const data = await shortenLinkService.create(req.body, req)
            results.push({
                message: 'success',
                data: data,
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
