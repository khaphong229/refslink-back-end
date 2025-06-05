import ShortenLink from '@/models/client/shorten-link'
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns'
import { getCommissionSettings } from '../admin/commission.service'

export async function getStatistics(req) {
    const user_id = req.currentUser._id
    let { month, year } = req.query

    month = parseInt(month)
    year = parseInt(year)

    if (isNaN(month) || isNaN(year)) {
        throw new Error('Tháng và năm bắt buộc là số')
    }

    if (month < 1 || month > 12) {
        throw new Error('Tháng phải nằm từ 1 đến 12')
    }

    if (year < 2000 || year > 2100) {
        throw new Error('Năm phải nằm từ 2000 đến 2100')
    }

    const startDate = startOfMonth(new Date(year, month - 1))
    const today = new Date()
    const endDate =
        today < endOfMonth(new Date(year, month - 1)) ? today : endOfMonth(new Date(year, month - 1))

    const links = await ShortenLink.find({
        user_id,
        created_at: {
            $gte: startDate,
            $lte: endDate,
        },
    })

    const { cpm, ref_percent } = await getCommissionSettings()
    console.log(cpm, ref_percent)

    const totalViews = links.reduce((sum, link) => sum + (link.click_count || 0), 0)
    const totalValidViews = links.reduce((sum, link) => sum + (link.valid_clicks || 0), 0)
    const ratePerView = cpm / 1000 // cpm per 1000 views
    const totalEarned = totalValidViews * ratePerView

    // Tạo dữ liệu cho biểu đồ (theo ngày)
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const chartData = days.map((day) => {
        const dayLinks = links.filter(
            (link) => format(new Date(link.created_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        )
        const dayViews = dayLinks.reduce((sum, link) => sum + (link.click_count || 0), 0)
        const dayValidViews = dayLinks.reduce((sum, link) => sum + (link.valid_clicks || 0), 0)
        const dayEarned = dayValidViews * ratePerView

        return {
            date: format(day, 'yyyy-MM-dd'),
            views: dayViews,
            earned: parseFloat(dayEarned.toFixed(2)),
        }
    })

    // Tạo dữ liệu chi tiết cho bảng theo ngày
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

    // Tính toán thống kê cho từng ngày
    links.forEach((link) => {
        const dayStr = format(new Date(link.created_at), 'yyyy-MM-dd')
        if (dailyStats[dayStr]) {
            const views = link.click_count || 0
            const validViews = link.valid_clicks || 0
            const income = validViews * ratePerView
            const cpm = views > 0 ? (income / views) * 1000 : 0
            const referralEarning = income * ref_percent // referral

            dailyStats[dayStr].views += views
            dailyStats[dayStr].income += income
            dailyStats[dayStr].cpm = parseFloat(cpm.toFixed(2))
            dailyStats[dayStr].referral_earnings += parseFloat(referralEarning.toFixed(2))
        }
    })

    // Chuyển đổi object thành array và sắp xếp theo ngày mới nhất
    const tableData = Object.values(dailyStats)
        .map((day) => ({
            ...day,
            income: parseFloat(day.income.toFixed(2)),
            referral_earnings: parseFloat(day.referral_earnings.toFixed(2)),
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date))

    return {
        total_links: links.length,
        total_views: totalViews,
        total_valid_views: totalValidViews,
        total_earned: parseFloat(totalEarned.toFixed(2)),
        rate: {
            per_1000_views: cpm,
            currency: 'USD',
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
