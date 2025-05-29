import {PRICE_PER_VIEW} from '@/configs'
import createModel, {ObjectId} from '../base'

const ApiWebsSchema = {
    user_id: {
        type: ObjectId,
        ref: 'User',
        required: true,
    },
    name_api: {
        type: String,
        required: true,
    },
    api_url: {
        type: String,
        required: true,
    },
    max_view: {
        type: Number,
        default: 20,
    },
    min_view: {
        type: Number,
        default: 1,
    },
    priority: {
        type: Number,
        default: 1,
    },
    price_per_view: {
        type: Number,
        default: PRICE_PER_VIEW,
    },
    description: {
        type: String,
    },
    timer: {
        type: Boolean,
    },
    timer_duration: {
        type: Number,
    },
    timer_start: {
        type: Date,
    },
    timer_end: {
        type: Date,
    },
    country_uses: {
        type: Array,
        default: [],
    },
    allowed_domains: {
        type: Array,
        default: [],
    },
    blocked_domains: {
        type: Array,
        default: [],
    },
    block_vpn: {
        type: Boolean,
    },
    status: {
        type: String,
        default: 'active',
    },
}

const ApiWebs = createModel('ApiWebs', 'apiwebs', ApiWebsSchema, {})

export default ApiWebs
