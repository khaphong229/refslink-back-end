import createModel, { ObjectId } from '../base'

const ReferralLogSchema = {
    user_id: {
        type: ObjectId,
        required: true,
        ref: 'User',
    },
    referred_user_id: {
        type: ObjectId,
        required: true,
        ref: 'User',
    },
    earned_amount: {
        type: Number,
        default: 0,
    },
    source: {
        type: String,
        enum: ['shorten_link', 'other'],
        default: 'shorten_link',
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
}

const ReferralLog = createModel('ReferralLog', 'referral_logs', ReferralLogSchema)
export default ReferralLog
