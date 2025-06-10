import * as shortenLinkRankingUserService from '@/app/services/client/shorten-link-ranking.client.service'

export const getShortenLinksRankingUser = async (req, res) => {
    const { sortBy = 'click_count', limit = 10 } = req.query
    const user_id = req.currentUser._id
    const data = await shortenLinkRankingUserService.getShortenLinksRankingUser({ user_id, sortBy, limit })
    res.status(200).json({
        status: 200,
        success: true,
        message: 'OK',
        data: {
            total: data.length,
            data: data
        }
    })
} 