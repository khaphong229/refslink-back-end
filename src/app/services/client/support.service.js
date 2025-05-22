import aqp from 'api-query-params'
import Support from '@/models/client/support'
import * as SupportService from '@/app/services/client/support.service'

export const create = async (body, req) =>{
    const data = new Support(body)
    await data.save()
    return data
}


export const getAll = async (query, req) => {
    try {
        const { filter, skip, limit, sort, projection, population } = aqp(query)
        
        // Xử lý phân trang
        const page = parseInt(query.page) || 1
        const pageSize = parseInt(query.limit) || 10
        const skipCount = (page - 1) * pageSize

        // Query với filter
        const supports = await Support.find(filter)
            .select(projection)
            .sort(sort)
            .skip(skipCount)
            .limit(pageSize)
            .populate(population)
            .lean()

        // Đếm tổng số records
        const total = await Support.countDocuments(filter)

        return {
            success: true,
            data: supports,
            pagination: {
                currentPage: page,
                pageSize: pageSize,
                totalRecords: total,
                totalPages: Math.ceil(total / pageSize)
            },
            message: 'Supports retrieved successfully'
        }
    } catch (error) {
        throw {
            success: false,
            message: error.message || 'Error retrieving supports',
            error: error
        }
    }
}
