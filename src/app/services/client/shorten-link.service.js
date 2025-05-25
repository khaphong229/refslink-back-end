import { shortenLink } from '@/app/middleware/common/client/shorten-link.middleware'
import ShortenLink from '@/models/client/shorten-link'
import aqp from 'api-query-params'
import { generateAlias } from '@/utils/generateAlias'
import { APP_URL_CLIENT } from '@/configs'

export async function create(body, req) {
    const user_id = req.currentUser._id
    const alias = !body.alias ? generateAlias() : body.alias
    const apiWeb = req.apiWebActive

    let third_party_link = ''
    let shorten_link = ''
    if (apiWeb !== null) {
        third_party_link = await shortenLink(apiWeb.api_url, body.original_link)
        shorten_link = `${APP_URL_CLIENT}/${alias}`
    } else {
        shorten_link = `${APP_URL_CLIENT}/${alias}`
    }
    body.api_web_id = apiWeb !== null ? apiWeb._id : ''
    body.user_id = user_id
    body.shorten_link = shorten_link
    body.third_party_link = third_party_link
    body.alias = alias
    const data = new ShortenLink(body)
    await data.save()
    return data
}

export async function getAll(queryParams, req) {
    const user_id = req.currentUser._id

    const { filter: queryFilter, sort: querySort = { created_at: -1 } } = aqp(queryParams)
    const searchConditions = { user_id }
    const limit = queryFilter?.limit || 10
    const page = queryFilter?.page || 1

    if (queryFilter && Object.keys(queryFilter).length > 0) {
        if (queryFilter.q) {
            const searchValue = queryFilter.q
            delete queryFilter.limit
            delete queryFilter.page
            delete queryFilter.q

            searchConditions.$or = [
                { alias: { $regex: searchValue, $options: 'i' } },
                { title: { $regex: searchValue, $options: 'i' } },
                { original_link: { $regex: searchValue, $options: 'i' } },
                { shorten_link: { $regex: searchValue, $options: 'i' } },
            ]
        }

        Object.entries(queryFilter).forEach(([key, value]) => {
            if (!['limit', 'page'].includes(key)) {
                searchConditions[key] = typeof value === 'string' ? { $regex: value, $options: 'i' } : value
            }
        })
    }

    const [data, total] = await Promise.all([
        ShortenLink.find(searchConditions)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort(querySort)
            .lean(),
        ShortenLink.countDocuments(searchConditions),
    ])

    return { total, page, limit, data }
}

export async function getById(id) {
    const data = await ShortenLink.findOne({ _id: id })
    if (!data) return null
    return data
}

export async function hiddenLink(body, data) {
    data.status = 'inactive'
    await data.save()
    return data
}

export async function getByAtlas(alias) {
    return await ShortenLink.findOne({ alias: alias })
}

export async function deleteByID(id, req) {
    const data = await ShortenLink.findOneAndDelete({ _id: id, user_id: req.currentUser._id })
    return data
}
