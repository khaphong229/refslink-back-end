import ApiWebs from '@/models/client/api-webs'
import ShortenLink from '@/models/client/shorten-link'
import { abort } from '@/utils/helpers'
import { pick } from 'lodash'
import { isValidObjectId } from 'mongoose'
const fetch = require('node-fetch')

const ADULT_KEYWORDS = [
    'sex',
    'porn',
    'xxx',
    '18+',
    'nude',
    'hentai',
    'jav',
    'erotic',
    'camgirl',
    'fetish',
    'bdsm',
    'anal',
    'lesbian',
    'gay',
    'shemale',
    'escort',
    'adult',
    'amateur',
    'blowjob',
    'boobs',
    'cum',
    'dildo',
    'milf',
    'pussy',
    'strip',
    'threesome',
    'voyeur',
    'webcam',
    'hardcore',
    'incest',
    'loli',
    'nsfw',
    'playboy',
    'masturbate',
    'orgy',
    'rape',
    'slut',
    'spank',
    'taboo',
    'teens',
    'tits',
    'virgin',
    'whore',
    'sexcam',
    'sexchat',
    'rule34',
    'onlyfans',
    'fansly',
    'livejasmin',
    'chatroulette',
    'xvid',
    'brazzers',
    'bangbros',
    'youjizz',
    'naked',
    'wet',
    'fleshlight',
    'fap',
    'moan',
    'dp',
    'gag',
    'deepthroat',

    's3x',
    'pron',
    'pr0n',
    'fck',
    'n4ked',
    'nsf*w',
    'bo0bs',
    'c*m',
    'l3sbian',
    'd1ldo',

    'redtube',
    'xvideos',
    'xnxx',
    'xhamster',
    'pornhub',
    'youporn',
    'tnaflix',
    'spankbang',
    'hclips',
    'motherless',
    'efukt',
    'fuq',
    'eporner',
    'pervclips',
    '4tube',
    'drtuber',
    'porntube',
    'youporn',
    'tubegalore',
    'nudogram',

    'phim sex',
    'gái gọi',
    'gái xinh',
    'lộ hàng',
    'thủ dâm',
    'jav hd',
    'hiếp dâm',
    'dâm',
    'dâm đãng',
    's.e.x',
    'dịt',
    'bú',
    'chịch',
    'gái teen',
    'clip nóng',
    'clip sex',
    'gái 18',
    'mông',
    'ngực',
    'trai bao',
    'địt',

    'camsex',
    'nipple',
    'fingering',
    'granny sex',
    'panties',
    'bareback',
    'hump',
    'humpday',
    'bang',
    'bangbus',
    'fisting',
    'milking',
    'striptease',
]

function checkAdultContentUrl(url) {
    if (!url) return false
    const lowerUrl = url.toLowerCase()
    return ADULT_KEYWORDS.some((keyword) => lowerUrl.includes(keyword))
}

async function checkSafeBrowsing(url) {
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY
    const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`
    const body = {
        client: {
            clientId: 'refslink',
            clientVersion: '1.0',
        },
        threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
        },
    }

    const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()
    console.log(data)
    if (Array.isArray(data.matches) && data.matches.length > 0) {
        console.log('Threat detected!')
        return true
    } else {
        console.log('No threat detected.')
        return false
    }
}

export async function checkValidLink(url) {
    if (!url) return false

    const isAdult = checkAdultContentUrl(url)
    let isUnsafe = false

    try {
        isUnsafe = await checkSafeBrowsing(url)
    } catch (err) {
        console.error('SafeBrowsing check failed:', err)
    }
    console.log(`url 18+' : ${isAdult}`)
    if (isAdult || isUnsafe) {
        console.log(`URL nguy hiểm hoặc chứa nội dung 18+: ${url}`)
        return false
    }

    return true
}

export async function checkShortenLink(req, res, next, type = null) {
    // Handle mutiple URL case
    if (type === 'multiple') {
        const urls = req.body.urls
        if (!urls || !Array.isArray(urls)) {
            return res.status(400).json({
                success: false,
                message: 'Array of URLs is required',
            })
        }

        const results = await Promise.all(
            urls.map(async (url) => {
                if (!(await checkValidLink(url))) {
                    return {
                        url,
                        error: 'Link chứa nội dung vi phạm chính sách cộng đồng, không được phép rút gọn.',
                    }
                }
                const result = await ShortenLink.findOne({ original_link: url, user_id: req.currentUser._id })
                if (result) {
                    return {
                        url,
                        exists: true,
                        data: pick(result, ['_id', 'alias', 'shorten_link', 'created_at', 'updated_at']),
                    }
                }
                return { url, exists: false }
            })
        )

        const invalidUrls = results.filter((r) => r.error)
        if (invalidUrls.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Link chứa nội dung vi phạm chính sách cộng đồng, không được phép rút gọn.',
                invalidUrls,
            })
        }

        if (results.every((r) => r.exists)) {
            return res.status(201).json({
                status: 201,
                success: true,
                message: 'Created',
                data: results.map((r) => ({
                    message: 'success',
                    data: r.data,
                })),
            })
        }

        req.existingUrls = results
        req.type = 'mutiple'
        return next()
    }

    // Handle single URL case
    const { original_link: url } = req.body
    if (!url) abort(404, 'Vui lòng nhập link cần rút gọn.')

    const result = await ShortenLink.findOne({ original_link: url, user_id: req.currentUser._id })

    if (!(await checkValidLink(url))) {
        abort(404, 'Link chứa nội dung vi phạm chính sách cộng đồng, không được phép rút gọn.')
    }

    if (result) {
        const filteredData = pick(result, ['_id', 'alias', 'shorten_link', 'created_at', 'updated_at'])
        res.status(201).jsonify(filteredData)
        return
    } else {
        next()
        return
    }
}

export async function getApiWebActive(req, res, next) {
    const user = req.currentUser
    const user_id = user._id
    if (!user_id) return abort(404, 'Lỗi tìm kiếm api web đang hoạt động.')
    let data = await ApiWebs.find({ user_id: user_id, status: 'active' })
    if (!data || data.length === 0) {
        req.apiWebActive = null
        next()
        return
    }

    const now = new Date()
    data = data.filter((api) => {
        if (
            typeof api.max_view === 'number' &&
            typeof api.current_view === 'number' &&
            api.current_view >= api.max_view
        )
            return false

        if (api.timer && api.timer_start && api.timer_end) {
            if (!(now >= api.timer_start && now <= api.timer_end)) return false
        }
        return true
    })

    if (!data || data.length === 0) {
        req.apiWebActive = null
        next()
        return
    }

    data = data.sort((a, b) => a.priority - b.priority)
    req.apiWebActive = data[0]
    next()
    return
}

export function shortenLink(api_url, root_link) {
    const url = `${api_url}${root_link}`
    return url
}

export async function checkId(req, res, next) {
    if (isValidObjectId(req.params.id)) {
        const data = await ShortenLink.findOne({ _id: req.params.id })
        if (data) {
            req.data = data
            next()
            return
        }
    }
    abort(404, 'Link rút gọn không tồn tại')
}

export async function checkShortenLinkDelete(req, res, next) {
    let data = null

    if (req.params.id) {
        try {
            data = await ShortenLink.find({ _id: req.params.id })
            console.log(data)
        } catch (error) {
            console.error('Error while finding shorten link:', error)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    if (data) {
        req.data = data
        return next()
    } else {
        return res.status(404).json({ message: 'Link rút gọn không tồn tại' })
    }
}
