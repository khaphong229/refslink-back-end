import { APP_URL_CLIENT } from '@/configs'
import Referal from '@/models/client/referral'
import User from '@/models/client/user'
import { getCommissionSettings } from '../admin/commission.service'
import { formatDecimal } from '@/utils/formatDecimal'

async function createOrUpdateReferral(userId) {
    const { ref_percent } = await getCommissionSettings()
    const user = await User.findById(userId)

    if (!user) return null

    const usersReferred = await User.find({ ref_by: userId, status: 'active' })

    const totalReferredEarnings = usersReferred.reduce((sum, user) => sum + (user.total_earned || 0), 0)
    const totalEarnings = totalReferredEarnings * ref_percent

    let referral = await Referal.findOne({ user_id: userId })

    if (!referral) {
        const data = {
            ref_link: `${APP_URL_CLIENT}/user/register?ref=${user.ref_code || ''}`,
            user_id: userId,
            user_ref: usersReferred.map((user) => user._id),
            total_earnings: totalEarnings,
        }
        referral = new Referal(data)
    } else {
        const currentReferredIds = referral.user_ref.map((id) => id.toString())
        const newReferredIds = usersReferred.map((user) => user._id.toString())

        const hasChanges =
            currentReferredIds.length !== newReferredIds.length ||
            currentReferredIds.some((id) => !newReferredIds.includes(id))

        if (hasChanges || referral.total_earnings !== totalEarnings) {
            referral.user_ref = usersReferred.map((user) => user._id)
            referral.total_earnings = totalEarnings
        }
    }

    await referral.save()
    return referral
}

export async function handleUserRegistration(userId) {
    return await createOrUpdateReferral(userId)
}

export async function handleUserLogin(userId) {
    return await createOrUpdateReferral(userId)
}

export async function getReferralInfo(req, res) {
    const { ref_percent } = await getCommissionSettings()
    const usersReferred = await User.find({ ref_by: req.currentUser._id, status: 'active' })
    const totalReferredEarnings = usersReferred.reduce((sum, user) => sum + (user.total_earned || 0), 0)
    const totalEarnings = totalReferredEarnings * ref_percent
    let referral = await Referal.findOne({ user_id: req.currentUser._id })

    if (!referral) {
        const data = {
            ref_link: `${APP_URL_CLIENT}/user/register?ref=${req.currentUser?.ref_code || ''}`,
            user_id: req.currentUser._id,
            user_ref: usersReferred.map((user) => user._id),
            total_earnings: totalEarnings,
        }
        referral = new Referal(data)
        await referral.save()
    } else {
        const currentReferredIds = referral.user_ref.map((id) => id.toString())
        const newReferredIds = usersReferred.map((user) => user._id.toString())

        const hasChanges =
            currentReferredIds.length !== newReferredIds.length ||
            currentReferredIds.some((id) => !newReferredIds.includes(id))

        if (hasChanges || referral.total_earnings !== totalEarnings) {
            referral.user_ref = usersReferred.map((user) => user._id)
            referral.total_earnings = totalEarnings
            await referral.save()
        }
    }

    return referral
}

export async function getReferredUsers(req, res) {
    const { ref_percent } = await getCommissionSettings()
    const referedUsers = await User.find({
        ref_by: req.currentUser._id,
        status: 'active',
    }).select('name created_at total_earned')

    const transformedUsers = referedUsers.map((user) => ({
        ...user.toObject(),
        total_earned: formatDecimal((user.total_earned || 0) * ref_percent),
    }))

    return transformedUsers
}

export async function getReferrerInfo(userId) {
    const user = await User.findById(userId)
    if (!user || !user.ref_by) {
        throw new Error('No referrer found')
    }

    const referrer = await User.findById(user.ref_by).select('full_name avatar ref_code')

    return referrer
}

// Function to add a new referral
export async function addReferral(userId, referrerId) {
    // Add user to referrer's referral list
    await Referal.findOneAndUpdate({ user_id: referrerId }, { $push: { user_ref: userId } }, { upsert: true })

    // Create referral record for new user
    await Referal.create({
        user_id: userId,
        ref_link: `${process.env.FRONTEND_URL}/register?ref=${referrerId}`,
    })
}
