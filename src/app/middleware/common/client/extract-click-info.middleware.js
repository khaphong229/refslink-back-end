import geoip from 'geoip-lite'

function extractClickInfo(req, res, next) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection?.remoteAddress || ''
    let country = req.headers['x-country-code'] || ''
    if (!country && ip) {
        const geo = geoip.lookup(ip)
        country = geo?.country || ''
    }
    const referer = req.headers['referer'] || req.headers['referrer'] || ''
    let device = ''
    let browser = ''
    const ua = req.headers['user-agent'] || ''
    if (ua) {
        if (/mobile/i.test(ua)) device = 'mobile'
        else if (/tablet/i.test(ua)) device = 'tablet'
        else device = 'desktop'
        if (/chrome/i.test(ua)) browser = 'chrome'
        else if (/firefox/i.test(ua)) browser = 'firefox'
        else if (/safari/i.test(ua)) browser = 'safari'
        else if (/edge/i.test(ua)) browser = 'edge'
        else if (/msie|trident/i.test(ua)) browser = 'ie'
        else browser = 'other'
    }
    req.clickInfo = { ip, country, device, browser, referer }
    next()
}

export default extractClickInfo
