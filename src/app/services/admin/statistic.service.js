import { User } from '@/models'
import ShortenLink from '@/models/client/shorten-link'

export async function getUserStatistics() {
    const totalUsers = await User.countDocuments({})
    const activeUsers = await User.countDocuments({ status: 'active' })
    const inactiveUsers = await User.countDocuments({ status: { $ne: 'active' } })
    return { totalUsers, activeUsers, inactiveUsers }
}

export async function getLinkStatistics() {
    const totalLinks = await ShortenLink.countDocuments({})
    const activeLinks = await ShortenLink.countDocuments({ status: 'active' })
    const inactiveLinks = await ShortenLink.countDocuments({ status: { $ne: 'active' } })
    return { totalLinks, activeLinks, inactiveLinks }
}

export async function getLinkStatisticsByDate({ from, to }) {
    const match = {}
    if (from) match.created_at = { $gte: new Date(from) }
    if (to) {
        if (!match.created_at) match.created_at = {}
        const toDate = new Date(to)
        if (typeof to === 'string' && to.length === 10) {
            toDate.setDate(toDate.getDate() + 1)
            toDate.setMilliseconds(toDate.getMilliseconds() - 1)
        }
        match.created_at.$lte = toDate
    }
    const stats = await ShortenLink.aggregate([
        { $match: match },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ])
    return { data: stats }
}
