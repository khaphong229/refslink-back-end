import Joi from 'joi'

export const createSetting = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Name không được để trống',
        'any.required': 'Name là bắt buộc',
    }),
    value: Joi.any().required().messages({
        'any.required': 'Value là bắt buộc',
    }),
    description: Joi.string().allow('', null).optional(),
    is_public: Joi.boolean().default(false),
})

export const updateSetting = Joi.object({
    value: Joi.any().required().messages({
        'any.required': 'Value là bắt buộc',
    }),
    description: Joi.string().allow('', null).optional(),
    is_public: Joi.boolean().optional().default(false),
})
