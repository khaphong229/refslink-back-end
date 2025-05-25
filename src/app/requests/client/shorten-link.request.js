import { MAX_STRING_SIZE } from '@/configs'
import Joi from 'joi'

export const create = Joi.object({
    alias: Joi.string().min(6).label('ALIAS của link rút gọn').allow(''),
    title: Joi.string().min(3).max(100).label('Tiêu đề của link rút gọn'),
    original_link: Joi.string().min(6).max(MAX_STRING_SIZE).required().label('Link gốc cần rút gọn'),
    shorten_link: Joi.string().min(6).default('').label('Link rút gọn'),
    third_party_link: Joi.string().min(6).default('').label('Link rút gọn bên thứ 3'),
    click_count: Joi.number().default(0).min(0).label('Số lượt click'),
    valid_clicks: Joi.number().default(0).min(0).label('Số lượt click hợp lệ'),
    earned_amount: Joi.number().default(0).min(0).label('Số tiền kiếm được'),
    countries: Joi.array().items(Joi.string()).default(['all']).label('Quốc gia được phép'),
    devices: Joi.array().items(Joi.string()).default(['all']).label('Thiết bị được phép'),
    status: Joi.string().valid('active', 'inactive', 'pending').default('active').label('Trạng thái'),
})
