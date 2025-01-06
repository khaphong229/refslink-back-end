import authRouter from './auth.router'
import userRouter from './user.router'

function route(app) {
    app.use('/auth', authRouter)
    app.use('/users', userRouter)
}

export default route
