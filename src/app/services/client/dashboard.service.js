import ShortenLink from '@/models/client/shorten-link'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, startOfDay, endOfDay } from 'date-fns'
import ClickLog from '@/models/client/click-log'
import ReferralLog from '@/models/client/referral-log'
import { formatDecimal } from '@/utils/formatDecimal'
import { getCommissionSettings } from '../admin/commission.service'

function validateMonthYear(month, year) {
    if (isNaN(month) || isNaN(year)) {
        throw new Error('Tháng và năm bắt buộc là số')
    }
    if (month < 1 || month > 12) {
        throw new Error('Tháng phải nằm từ 1 đến 12')
    }
    if (year < 2000 || year > 2100) {
        throw new Error('Năm phải nằm từ 2000 đến 2100')
    }
}

// Hàm lấy thống kê tổng quan từ ClickLog
async function getClickStatistics(userId, startDate, endDate) {
    return await ClickLog.aggregate([
        {
            $match: {
                user_id: userId,
                created_at: { $gte: startDate, $lte: endDate },
                is_valid: true,
            },
        },
        {
            $group: {
                _id: null,
                total_valid_views: { $sum: 1 },
                total_earned_view: { $sum: '$earned_amount' },
            },
        },
    ])
}

// Hàm lấy thống kê tổng quan từ ReferralLog
async function getReferralStatistics(userId, startDate, endDate) {
    return await ReferralLog.aggregate([
        {
            $match: {
                user_id: userId,
                created_at: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: null,
                total_earned_referral: { $sum: '$earned_amount' },
            },
        },
    ])
}

// Hàm lấy thống kê chi tiết theo ngày từ ClickLog
async function getDailyClickStatistics(userId, startDate, endDate) {
    return await ClickLog.aggregate([
        {
            $match: {
                user_id: userId,
                created_at: { $gte: startDate, $lte: endDate },
                is_valid: true,
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                views: { $sum: 1 },
                income: { $sum: '$earned_amount' },
            },
        },
    ])
}

// Hàm lấy thống kê chi tiết theo ngày từ ReferralLog
async function getDailyReferralStatistics(userId, startDate, endDate) {
    return await ReferralLog.aggregate([
        {
            $match: {
                user_id: userId,
                created_at: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                referral_earnings: { $sum: '$earned_amount' },
            },
        },
    ])
}

// Hàm tạo dữ liệu cho biểu đồ
async function generateChartData(userId, days) {
    return await Promise.all(
        days.map(async (day) => {
            const dayStart = startOfDay(day)
            const dayEnd = endOfDay(day)

            const dayClickStats = await ClickLog.aggregate([
                {
                    $match: {
                        user_id: userId,
                        created_at: { $gte: dayStart, $lte: dayEnd },
                        is_valid: true,
                    },
                },
                {
                    $group: {
                        _id: null,
                        views: { $sum: 1 },
                        earned: { $sum: '$earned_amount' },
                    },
                },
            ])

            const dayReferralStats = await ReferralLog.aggregate([
                {
                    $match: {
                        user_id: userId,
                        created_at: { $gte: dayStart, $lte: dayEnd },
                    },
                },
                {
                    $group: {
                        _id: null,
                        referral_earnings: { $sum: '$earned_amount' },
                    },
                },
            ])

            return {
                date: format(day, 'yyyy-MM-dd'),
                views: dayClickStats[0]?.views || 0,
                earned: formatDecimal(dayClickStats[0]?.earned || 0),
                referral_earnings: formatDecimal(dayReferralStats[0]?.referral_earnings || 0),
            }
        })
    )
}

// Hàm tạo dữ liệu cho bảng
async function generateTableData(userId, days, startDate, endDate) {
    const dailyStats = {}
    days.forEach((day) => {
        const dayStr = format(day, 'yyyy-MM-dd')
        dailyStats[dayStr] = {
            date: dayStr,
            views: 0,
            income: 0,
            cpm: 0,
            referral_earnings: 0,
        }
    })

    const dailyClickStats = await getDailyClickStatistics(userId, startDate, endDate)
    const dailyReferralStats = await getDailyReferralStatistics(userId, startDate, endDate)

    dailyClickStats.forEach((stat) => {
        const dayStr = stat._id
        if (dailyStats[dayStr]) {
            dailyStats[dayStr].views = stat.views
            dailyStats[dayStr].income = formatDecimal(stat.income)
            dailyStats[dayStr].cpm = stat.views > 0 ? formatDecimal((stat.income / stat.views) * 1000) : 0
        }
    })

    dailyReferralStats.forEach((stat) => {
        const dayStr = stat._id
        if (dailyStats[dayStr]) {
            dailyStats[dayStr].referral_earnings = formatDecimal(stat.referral_earnings)
        }
    })

    return Object.values(dailyStats)
        .map((day) => ({
            ...day,
            income: formatDecimal(day.income),
            referral_earnings: formatDecimal(day.referral_earnings),
            total_earned: formatDecimal(day.income + day.referral_earnings),
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export async function getStatistics(req) {
    const { cpm } = await getCommissionSettings()

    const user_id = req.currentUser._id
    let { month, year } = req.query

    month = parseInt(month)
    year = parseInt(year)
    validateMonthYear(month, year)

    const startDate = startOfMonth(new Date(year, month - 1))
    const today = new Date()
    const endDate =
        today < endOfMonth(new Date(year, month - 1)) ? today : endOfMonth(new Date(year, month - 1))

    const [clickStats, referralStats] = await Promise.all([
        getClickStatistics(user_id, startDate, endDate),
        getReferralStatistics(user_id, startDate, endDate),
    ])

    const totalLinks = await ShortenLink.countDocuments({
        user_id,
        created_at: { $gte: startDate, $lte: endDate },
    })

    const totalEarnedView = clickStats[0]?.total_earned_view || 0
    const totalEarnedReferral = referralStats[0]?.total_earned_referral || 0
    const totalEarned = totalEarnedView + totalEarnedReferral

    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const [chartData, tableData] = await Promise.all([
        generateChartData(user_id, days),
        generateTableData(user_id, days, startDate, endDate),
    ])

    return {
        total_links: totalLinks,
        total_valid_views: clickStats[0]?.total_valid_views || 0,
        total_earned_view: formatDecimal(totalEarnedView),
        total_earned_referral: formatDecimal(totalEarnedReferral),
        total_earned: formatDecimal(totalEarned),
        rate: {
            cpm,
        },
        period: {
            month,
            year,
            start_date: startDate,
            end_date: endDate,
        },
        chart_data: chartData,
        table_data: tableData,
    }
}
