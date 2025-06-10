import * as ShortenToolService from '@/app/services/client/shorten-tool.service'
import { pick } from 'lodash'
import * as shortenLinkService from '@/app/services/client/shorten-link.service'

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

export async function shortenUrl(req, res, type = null) {
    try {
        const { token, url } = req.query

        if (!token || !url) {
            return res.status(400).json({
                success: false,
                message: 'API token and URL are required',
            })
        }

        const result = await ShortenToolService.shortenUrl(req)
        const filteredData = pick(result, ['_id', 'alias', 'shorten_link', 'created_at', 'updated_at'])
        if (type === null) {
            res.status(201).jsonify(filteredData)
        } else {
            res.redirect(result.shorten_link)
        }
    } catch (error) {
        res.status(500).jsonify(error)
    }
}

export async function shortenDevelopApi(req, res) {
    const result = await shortenLinkService.create(req.data, req)

    return res.json({
        status: 'success',
        shortenedUrl: result.shorten_link,
    })
}

export async function shortenBulkUrls(req, res) {
    try {
        const urls = req.body.urls

        if (!urls || !Array.isArray(urls)) {
            return res.status(400).json({
                success: false,
                message: 'Array of URLs is required',
            })
        }

        const existingUrls = req.existingUrls || []

        const urlsToShorten = urls.filter((url, index) => !existingUrls[index]?.exists)

        let results = []

        if (urlsToShorten.length > 0) {
            const newResults = await ShortenToolService.shortenBulkUrls(req, res, urlsToShorten)
            results = newResults.map((result) => result)
        }

        existingUrls.forEach((item) => {
            if (item.exists) {
                results.push({
                    message: 'success',
                    data: item.data,
                })
            }
        })

        res.status(201).json({
            status: 201,
            success: true,
            message: 'Created',
            data: results,
        })
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
