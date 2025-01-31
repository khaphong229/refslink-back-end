import Joi from 'joi'

export const createApiWeb = Joi.object({
    name_api: Joi.string().required().label('Tên api trang web'),
    api_url: Joi.string().trim().required().label('Url api trang web'),
})
