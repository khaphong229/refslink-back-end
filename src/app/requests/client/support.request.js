import Joi from 'joi'


export const create = Joi.object({
    full_name:Joi.string().trim().required().label('Họ tên'),
    email:Joi.string().trim().required().label('Email'),
    subject:Joi.string().trim().required().label('Chủ đề'),
    description:Joi.string().trim().required().label('Nội dung'),
})