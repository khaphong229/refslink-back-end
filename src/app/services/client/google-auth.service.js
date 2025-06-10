import User from '@/models/client/user'
import { authToken } from './auth.service'
import bcrypt from 'bcrypt'

export async function findOrCreateGoogleUser(profile) {
    try {
        console.log('Processing Google profile:', profile)
        
        // Tìm user theo googleId
        let user = await User.findOne({ googleId: profile.id })
        
        if (user) {
            console.log('Found existing user by googleId:', user._id)
            return { user, isNewUser: false }
        }
        
        // Tìm theo email nếu có
        if (profile.emails && profile.emails.length > 0) {
            const email = profile.emails[0].value
            user = await User.findOne({ email })
            
            if (user) {
                // Kiểm tra status của user
                if (user.status === 'active') {
                    console.log('Found active user by email, updating googleId:', user._id)
                    user.googleId = profile.id
                    await user.save()
                    return { user, isNewUser: false }
                } else {
                    throw new Error('Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt tài khoản.')
                }
            }
        }
        
        // Nếu không tìm thấy user, trả về thông tin profile để thông báo đăng ký
        return {
            profile: {
                googleId: profile.id,
                email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
                name: profile.displayName,
                full_name: profile.displayName,
                first_name: profile.name?.givenName || '',
                avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
            },
            isNewUser: true
        }
    } catch (error) {
        console.error('Error in findOrCreateGoogleUser:', error)
        throw error
    }
}

export async function registerWithGoogle(profileData) {
    try {
        console.log('Registering new user with Google profile:', profileData)
        
        // Kiểm tra xem email đã tồn tại chưa
        if (profileData.email) {
            const existingUser = await User.findOne({ email: profileData.email })
            if (existingUser) {
                throw new Error('Email đã được sử dụng bởi tài khoản khác')
            }
        }

        // Tạo password ngẫu nhiên cho tài khoản Google
        const randomPassword = Math.random().toString(36).slice(-8)
        const hashedPassword = await bcrypt.hash(randomPassword, 10)

        // Tạo user mới
        const newUser = new User({
            googleId: profileData.googleId,
            email: profileData.email,
            name: profileData.name,
            full_name: profileData.full_name,
            first_name: profileData.first_name,
            status: 'active', // Tài khoản Google được xác thực nên có thể active ngay
            avatar: profileData.avatar,
            password: hashedPassword // Thêm password đã hash
        })
        
        await newUser.save()
        console.log('Created new user:', newUser._id)
        
        return {
            user: newUser,
            token: authToken(newUser)
        }
    } catch (error) {
        console.error('Error in registerWithGoogle:', error)
        throw error
    }
} 