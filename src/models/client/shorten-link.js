import createModel, {ObjectId} from '../base'

const ShortenLinkSchema = {
    api_web_id: {
        type: ObjectId,
        require: true,
        ref: 'ApiWebs',
    },
    user_id: {
        type: ObjectId,
        require: true,
        ref: 'User',
    },
    alias: {
        type: String,
    },
    title: {
        type: String,
    },
    original_link: {
        type: String,
        require: true,
    },
    shorten_link: {
        type: String,
        require: true,
    },
    click_count: {
        type: Number,
        default: 0,
    },
    valid_clicks: {
        type: Number,
        default: 0,
    },
    earned_amount: {
        type: Number,
        default: 0,
    },
    // countries: {},
    // devices: {},
    status: {
        type: String,
        default: 'active',
    },
}

const ShortenLink = createModel('ShortenLink', 'shortenlinks', ShortenLinkSchema)

export default ShortenLink
