import ShortenLink from '@/models/client/shorten-link'

export async function getShortenLinksRanking({ sortBy = 'click_count', limit = 10 } = {}) {
    const validSorts = ['click_count', 'valid_clicks', 'earned_amount']
    if (!validSorts.includes(sortBy)) sortBy = 'click_count'
    const data = await ShortenLink.find({ status: 'active' })
        .sort({ [sortBy]: -1 })
        .limit(Number(limit))
        .lean()
    return data
} 