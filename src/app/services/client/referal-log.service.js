import ReferralLog from '@/models/client/referral-log'
import User from '@/models/client/user'
import { getCommissionSettings } from '../admin/commission.service'

export async function createReferralLog(req) {
    const { ref_percent } = await getCommissionSettings()
    const currentUser = req.currentUser

    if (!currentUser.ref_by) {
        return null
    }
    const referrer = await User.findById(currentUser.ref_by)
    if (!referrer) {
        return null
    }

    const earnedAmount = currentUser.balance * ref_percent

    const referralLog = await ReferralLog.create({
        user_id: referrer._id,
        referred_user_id: currentUser._id,
        earned_amount: earnedAmount,
        source: 'shorten_link',
        created_at: new Date(),
    })

    return referralLog
}
