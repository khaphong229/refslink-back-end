import createModel, { ObjectId } from '../base'

const ReferalSchema = {
    ref_link: {
        type: String,
        required: true,
    },
    user_id: {
        type: ObjectId,
        required: true,
        ref: 'User',
        unique: true,
    },
    user_ref: {
        type: [ObjectId],
        default: [],
        ref: 'User',
    },
    total_earnings: {
        type: Number,
        default: 0,
    },
}

const Referal = createModel('Referal', 'referals', ReferalSchema, {})
export default Referal
