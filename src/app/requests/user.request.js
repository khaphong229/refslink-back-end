import Joi from 'joi'
import {User} from '../../models'
import {MAX_STRING_SIZE, VALIDATE_PHONE_REGEX} from '@/configs'
import {AsyncValidate} from '@/utils/classes'
import {tryValidateOrDefault} from '@/utils/helpers'

export const readRoot = Joi.object({
    q: tryValidateOrDefault(Joi.string().trim(), ''),
    page: tryValidateOrDefault(Joi.number().integer().min(1), 1),
    per_page: tryValidateOrDefault(Joi.number().integer().min(1).max(100), 20),
    field: tryValidateOrDefault(Joi.valid('created_at', 'name', 'email'), 'created_at'),
    sort_order: tryValidateOrDefault(Joi.valid('asc', 'desc'), 'desc'),
})

export const createItem = Joi.object({
    name: Joi.string().trim().max(MAX_STRING_SIZE).required().label('Họ và tên'),
    email: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .email()
        .required()
        .label('Email')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const user = await User.findOne({email: value})
                    return !user ? value : helpers.error('any.exists')
                }),
        ),
    phone: Joi.string()
        .trim()
        .pattern(VALIDATE_PHONE_REGEX)
        .allow('')
        .required()
        .label('Số điện thoại')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const user = await User.findOne({phone: value})
                    return !user ? value : helpers.error('any.exists')
                }),
        ),
    password: Joi.string().min(6).max(MAX_STRING_SIZE).required().label('Mật khẩu'),
})

export const updateItem = Joi.object({
    name: Joi.string().trim().max(MAX_STRING_SIZE).required().label('Họ và tên'),
    email: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .email()
        .required()
        .label('Email')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const userId = req.params.id
                    const user = await User.findOne({email: value, _id: {$ne: userId}})
                    return !user ? value : helpers.error('any.exists')
                }),
        ),
    phone: Joi.string()
        .trim()
        .pattern(VALIDATE_PHONE_REGEX)
        .allow('')
        .required()
        .label('Số điện thoại')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const userId = req.params.id
                    const user = await User.findOne({phone: value, _id: {$ne: userId}})
                    return !user ? value : helpers.error('any.exists')
                }),
        ),
})

export const resetPassword = Joi.object({
    new_password: Joi.string().min(6).max(MAX_STRING_SIZE).required().label('Mật khẩu'),
})
