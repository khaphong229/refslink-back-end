import * as shortenLinkRankingService from '@/app/services/client/shorten-link-ranking.service'

export const getShortenLinksRanking = async (req, res) => {
    const { sortBy = 'click_count', limit = 10 } = req.query
    const data = await shortenLinkRankingService.getShortenLinksRanking({ sortBy, limit })
    res.status(200).jsonify(data)
} 