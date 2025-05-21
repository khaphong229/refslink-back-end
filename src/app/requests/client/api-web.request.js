import { PRICE_PER_VIEW_MONEY } from '@/configs'
import Joi from 'joi'

export const createApiWeb = Joi.object({
    api_url: Joi.string().trim().required().label('Url api trang web'),
    max_view: Joi.number().default(2),
    min_view: Joi.number().default(0),
    priority: Joi.number().default(1),
    price_per_view: Joi.number().default(PRICE_PER_VIEW_MONEY),
    description: Joi.string().allow('').default(''),
    timer: Joi.boolean().default(false),
    timer_duration: Joi.number().default(null),
    timer_start: Joi.string().default(null),
    timer_end: Joi.string().default(null),
    country_uses: Joi.array().items(Joi.string()).default([]),
    allowed_domains: Joi.array().items(Joi.string()).default([]),
    blocked_domains: Joi.array().items(Joi.string()).default([]),
    block_vpn: Joi.boolean().default(false),
    status: Joi.string().default('active'),
})

export const changeStatusApiWeb = Joi.object({
    status: Joi.string().default('active'),
})
