import Joi from 'joi'

export const createApiWeb = Joi.object({
    name_api: Joi.string().required().label('Tên api trang web'),
    api_url: Joi.string().trim().required().label('Url api trang web'),
    max_view: Joi.number().min(0).optional(),
    min_view: Joi.number().min(0).optional(),
    priority: Joi.number().min(1).optional(),
    price_per_view: Joi.number().min(0).optional(),
    description: Joi.string().allow('').optional(),
    country_uses: Joi.array().items(Joi.string()).optional(),
    allowed_domains: Joi.array().items(Joi.string()).optional(),
    blocked_domains: Joi.array().items(Joi.string()).optional(),
    block_vpn: Joi.boolean().optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
})
