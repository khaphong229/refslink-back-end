import { required } from 'joi'
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

    },
    user_ref:{
        type:Array,
        default: [],
        
    },
    total_earings:{
        type:Number,
        default: 0,
    }
}

const Referral = createModel('Referral', 'referrals', ReferralSchema,{})
export default Referral