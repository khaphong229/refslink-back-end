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

export const detail = async (id) => {
    const data = await ApiWebs.findOne({_id: id})
    if (!data) return null
    return data
}

export const deleted = async (id) => {
    const res = await ApiWebs.findByIdAndDelete(id)
    return res
}

export const update = async (data, body) => {
    console.log(data, '&&', body)

    data.name_api = body.name_api
    // data.user_id = body.user_id
    data.name_api = body.name_api
    data.api_url = body.api_url
    data.max_view = body.max_view
    data.min_view = body.min_view
    data.priority = body.priority
    data.price_per_view = body.price_per_view
    data.description = body.description
    data.timer = body.timer
    data.timer_duration = body.timer_duration
    data.timer_start = body.timer_start
    data.timer_end = body.timer_end
    data.country_uses = body.country_uses
    data.allowed_domains = body.allowed_domains
    data.blocked_domains = body.blocked_domains
    data.block_vpn = body.block_vpn
    data.status = body.status
    await data.save()
    return data
}
