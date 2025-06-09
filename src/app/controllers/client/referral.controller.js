import * as referralService from '@/app/services/client/referral.service'
import { abort } from '@/utils/helpers'

export async function getReferralInfo(req, res) {
    try {
        const referral = await referralService.getReferralInfo(req, res)
        res.json(referral)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export async function getReferredUsers(req, res) {
    try {
        const referredUsers = await referralService.getReferredUsers(req, res)
        res.status(200).jsonify(referredUsers)
    } catch (error) {
        abort(404, 'Lỗi lấy danh sách.')
    }
}

export async function getReferrerInfo(req, res) {
    try {
        const referrer = await referralService.getReferrerInfo(req.user._id)
        res.json(referrer)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}
