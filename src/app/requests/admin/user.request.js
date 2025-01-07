import Joi from 'joi'
import {User} from '../../../models'
import {MAX_STRING_SIZE, VALIDATE_PHONE_REGEX} from '@/configs'
import {AsyncValidate, FileUpload} from '@/utils/classes'
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
                })
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
                })
        ),
    password: Joi.string().min(6).max(MAX_STRING_SIZE).required().label('Mật khẩu'),
    avatar: Joi.object({
        mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
            .required()
            .label('Định dạng ảnh'),
    })
        .unknown(true)
        .instance(FileUpload)
        .allow('')
        .label('Ảnh đại diện'),
    address: Joi.string().min(6).max(MAX_STRING_SIZE).allow('').label('Địa chỉ'),
    birth_date: Joi.date().iso().allow(null).label('Ngày sinh nhật'),
    gender: Joi.string().allow('').label('Giới tính'),
    category_care: Joi.array().items(Joi.string()).allow('').label('Các loại đồ quan tâm'),
    social_media: Joi.array().items(Joi.string()).allow('').label('Danh sách liên kết mạng xã hội'),
    successful_exchanges: Joi.number().label('Số lần trao đổi thành công'),
    last_login: Joi.date().iso().allow(null).label('Lần đăng nhập cuối cùng'),
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
                })
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
                })
        ),
    avatar: Joi.object({
        mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
            .required()
            .label('Định dạng ảnh'),
    })
        .unknown(true)
        .instance(FileUpload)
        .allow('')
        .label('Ảnh đại diện'),
    address: Joi.string().min(6).max(MAX_STRING_SIZE).allow('').label('Địa chỉ'),
    birth_date: Joi.date().iso().allow(null).label('Ngày sinh nhật'),
    gender: Joi.string().allow('').label('Giới tính'),
    category_care: Joi.array().items(Joi.string()).allow('').label('Các loại đồ quan tâm'),
    social_media: Joi.array().items(Joi.string()).allow('').label('Danh sách liên kết mạng xã hội'),
    successful_exchanges: Joi.number().label('Số lần trao đổi thành công'),
    last_login: Joi.date().iso().allow(null).label('Lần đăng nhập cuối cùng'),
})

export const resetPassword = Joi.object({
    new_password: Joi.string().min(6).max(MAX_STRING_SIZE).required().label('Mật khẩu'),
})
