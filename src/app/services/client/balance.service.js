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

        // Ensure all values are valid numbers
        const totalEarned = formatDecimal(referralEarnings + shortenLinkEarnings)
        const totalPayment = formatDecimal(user.total_payment || 0)
        const beingPaid = formatDecimal(user.being_paid || 0)

        // Calculate balance with proper validation
        const newBalance = formatDecimal(totalEarned - totalPayment - beingPaid)

        // Validate the calculated values
        if (isNaN(newBalance) || isNaN(totalEarned)) {
            throw new Error('Invalid balance calculation')
        }

        user.total_earned = totalEarned
        user.balance = newBalance

        await user.save()

        return {
            balance: formatDecimal(user.balance),
            total_earned: formatDecimal(user.total_earned),
            being_paid: formatDecimal(user.being_paid || 0),
            total_payment: formatDecimal(user.total_payment || 0),
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật số dư:', error)
        throw error
    }
}
