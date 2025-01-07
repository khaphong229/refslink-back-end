import {MAX_STRING_SIZE} from '@/configs'
import Joi from 'joi'

export const getAllCategory = Joi.object({
    name: Joi.string().trim().max(MAX_STRING_SIZE).required().label('Tên loại'),
    description: Joi.string().allow('').label('Mô tả'),
    logo: Joi.string().allow('').label('Ảnh minh họa'),
    parent: Joi.string().allow('').label('Thể loại cha'),
})
