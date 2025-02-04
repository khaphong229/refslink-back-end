import { shortenLink } from '@/app/middleware/common/client/shorten-link.middleware'
import ShortenLink from '@/models/client/shorten-link'
import aqp from 'api-query-params'

export async function create(body, req) {
    const user_id = req.currentUser._id
    const short_link = await shortenLink(req.apiWebActive.api_url, req.body.original_link)

    body.api_web_id = req.apiWebActive._id
    body.user_id = user_id
    body.shorten_link = short_link
    const data = new ShortenLink(body)
    await data.save()
    return data
}

export async function getAll(queryParams) {
    const { filter: queryFilter, sort: querySort = { created_at: -1 } } = aqp(queryParams)
    const searchConditions = {}
    const limit = queryFilter?.limit || 10
    const current = queryFilter?.current || 1

    if (queryFilter && Object.keys(queryFilter).length > 0) {
        if (queryFilter.q) {
            const searchValue = queryFilter.q
            delete queryFilter.limit
            delete queryFilter.current
            delete queryFilter.q

            searchConditions.$or = [
                { alias: { $regex: searchValue, $options: 'i' } },
                { title: { $regex: searchValue, $options: 'i' } },
                { original_link: { $regex: searchValue, $options: 'i' } },
                { shorten_link: { $regex: searchValue, $options: 'i' } },
            ]
        }

        Object.entries(queryFilter).forEach(([key, value]) => {
            if (!['limit', 'current'].includes(key)) {
                searchConditions[key] = typeof value === 'string' ? { $regex: value, $options: 'i' } : value
            }
        })
    }

    const [data, total] = await Promise.all([
        ShortenLink.find(searchConditions)
            .skip((current - 1) * limit)
            .limit(limit)
            .sort(querySort)
            .lean(),
        ShortenLink.countDocuments(searchConditions),
    ])

    return { total, current, limit, data }
}

export async function getById(id, req) {
    const data = await ShortenLink.findOne({ _id: id })
    if (!data) return null
    return data
}

export async function hiddenLink(body, data) {
    data.status = 'inactive'
    await data.save()
    return data
}
