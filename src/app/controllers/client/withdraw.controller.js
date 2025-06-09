import * as withdrawService from '@/app/services/client/withdraw.service'
import { abort } from '@/utils/helpers'
import User from '@/models/client/user' 

export async function createWithdrawRequest(req, res) {
    try {
        const { amount_money, payment_method, payment_details } = req.body
        const user = await User.findById(req.currentUser._id)
        const amount = amount_money ?? user.balance // Nếu không có thì lấy toàn bộ số dư
        const minAmount = 1
        
        const withdraw = await withdrawService.createWithdrawRequest({
            userId: req.currentUser._id,
            amount_money: amount,
            payment_method,
            payment_details,
            minAmount,
        })
        res.status(201).json(withdraw)
    } catch (error) {
        abort(400, error.message)
    }
}
