import * as supportRequest from '@/app/requests/client/support.request'

export const validateCreateSupport = (req, res, next) => {
    const { error, value } = supportRequest.create.validate(req.body)
    
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        })
    }
    
    req.body = value
    next()
}