import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns'
import mongoose from 'mongoose'

const getDateRange = (period, timeline) => {
    const now = new Date()
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
    }

    return { startDate, endDate }
}

const getTopLinksAggregation = (startDate, endDate) => {
    return [
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
    ]
}

const getClientTopLinksAggregation = (startDate, endDate, userId) => {
    return [
        {
            $match: {
                created_at: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $lookup: {
                from: 'shortenlinks',
                let: { linkId: '$link_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { 
                                $and: [
                                    { $eq: ['$_id', '$$linkId'] },
                                    { $eq: ['$user_id', userId] }
                                ]
                            }
                        }
                    }
                ],
                as: 'link_info'
            }
        },
        {
            $unwind: {
                path: '$link_info',
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $group: {
                _id: '$link_id',
                total_earned: { $sum: '$earned_amount' },
                valid_clicks: {
                    $sum: { $cond: [{ $eq: ['$is_valid', true] }, 1, 0] }
                },
                total_clicks: { $sum: 1 },
                link_info: { $first: '$link_info' }
            }
        },
        {
            $sort: { total_earned: -1 }
        },
        {
            $limit: 10
        },
        {
            $project: {
                _id: '$link_info._id',
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
    ]
}

export const getTopLinks = async (period, timeline) => {
    const { startDate, endDate } = getDateRange(period, timeline)
    if (!startDate || !endDate) {
        throw new Error('Invalid period or timeline')
    }

    const clicklogsCollection = mongoose.connection.db.collection('clicklogs')
    const topLinks = await clicklogsCollection.aggregate(getTopLinksAggregation(startDate, endDate)).toArray()

    return {
        total: topLinks.length,
        data: topLinks,
        period,
        timeline,
        start_date: startDate,
        end_date: endDate
    }
}

export const getClientTopLinks = async (period, timeline, userId) => {
    const { startDate, endDate } = getDateRange(period, timeline)
    if (!startDate || !endDate) {
        throw new Error('Invalid period or timeline')
    }

    const clicklogsCollection = mongoose.connection.db.collection('clicklogs')
    const topLinks = await clicklogsCollection.aggregate(
        getClientTopLinksAggregation(startDate, endDate, userId)
    ).toArray()

    return {
        total: topLinks.length,
        data: topLinks,
        period,
        timeline,
        start_date: startDate,
        end_date: endDate
    }
} 