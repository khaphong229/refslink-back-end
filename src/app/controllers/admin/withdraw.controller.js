import * as withdrawService from '../../services/client/withdraw.service'
import { abort } from '@/utils/helpers'

export async function updateWithdrawStatus(req, res) {
    try {
        const { id } = req.params
        const { status, note } = req.body
        const updated = await withdrawService.updateWithdrawStatus(id, status, note)
        res.status(200).json(updated)
    } catch (error) {
        abort(400, error.message)
    }
}

export async function getAllWithdrawRequests(req, res) {
    try {
        const withdraws = await withdrawService.getAllWithdrawRequests()
        res.status(200).json(withdraws)
    } catch (error) {
        abort(400, error.message)
    }
}
