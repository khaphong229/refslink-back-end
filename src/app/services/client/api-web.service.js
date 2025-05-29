import ApiWebs from '@/models/client/api-webs'
import aqp from 'api-query-params'

export const filter = async (queryParams, limit = 10, page = 1, req) => {
    const user_id = req.currentUser._id
    const { filter: queryFilter, sort: querySort = { created_at: -1 } } = aqp(queryParams)
    const searchConditions = { user_id } // Add user_id filter by default

    // Chỉ tạo điều kiện tìm kiếm khi có query
    if (queryFilter && Object.keys(queryFilter).length > 0) {
        // Xử lý tìm kiếm với q
        if (queryFilter.q) {
            const searchValue = queryFilter.q
            delete queryFilter.q
            delete queryFilter.limit
            delete queryFilter.page

            searchConditions.$or = [
                { name_api: { $regex: searchValue, $options: 'i' } },
                { api_url: { $regex: searchValue, $options: 'i' } },
                { description: { $regex: searchValue, $options: 'i' } },
            ]
        }

        // Xử lý các điều kiện tìm kiếm khác
        Object.entries(queryFilter).forEach(([key, value]) => {
            if (!['limit', 'page'].includes(key)) {
                searchConditions[key] = typeof value === 'string' ? { $regex: value, $options: 'i' } : value
            }
        })
    }

    const [data, total] = await Promise.all([
        ApiWebs.find(searchConditions)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort(querySort)
            .lean(),
        ApiWebs.countDocuments(searchConditions),
    ])

    return { total, page, limit, data }
}

export const create = async (body, req) => {
    const user_id = req.currentUser._id
    body.user_id = user_id
    const match = body.api_url.match(/^https?:\/\/([^./]+)\./)
    body.name_api = match ? match[1] : null

    if (body.timer_start) {
        const [hours, minutes, seconds] = body.timer_start.split(':')
        const date = new Date()
        date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds))
        body.timer_start = date
    }
    if (body.timer_end) {
        const [hours, minutes, seconds] = body.timer_end.split(':')
        const date = new Date()
        date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds))
        body.timer_end = date
    }

    const data = new ApiWebs(body)
    await data.save()
    return data
}

export const detail = async (id) => {
    const data = await ApiWebs.findOne({ _id: id })
    if (!data) return null
    return data
}

export const deleted = async (id) => {
    const res = await ApiWebs.findByIdAndDelete(id)
    return res
}

export const update = async (data, body) => {
    data.api_url = body.api_url
    data.max_view = body.max_view
    data.min_view = body.min_view
    data.priority = body.priority
    data.price_per_view = body.price_per_view
    data.description = body.description
    data.timer = body.timer
    data.timer_duration = body.timer_duration

    // Convert time strings to Date objects if they exist
    if (body.timer_start) {
        const [hours, minutes, seconds] = body.timer_start.split(':')
        const date = new Date()
        date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds))
        data.timer_start = date
    }
    if (body.timer_end) {
        const [hours, minutes, seconds] = body.timer_end.split(':')
        const date = new Date()
        date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds))
        data.timer_end = date
    }

    data.country_uses = body.country_uses
    data.allowed_domains = body.allowed_domains
    data.blocked_domains = body.blocked_domains
    data.block_vpn = body.block_vpn
    data.status = body.status
    await data.save()
    return data
}

export const changeStatus = async (data, body) => {
    data.status = body.status
    await data.save()
    return data
}
