import * as withdrawService from '../../services/client/withdraw.service'
import { abort } from '@/utils/helpers'

export async function updateWithdrawStatus(req, res) {
    try {
        const { id } = req.params
        const { status, note } = req.body
        const updated = await withdrawService.updateWithdrawStatus(id, status, note)
        res.status(200).jsonify(updated)
    } catch (error) {
        abort(400, error.message)
    }
}

export async function getAllWithdrawRequests(req, res) {
    try {
        const { page, limit, status, sort, from, to } = req.query
        const result = await withdrawService.getAllWithdrawRequests({ page, limit, status, sort, from, to })
        res.status(200).jsonify(result)
    } catch (error) {
        abort(400, error.message)
    }
}
