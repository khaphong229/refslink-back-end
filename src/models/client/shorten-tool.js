import createModel, {ObjectId} from '../base'

const ShortenToolSchema = {
    user_id: {
        type: ObjectId,
        require: true,
        ref: 'User',
    },
    token: {
        type: String,
        require: true,
        unique: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    }
}

const ShortenTool = createModel('ShortenTool', 'shortentools', ShortenToolSchema)

export default ShortenTool 