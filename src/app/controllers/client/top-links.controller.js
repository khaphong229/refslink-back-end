import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns'
import ClickLog from '../../../models/click-log.model'
import Link from '../../../models/link.model'
import mongoose from 'mongoose'

export const getTopLinks = async (req, res) => {
    try {
        const { period, timeline = 'current' } = req.query // period: 'week' or 'month', timeline: 'past', 'current'
        const now = new Date()

        // Xác định khoảng thời gian
        let startDate, endDate
        if (period === 'week') {
            if (timeline === 'past') {
                startDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
                endDate = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
            } else if (timeline === 'current') {
                startDate = startOfWeek(now, { weekStartsOn: 1 })
                endDate = endOfWeek(now, { weekStartsOn: 1 })
            }
        } else if (period === 'month') {
            if (timeline === 'past') {
                startDate = startOfMonth(subMonths(now, 1))
                endDate = endOfMonth(subMonths(now, 1))
            } else if (timeline === 'current') {
                startDate = startOfMonth(now)
                endDate = endOfMonth(now)
            }
        } else {
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'Invalid period. Use "week" or "month"',
                data: null
            })
        }

        if (!startDate || !endDate) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'Invalid timeline. Use "past" or "current"',
                data: null
            })
        }

        console.log('Date range:', { startDate, endDate, period, timeline }) // Debug log

        // Kiểm tra tất cả collections trong database
        const collections = await mongoose.connection.db.listCollections().toArray()
        console.log('Available collections:', collections.map(c => c.name))

        // Kiểm tra dữ liệu trong collection clicklogs
        const clicklogsCollection = mongoose.connection.db.collection('clicklogs')
        const rawClickLogs = await clicklogsCollection.find({
            created_at: {
                $gte: startDate,
                $lte: endDate
            }
        }).toArray()
        console.log('Raw click logs from clicklogs collection:', rawClickLogs)

        // Aggregate để tính toán thống kê
        const topLinks = await clicklogsCollection.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: '$link_id',
                    total_earned: { $sum: '$earned_amount' },
                    valid_clicks: {
                        $sum: { $cond: [{ $eq: ['$is_valid', true] }, 1, 0] }
                    },
                    total_clicks: { $sum: 1 }
                }
            },
            {
                $sort: { total_earned: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: 'shortenlinks',
                    let: { linkId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$linkId'] }
                            }
                        }
                    ],
                    as: 'link_info'
                }
            },
            {
                $unwind: {
                    path: '$link_info',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: { $ifNull: ['$link_info._id', '$_id'] },
                    user_id: '$link_info.user_id',
                    alias: '$link_info.alias',
                    original_link: '$link_info.original_link',
                    shorten_link: '$link_info.shorten_link',
                    third_party_link: '$link_info.third_party_link',
                    click_count: '$link_info.click_count',
                    valid_clicks: 1,
                    earned_amount: '$total_earned',
                    countries: '$link_info.countries',
                    devices: '$link_info.devices',
                    status: '$link_info.status',
                    created_at: '$link_info.created_at',
                    updated_at: '$link_info.updated_at'
                }
            }
        ]).toArray()

        console.log('Aggregation result:', topLinks) // Debug log

        res.status(200).json({
            status: 200,
            success: true,
            message: 'OK',
            data: {
                total: topLinks.length,
                data: topLinks,
                period,
                timeline,
                start_date: startDate,
                end_date: endDate
            }
        })
    } catch (error) {
        console.error('Error getting top links:', error)
        res.status(500).json({
            status: 500,
            success: false,
            message: 'Error getting top links',
            error: error.message,
            data: null
        })
    }
} 