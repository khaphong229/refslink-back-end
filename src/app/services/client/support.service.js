import aqp from 'api-query-params'
import Support from '@/models/client/support'
import * as SupportService from '@/app/services/client/support.service'

export const create = async (body, req) =>{
    const data = new Support(body)
    await data.save()
    return data
}