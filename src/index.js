import express from 'express'
import path from 'path'
import serveFavicon from 'serve-favicon'
import helmet from 'helmet'
import multer from 'multer'
import {APP_DEBUG, CLIENT_ID, CLIENT_SECRET, NODE_ENV, PUBLIC_DIR, VIEW_DIR, APP_URL_API} from './configs'
import {setupSwagger} from './configs/swagger'
  
import {jsonify, sendMail} from './handlers/response.handler'
import corsHandler from './handlers/cors.handler'
import httpRequestHandler from './handlers/http-request.handler'
import limiter from './handlers/rate-limit.handler'
import formDataHandler from './handlers/form-data.handler'
import initLocalsHandler from './handlers/init-locals.handler'
import notFoundHandler from './handlers/not-found.handler'
import errorHandler from './handlers/error.handler'
import passport from 'passport'
import {Strategy} from 'passport-google-oauth20'
import { User } from './models'

import routeAdmin from './routes/admin'
import routeClient from './routes/client'
import publicRedirectRouter from './routes/public-redirect.router.js'
import generateScriptRouter from './routes/generateScript.js'
import googleAuthRouter from './routes/client/google-auth.router.js'
import topLinksRouter from './routes/client/top-links.router.js'

function createApp() {
    // Init app
    const app = express()

    app.response.jsonify = jsonify
    app.response.sendMail = sendMail

    app.set('env', NODE_ENV)
    app.set('trust proxy', 1)
    app.set('views', VIEW_DIR)
    app.set('view engine', 'ejs')

    app.use(corsHandler)
    if (APP_DEBUG) {
        app.use(httpRequestHandler)
    }
    app.use(limiter)
    app.use(serveFavicon(path.join(PUBLIC_DIR, 'favicon.ico')))
    app.use('/static', express.static(PUBLIC_DIR))
    app.use(express.static(path.join(process.cwd(), 'public')))
    app.use(helmet())
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))
    app.use(multer({storage: multer.memoryStorage()}).any())
    app.use(formDataHandler)
    app.use(initLocalsHandler)

    // Setup Swagger documentation
    setupSwagger(app)

    app.use(passport.initialize())

    passport.use(
        new Strategy(
            {
                callbackURL: `${APP_URL_API}/auth/google/callback`,
                clientID: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    console.log('Google profile received:', profile)
                    
                    // Tìm user theo googleId
                    let user = await User.findOne({ googleId: profile.id })
                    
                    if (user) {
                        console.log('Existing user found with Google ID:', user._id)
                        return done(null, user)
                    }
                    
                    // Nếu không tìm thấy theo googleId, tìm theo email
                    if (profile.emails && profile.emails.length > 0) {
                        const email = profile.emails[0].value
                        user = await User.findOne({ email })
                        
                        if (user) {
                            // Cập nhật googleId cho tài khoản hiện có
                            user.googleId = profile.id
                            await user.save()
                            console.log('Updated existing user with Google ID:', user._id)
                            return done(null, user)
                        }

                        // Tạo tài khoản mới từ thông tin Google
                        const newUser = new User({
                            email: email,
                            googleId: profile.id,
                            name: profile.displayName,
                            avatar: profile.photos?.[0]?.value,
                            isActive: true,
                            isVerified: true, // Email đã được xác thực bởi Google
                            password: '12345678', // Mật khẩu mặc định
                            status: 'active'
                        })

                        await newUser.save()
                        console.log('Created new user from Google profile:', newUser._id)
                        return done(null, newUser)
                    }
                    
                    // Nếu không có email, trả về lỗi
                    return done(new Error('No email provided by Google'), null)
                } catch (error) {
                    console.error('Error in Google authentication strategy:', error)
                    return done(error, null)
                }
            }
        )
    )

    // Cấu hình passport session
    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id)
            done(null, user)
        } catch (error) {
            done(error, null)
        }
    })

    //route admin
    routeAdmin(app)
    //route client
    routeClient(app)

    // Google Auth router
    app.use('/auth', googleAuthRouter)

    // API generate script
    app.use('/api/generate-script', generateScriptRouter)

    // Top Links API
    app.use('/api/top-links', topLinksRouter)

    // Public router for everyone
    app.use('/', publicRedirectRouter)

    // Not found handler
    app.use(notFoundHandler)

    // Error handler
    app.use(errorHandler)

    return app
}

export default createApp
