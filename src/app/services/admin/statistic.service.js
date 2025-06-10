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

function fillAllMonthsInYear(stats, year) {
    const result = []
    const statsMap = Object.fromEntries(stats.map(item => [item._id, item.count]))
    for (let m = 1; m <= 12; m++) {
        const key = `${year}-${String(m).padStart(2, '0')}`
        result.push({ _id: key, count: statsMap[key] || 0 })
    }
    return result
}

export async function getLinkStatisticsByDate() {
    const match = {}

    const now = new Date()
    const currentYear = now.getFullYear()
    const from = `${currentYear}-01`
    const to = `${currentYear}-12`
    match.created_at = { $gte: new Date(from) }
    const toDate = new Date(to)
    match.created_at.$lte = toDate
    let stats = await ShortenLink.aggregate([
        { $match: match },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m', date: '$created_at' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ])
    stats = fillAllMonthsInYear(stats, currentYear)
    return { data: stats }
}

export async function getUserStatisticsByDate() {
    const match = {}

    const now = new Date()
    const currentYear = now.getFullYear()
    const from = `${currentYear}-01`
    const to = `${currentYear}-12`
    match.created_at = { $gte: new Date(from) }
    const toDate = new Date(to)
    match.created_at.$lte = toDate
    let stats = await User.aggregate([
        { $match: match },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m', date: '$created_at' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ])
    stats = fillAllMonthsInYear(stats, currentYear)
    return { data: stats }
}

export async function getDashboardSummary() {

    const totalView = await ShortenLink.aggregate([
        { $group: { _id: null, total: { $sum: '$click_count' } } }
    ])

    const totalUsers = await User.countDocuments({})

    const referralEarnings = await ShortenLink.aggregate([
        { $group: { _id: null, total: { $sum: '$earned_amount' } } }
    ])

    const avgCPM = await ShortenLink.aggregate([
        { $group: { _id: null, avg: { $avg: '$cpm' } } }
    ])
    return {
        totalView: totalView[0]?.total || 0,
        totalUsers,
        referralEarnings: referralEarnings[0]?.total || 0,
        averageCPM: avgCPM[0]?.avg || 0
    }
}
