import Joi from 'joi'
import {User} from '../../../models'
import {
    MAX_STRING_SIZE,
    VALIDATE_FULL_NAME_REGEX,
    VALIDATE_PASSWORD_REGEX,
    VALIDATE_PHONE_REGEX,
} from '@/configs'
import {AsyncValidate, FileUpload} from '@/utils/classes'

export const login = Joi.object({
    email: Joi.string().trim().max(MAX_STRING_SIZE).lowercase().email().required().label('Email'),
    password: Joi.string().max(MAX_STRING_SIZE).required().label('Mật khẩu'),
})

export const register = Joi.object({
    name: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .pattern(VALIDATE_FULL_NAME_REGEX)
        .required()
        .label('Họ và tên')
        .messages({'string.pattern.base': '{{#label}} không bao gồm số hay ký tự đặc biệt.'}),
    email: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .lowercase()
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
    password: Joi.string()
        .min(6)
        .max(MAX_STRING_SIZE)
        .pattern(VALIDATE_PASSWORD_REGEX)
        .required()
        .label('Mật khẩu')
        .messages({
            'string.pattern.base':
                '{{#label}} phải có ít nhất một chữ thường, chữ hoa, số và ký tự đặc biệt.',
        }),
    phone: Joi.string()
        .trim()
        .pattern(VALIDATE_PHONE_REGEX)
        .allow('')
        .label('Số điện thoại')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const user = await User.findOne({phone: value})
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

export const updateProfile = Joi.object({
    name: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .pattern(VALIDATE_FULL_NAME_REGEX)
        .required()
        .label('Họ và tên')
        .messages({'string.pattern.base': '{{#label}} không bao gồm số hay ký tự đặc biệt.'}),
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(MAX_STRING_SIZE)
        .required()
        .label('Email')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const user = await User.findOne({email: value, _id: {$ne: req.currentUser._id}})
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
                    const user = await User.findOne({phone: value, _id: {$ne: req.currentUser._id}})
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

export const changePassword = Joi.object({
    password: Joi.string()
        .required()
        .label('Mật khẩu cũ')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, (req) =>
                    req.currentUser.verifyPassword(value)
                        ? value
                        : helpers.message('{#label} không chính xác.')
                )
        ),
    new_password: Joi.string()
        .min(6)
        .max(MAX_STRING_SIZE)
        .pattern(VALIDATE_PASSWORD_REGEX)
        .required()
        .label('Mật khẩu mới')
        .messages({
            'string.pattern.base':
                '{{#label}} phải có ít nhất một chữ thường, chữ hoa, số và ký tự đặc biệt.',
        })
        .custom(function (value, helpers) {
            const {data} = helpers.prefs.context
            return data.password === data.new_password
                ? helpers.message('{{#label}} không được trùng với mật khẩu cũ.')
                : value
        }),
})

export const forgotPassword = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(MAX_STRING_SIZE)
        .required()
        .label('Email')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const user = await User.findOne({email: value})
                    req.currentUser = user
                    return user ? value : helpers.message('{{#label}} không tồn tại.')
                })
        ),
})

export const resetPassword = Joi.object({
    new_password: Joi.string()
        .min(6)
        .max(MAX_STRING_SIZE)
        .pattern(VALIDATE_PASSWORD_REGEX)
        .required()
        .label('Mật khẩu mới')
        .messages({
            'string.pattern.base':
                '{{#label}} phải có ít nhất một chữ thường, chữ hoa, số và ký tự đặc biệt.',
        }),
})
