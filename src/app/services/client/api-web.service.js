import ApiWebs from '@/models/client/api-webs'
import aqp from 'api-query-params'

export const filter = async (queryParams, limit, current) => {
    let {filter, sort} = aqp(queryParams)
    console.log(filter)
    delete filter.limit
    delete filter.current

    let {q} = filter
    if (q) {
        q = q ? {$regex: q, $option: 'i'} : null
        filter = {
            ...(q && {$or: [{name_api: q}, {api_url: q}]}),
        }
    }
    if (isNaN(current) || current <= 0 || !Number.isInteger(current)) current = 1
    if (isNaN(limit) || limit <= 0 || !Number.isInteger(limit)) limit = 10
    if (!sort) sort = {created_at: -1}
    const data = await ApiWebs.find(filter)
        .skip((current - 1) * limit)
        .limit(limit)
        .sort(sort)
    const total = await ApiWebs.countDocuments(filter)
    return {total, current, limit, data}
}

export const create = async (body, req) => {
    const user_id = req.currentUser._id
    body.user_id = user_id
    const data = new ApiWebs(body)
    await data.save()
    return data
}
