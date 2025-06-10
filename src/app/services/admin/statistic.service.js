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


export function fillMissingMonths(stats, from, to) {
    const start = from ? new Date(from + '-01') : (stats[0]?._id ? new Date(stats[0]._id + '-01') : new Date())
    const end = to ? new Date(to + '-01') : (stats[stats.length-1]?._id ? new Date(stats[stats.length-1]._id + '-01') : new Date())
    const result = []
    const current = new Date(start.getFullYear(), start.getMonth(), 1)
    const last = new Date(end.getFullYear(), end.getMonth(), 1)
    const statsMap = Object.fromEntries(stats.map(item => [item._id, item.count]))
    while (current <= last) {
        const key = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2, '0')}`
        result.push({ _id: key, count: statsMap[key] || 0 })
        current.setMonth(current.getMonth() + 1)
    }
    return result
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
    stats = await fillMissingMonths(stats, from, to)
    return { data: stats }
}

export async function getUserStatisticsByDate({ from, to }) {
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
    stats = await fillMissingMonths(stats, from, to)
    return { data: stats }
}

export async function getDashboardSummary() {
    // Tổng view: tổng số click của tất cả link
    const totalView = await ShortenLink.aggregate([
        { $group: { _id: null, total: { $sum: '$click_count' } } }
    ])
    // Số lượng người dùng
    const totalUsers = await User.countDocuments({})
    // Referral Earnings: tổng earned_amount từ tất cả link (giả sử có trường này, nếu không có thì cần sửa lại)
    const referralEarnings = await ShortenLink.aggregate([
        { $group: { _id: null, total: { $sum: '$earned_amount' } } }
    ])
    // Average CPM: trung bình CPM của tất cả link (giả sử có trường này, nếu không có thì cần sửa lại)
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
