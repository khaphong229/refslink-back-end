import Withdraw from '@/models/client/withdraw'
import User from '@/models/client/user'
import { formatDecimal } from '@/utils/formatDecimal'
import { generateWithdrawCode } from '@/utils/generateAlias'

function parseToDate(to) {
    if (!to) return null
    const toDate = new Date(to)
    // Nếu chỉ truyền yyyy-mm-dd thì lấy hết ngày đó
    if (typeof to === 'string' && to.length === 10) {
        toDate.setDate(toDate.getDate() + 1)
        toDate.setMilliseconds(toDate.getMilliseconds() - 1)
    }
    return toDate
}

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

export async function getAllWithdrawRequestsByUser(userId, { page = 1, limit = 10, status, sort = 'desc', from, to } = {}) {
    const query = { user_id: userId }
    if (status) query.status = status
    if (from || to) {
        query.created_at = {}
        if (from) query.created_at.$gte = new Date(from)
        if (to) query.created_at.$lte = parseToDate(to)
    }
    const sortOption = { created_at: sort === 'asc' ? 1 : -1, status: 1 }
    const skip = (Number(page) - 1) * Number(limit)
    const withdraws = await Withdraw.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
    const total = await Withdraw.countDocuments(query)
    return {
        data: withdraws,
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
    }
}

export async function getAllWithdrawRequests({ page = 1, limit = 10, status, sort = 'desc', from, to } = {}) {
    const query = {}
    if (status) query.status = status
    if (from || to) {
        query.created_at = {}
        if (from) query.created_at.$gte = new Date(from)
        if (to) query.created_at.$lte = parseToDate(to)
    }
    const sortOption = { created_at: sort === 'asc' ? 1 : -1, status: 1 }
    const skip = (Number(page) - 1) * Number(limit)
    const withdraws = await Withdraw.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
    const total = await Withdraw.countDocuments(query)
    return {
        data: withdraws,
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
    }
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
            user.being_paid = 0
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
