import ShortenLink from '@/models/client/shorten-link'

export async function getShortenLinksRankingUser({ user_id, sortBy = 'click_count', limit = 10 } = {}) {
    const validSorts = ['click_count', 'valid_clicks', 'earned_amount']
    if (!validSorts.includes(sortBy)) sortBy = 'click_count'
    const data = await ShortenLink.find({ status: 'active', user_id })
        .sort({ [sortBy]: -1, updated_at: -1, _id: -1 })
        .limit(Number(limit))
        .lean()
    return data
}
