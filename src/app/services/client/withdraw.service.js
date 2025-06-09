import Withdraw from '@/models/client/withdraw'
import User from '@/models/client/user'
import { formatDecimal } from '@/utils/formatDecimal'


export async function createWithdrawRequest({ userId, amount_money, payment_method, payment_details, minAmount }) {
    // Lấy user
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    // Kiểm tra số dư

    if (user.balance < amount_money) throw new Error('Số dư không đủ')
    if (amount_money < minAmount) throw new Error(`Số tiền rút phải lớn hơn hoặc bằng ${minAmount}`)

    // Trừ số dư tạm thời (being_paid)
    user.being_paid = formatDecimal((user.being_paid || 0) + amount_money)
    await user.save()

    // Tạo yêu cầu rút tiền
    const withdraw = await Withdraw.create({
        user_id: userId,
        amount_money,
        payment_method,
        payment_details,
        status: 'pending',
    })
    return withdraw
}


