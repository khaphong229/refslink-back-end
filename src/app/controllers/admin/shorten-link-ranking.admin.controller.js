import * as shortenLinkRankingAdminService from '@/app/services/admin/shorten-link-ranking.admin.service'

export const getShortenLinksRankingAdmin = async (req, res) => {
    const { sortBy = 'click_count', limit = 10 } = req.query
    const data = await shortenLinkRankingAdminService.getShortenLinksRankingAdmin({ sortBy, limit })
    res.status(200).jsonify(data)
} 