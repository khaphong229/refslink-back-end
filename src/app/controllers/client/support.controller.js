import * as SupportService from '@/app/services/client/support.service.js'
import { jsonify } from '@/handlers/response.handler'

export const create = async (req,res) =>{
    const data = await SupportService.create(req.body, req)
    res.status(201).jsonify(data)
}