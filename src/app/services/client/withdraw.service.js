import Withdraw from '@/models/client/withdraw'
import User from '@/models/client/user'
import { formatDecimal } from '@/utils/formatDecimal'
import { generateWithdrawCode } from '@/utils/generateAlias'


export async function createWithdrawRequest({ userId, amount_money, payment_method, payment_details, minAmount }) {

    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    if (user.balance < amount_money) throw new Error('Số dư không đủ')
    if (amount_money < minAmount) throw new Error(`Số tiền rút phải lớn hơn hoặc bằng ${minAmount}`)

    user.being_paid = formatDecimal((user.being_paid || 0) + amount_money)
    user.balance = formatDecimal(user.balance - amount_money)
    await user.save()

    const withdraw = await Withdraw.create({
        user_id: userId,
        amount_money,
        payment_method,
        payment_details,
        status: 'pending',
        withdraw_code: generateWithdrawCode(),
    })
    return withdraw
}

export async function getAllWithdrawRequestsByUser(userId) {
    return await Withdraw.find({ user_id: userId }).sort({ created_at: -1 })
}


