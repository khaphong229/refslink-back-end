import { shortenLink } from '@/app/middleware/common/client/shorten-link.middleware'
import ShortenLink from '@/models/client/shorten-link'
import aqp from 'api-query-params'
import { generateAlias } from '@/utils/generateAlias'
import { APP_URL_CLIENT } from '@/configs'
import ApiWebs from '@/models/client/api-webs'
import ClickLog from '@/models/client/click-log'
// import QRCode from 'qrcode'

const geoip = require('geoip-lite')

export async function create(body, req) {
    const user_id = req.currentUser._id
    const alias = !body.alias ? generateAlias() : body.alias
    const apiWeb = req.apiWebActive

    let third_party_link = ''
    let shorten_link = ''
    if (apiWeb !== null) {
        third_party_link = await shortenLink(apiWeb.api_url, body.original_link)
        shorten_link = `${APP_URL_CLIENT}/st/${alias}`
        body.api_web_id = apiWeb._id
    } else {
        shorten_link = `${APP_URL_CLIENT}/st/${alias}`
    }

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


    if (queryFilter?.status) {
        searchConditions.status = queryFilter.status
        delete queryFilter.status
    } else {
        searchConditions.status = 'active'
    }

    if (queryFilter?.startDate || queryFilter?.endDate) {
        searchConditions.created_at = {}
        if (queryFilter.startDate) {
            searchConditions.created_at.$gte = new Date(queryFilter.startDate)
        }
        if (queryFilter.endDate) {
            searchConditions.created_at.$lte = new Date(queryFilter.endDate)
        }
        delete queryFilter.startDate
        delete queryFilter.endDate
    }

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

// ...existing code...

export async function goLink({ alias, user_id, ip, country, device, browser, referer }) {
    const dataLink = await ShortenLink.findOne({ alias: alias })
    if (!dataLink) return null

    await ClickLog.create({
        link_id: dataLink._id,
        user_id: user_id || dataLink.user_id || null,
        ip,
        country,
        device,
        browser,
        referer,
        is_valid: true,
        earned_amount: 0,
        created_at: new Date()
    })

    if (dataLink.api_web_id) {
        const apiWeb = await ApiWebs.findById(dataLink.api_web_id).select('name_api description').lean()
        return {
            link: dataLink.third_party_link,
            name: apiWeb.name_api,
            description: apiWeb.description,
        }
    }
    return {
        link: dataLink.original_link,
        name: '',
    }
}

export async function goLinkValid(body, req) {
    const alias = body.alias
    console.log(alias)
    if (!alias) return { success: false, message: 'Alias is required' }

    const dataLink = await ShortenLink.findOne({ alias: alias })
    if (!dataLink) return { success: false, message: 'Not found' }

    let userCountry = req.headers['x-country-code'] || null


    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress
    console.log('IP Address:', ip)
    const geo = geoip.lookup(ip)
    userCountry = geo ? geo.country : null
    
    console.log('User Country:', userCountry)

    let apiWeb = null
    if (dataLink.api_web_id) {
        apiWeb = await ApiWebs.findById(dataLink.api_web_id)

        if (Array.isArray(apiWeb.country_uses) && apiWeb.country_uses.length > 0) {
            if (!userCountry || !apiWeb.country_uses.includes(userCountry)) {
                return { success: false, message: 'Quốc gia không được phép truy cập API này!' }
            }
        }
    }


    await ShortenLink.findByIdAndUpdate(dataLink._id, {
        $set: {
            click_count: (dataLink.click_count || 0) + 1,
            valid_clicks: (dataLink.valid_clicks || 0) + 1,
        },
        $inc: { current_view: 1 }
    })


    if (apiWeb) {
      
        await ApiWebs.findByIdAndUpdate(dataLink.api_web_id, { $inc: { current_view: 1 } })
        const apiWebLatest = await ApiWebs.findById(dataLink.api_web_id)

        if (!dataLink.api_used_list || !dataLink.api_used_list.some(id => id.equals(apiWeb._id))) {
            await ShortenLink.findByIdAndUpdate(dataLink._id, {
                $addToSet: { api_used_list: apiWeb._id }
            })
        }
        if (typeof apiWebLatest.max_view === 'number' && typeof apiWebLatest.current_view === 'number' && apiWebLatest.current_view > apiWebLatest.max_view) {
 
            const user_id = dataLink.user_id
            const now = new Date()

            let apiList = await ApiWebs.find({ user_id, status: 'active' })
            apiList = apiList.filter(api => {
                if (api._id.equals(apiWeb._id)) return false
                if (dataLink.api_used_list && dataLink.api_used_list.some(id => id.equals(api._id))) return false
                if (typeof api.max_view === 'number' && typeof api.current_view === 'number' && api.current_view >= api.max_view) return false
                if (api.timer && api.timer_start && api.timer_end) {
                    if (!(now >= api.timer_start && now <= api.timer_end)) return false
                }
                if (Array.isArray(api.country_uses) && api.country_uses.length > 0 && userCountry) {
                    if (!api.country_uses.includes(userCountry)) return false
                }
                return true
            })
            if (apiList.length > 0) {
                apiList = apiList.sort((a, b) => a.priority - b.priority)
                const newApi = apiList[0]
                const newThirdPartyLink = dataLink.original_link ? await shortenLink(newApi.api_url, dataLink.original_link) : ''
                await ShortenLink.findByIdAndUpdate(dataLink._id, {
                    api_web_id: newApi._id,
                    third_party_link: newThirdPartyLink,
                    $addToSet: { api_used_list: newApi._id }
                })
                await ApiWebs.findByIdAndUpdate(newApi._id, { $inc: { current_view: 1 } })
                return {
                    success: true,
                    link: newThirdPartyLink,
                    name: newApi.name_api,
                    description: newApi.description,
                }
            } else {
                return {
                    success: true,
                    link: dataLink.original_link,
                    name: '',
                    description: '',
                }
            }
        }

        return {
            success: true,
            link: dataLink.third_party_link || dataLink.original_link,
            name: apiWebLatest ? apiWebLatest.name_api : '',
            description: apiWebLatest ? apiWebLatest.description : '',
        }
    }

    return {
        success: true,
        link: dataLink.third_party_link || dataLink.original_link,
        name: apiWeb ? apiWeb.name_api : '',
        description: apiWeb ? apiWeb.description : '',
    }
}
