import ApiWebs from '@/models/client/api-webs'
import {abort} from '@/utils/helpers'
import {isValidObjectId} from 'mongoose'

export async function checkId(req, res, next) {
    if (isValidObjectId(req.params.id)) {
        const data = await ApiWebs.findOne({_id: req.params.id})
        if (data) {
            req.data = data
            next()
            return
        }
    }
    abort(404, 'Không tìm thấy api web')
}
