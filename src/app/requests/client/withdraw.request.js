import Joi from 'joi'

export const createWithdrawRequest = Joi.object({
    amount_money: Joi.number().label('Số tiền rút'),
    payment_method: Joi.string().required().label('Phương thức rút'),
    payment_details: Joi.string().allow('').label('Thông tin rút'),
})
