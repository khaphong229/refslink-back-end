import mongoose from 'mongoose'

const ClickLogSchema = new mongoose.Schema({
    link_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ShortenLink', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    ip: { type: String },
    country: { type: String },
    device: { type: String },
    browser: { type: String },
    referer: { type: String },
    is_valid: { type: Boolean, default: true },
    earned_amount: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
})

export default mongoose.model('ClickLog', ClickLogSchema)
