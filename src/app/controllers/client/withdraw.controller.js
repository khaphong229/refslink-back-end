import * as withdrawService from '@/app/services/client/withdraw.service'
import { abort } from '@/utils/helpers'
import User from '@/models/client/user'
import { SettingKeys } from '@/utils/setting.constants'
import { getSettingByName } from '@/app/services/admin/setting.service'

export async function createWithdrawRequest(req, res) {
    try {
        const { amount_money, payment_method, payment_details } = req.body
        const user = await User.findById(req.currentUser._id)
        const amount = amount_money ?? user.balance
        // const amount = 0.2
        const minWithdrawSetting = await getSettingByName(SettingKeys.MIN_WITHDRAW)
        const minAmount = Number(minWithdrawSetting.value)

        const method = payment_method ?? user.method_withdraw
        const details = payment_details ?? user.info_withdraw
        const withdraw = await withdrawService.createWithdrawRequest({
            userId: req.currentUser._id,
            amount_money: amount,
            payment_method: method,
            payment_details: details,
            minAmount,
        })
        res.status(201).jsonify(withdraw)
    } catch (error) {
        abort(400, error.message)
    }
}

export async function getAllWithdrawRequests(req, res) {
    try {
        const userId = req.currentUser._id
        const { page, limit, status, sort, from, to } = req.query
        const result = await withdrawService.getAllWithdrawRequestsByUser(userId, {
            page,
            limit,
            status,
            sort,
            from,
            to,
        })
        res.status(200).jsonify(result)
    } catch (error) {
        abort(400, error.message)
    }
}
