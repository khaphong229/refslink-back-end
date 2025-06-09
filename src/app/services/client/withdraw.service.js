import Withdraw from '@/models/client/withdraw'
import User from '@/models/client/user'
import { formatDecimal } from '@/utils/formatDecimal'
import { generateWithdrawCode } from '@/utils/generateAlias'

export async function createWithdrawRequest({
    userId,
    amount_money,
    payment_method,
    payment_details,
    minAmount,
}) {
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

export async function getAllWithdrawRequests() {
    return await Withdraw.find({}).sort({ created_at: -1 })
}

export async function updateWithdrawStatus(id, status, note) {
    const withdraw = await Withdraw.findById({ _id: id })
    if (!id) throw new Error('Thiếu ID đơn rút tiền')
    if (!status) throw new Error('Thiếu trạng thái đơn')
    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
        throw new Error('Trạng thái không hợp lệ')
    }
    const oldStatus = withdraw.status

    // Nếu reject thì hoàn tiền về balance, trừ being_paid
    if (status === 'rejected' && oldStatus !== 'rejected') {
        const user = await User.findById({ _id: withdraw.user_id })
        if (user) {
            user.balance = formatDecimal(user.balance + withdraw.amount_money)
            user.being_paid = formatDecimal(user.being_paid - withdraw.amount_money)
            await user.save()
        }
    }
    // Nếu completed thì trừ being_paid, cộng total_payment
    if (status === 'completed' && oldStatus !== 'completed') {
        const user = await User.findById({ _id: withdraw.user_id })
        if (user) {
            user.being_paid = formatDecimal(user.being_paid - withdraw.amount_money)
            user.total_payment = formatDecimal((user.total_payment || 0) + withdraw.amount_money)
            await user.save()
        }
        withdraw.paid_time = new Date()
    }

    withdraw.status = status
    withdraw.note = note ?? withdraw.note
    await withdraw.save()
    return withdraw
}
