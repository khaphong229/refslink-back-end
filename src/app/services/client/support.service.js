import aqp from 'api-query-params'
import Support from '@/models/client/support'


export const create = async (body, req) =>{
    const data = new Support(body)
    await data.save()
    return data
}


 
export async function getAll(queryParams) {
    const {filter: queryFilter, sort : querySort= {created_at:-1 }  } = aqp(queryParams)
    const searchConditions = {}
    const limit = parseInt(queryFilter?.limit) || 10
    const current = parseInt(queryFilter?.current)|| 1


    if (queryFilter && Object.keys(queryFilter).length > 0) {
        if (queryFilter.q) {
            const searchValue = queryFilter.q
            delete queryFilter.limit
            delete queryFilter.current
            delete queryFilter.q

            searchConditions.$or = [
                { full_name: { $regex: searchValue, $options: 'i' } },
                { email: { $regex: searchValue, $options: 'i' } },
                { subject: { $regex: searchValue, $options: 'i' } },
                { description: { $regex: searchValue, $options: 'i' } },
            ]
        }

        Object.entries(queryFilter).forEach(([key, value]) => {
            if (!['limit', 'current'].includes(key)) {
                searchConditions[key] = typeof value === 'string'
                    ? { $regex: value, $options: 'i' }
                    : value
            }
        })
    }

    const [data, total] = await Promise.all([
        Support.find(searchConditions)
            .skip((current - 1) * limit)
            .limit(limit)
            .sort(querySort)
            .lean(),
        Support.countDocuments(searchConditions),
    ])

    return { total, current, limit, data }


}