import createModel, { ObjectId } from '../base'


const WithdrawSchema = {
    user_id: {
        type: ObjectId,
        ref: 'User',
        required: true,
    },
    amount_money: {
        type: Number,
        required: true,
    },
    payment_method: {
        type: String,
        required: true,
    },
    payment_details: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending',
    },
    note: {
        type: String,
        default: '',
    },
    scheduled_payment: {
        type: Date,
        default: null,
    },
    paid_time: {
        type: Date,
        default: null,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    withdraw_code: {
        type: String,
        required: true,
        unique: true,
    },
}

const Withdraw = createModel('Withdraw', 'withdraws', WithdrawSchema)
export default Withdraw
