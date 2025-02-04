import {MAX_STRING_SIZE} from '@/configs'
import Joi from 'joi'

export const create = Joi.object({
    alias: Joi.string().min(6).label('ALIAS của link rút gọn'),
    title: Joi.string().label('Tiêu đề của link rút gọn'),
    original_link: Joi.string().min(6).max(MAX_STRING_SIZE).required().label('Link gốc cần rút gọn'),
    // shorten_link: Joi.string().min(6).required().label('Link rút gọn'),
    // click_count: Joi.number(),
    // valid_clicks: Joi.number(),
    // earned_amount: Joi.number(),
    // countries: Joi.string(),
    // devices: Joi.string(),
    // status: Joi.string(),
})
