import mongoose from 'mongoose'

const clickLogSchema = new mongoose.Schema({
    link_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Link',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: ''
    },
    device: {
        type: String,
        required: true
    },
    browser: {
        type: String,
        required: true
    },
    referer: {
        type: String,
        default: ''
    },
    is_valid: {
        type: Boolean,
        default: true
    },
    earned_amount: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('ClickLog', clickLogSchema) 