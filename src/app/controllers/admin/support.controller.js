import * as SupportService from '@/app/services/client/support.service.js'



export const getAll = async (req,res) =>{
    const data = await SupportService.getAll(req.query,req)
    res.status(200).jsonify(data)
}