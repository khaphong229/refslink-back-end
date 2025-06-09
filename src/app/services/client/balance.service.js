import User from '@/models/client/user'
import { getCommissionSettings } from '../admin/commission.service'
import ShortenLink from '@/models/client/shorten-link'
import { formatDecimal } from '@/utils/formatDecimal'

async function calculateReferralEarnings(userId) {
    const { ref_percent } = await getCommissionSettings()
    const usersReferred = await User.find({ ref_by: userId })

    const totalReferredEarnings = usersReferred.reduce((sum, user) => sum + (user.total_earned || 0), 0)
    return formatDecimal(totalReferredEarnings * ref_percent)
}

async function calculateShortenLinkEarnings(userId) {
    const shortenLinks = await ShortenLink.find({ user_id: userId })

    const totalShortenLinkEarnings = shortenLinks.reduce((sum, link) => sum + (link.earned_amount || 0), 0)
    return formatDecimal(totalShortenLinkEarnings)
}

export async function updateUserBalance(userId) {
    try {
        const user = await User.findById(userId)
        if (!user) return null

        const referralEarnings = await calculateReferralEarnings(userId)
        const shortenLinkEarnings = await calculateShortenLinkEarnings(userId)

        const newTotalEarned = formatDecimal(referralEarnings + shortenLinkEarnings)
        const newBalance = formatDecimal(newTotalEarned - user.total_payment - user.being_paid)

        user.total_earned = newTotalEarned
        user.balance = newBalance

        await user.save()

        return {
            balance: formatDecimal(user.balance),
            total_earned: formatDecimal(user.total_earned),
            being_paid: formatDecimal(user.being_paid),
            total_payment: formatDecimal(user.total_payment),
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật số dư:', error)
        throw error
    }
}
