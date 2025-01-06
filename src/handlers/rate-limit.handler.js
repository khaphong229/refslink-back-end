import {rateLimit} from 'express-rate-limit'
import {REQUESTS_LIMIT_PER_MINUTE} from '@/configs'
import {abort} from '@/utils/helpers'

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: REQUESTS_LIMIT_PER_MINUTE,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: () => abort(429),
})

export default limiter
