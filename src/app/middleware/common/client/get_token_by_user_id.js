import mongoose from 'mongoose'

const shortenToolSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    created_at: { type: Date },
    updated_at: { type: Date }
})

const ShortenTool = mongoose.models.ShortenTool || mongoose.model('ShortenTool', shortenToolSchema)

export default ShortenTool
