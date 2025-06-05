import createModel, { ObjectId } from '../base'


const ReferralSchema = {
    ref_link:{
        type: String,
        required: true,
    },
    user_id:{
        type:ObjectId,
        required: true,
        ref: 'User',
        unique:true,

    },
    user_ref:{
        type:[ObjectId],
        default: [],
        ref:'User'
        
    },
    total_earings:{
        type:Number,
        default: 0,
    }
}

const Referral = createModel('Referral', 'referrals', ReferralSchema,{})
export default Referral