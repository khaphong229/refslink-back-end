import moment from 'moment'
import jwt from 'jsonwebtoken'
import { User } from '@/models'
import { cache, LOGIN_EXPIRE_IN, TOKEN_TYPE } from '@/configs'
import { FileUpload } from '@/utils/classes'
import { generateToken } from '@/utils/helpers'
import Referral from '@/models/client/referral'

export const tokenBlocklist = cache.create('token-block-list')

export async function checkValidLogin({ email, password }) {
    const user = await User.findOne({ email: email })
    if (user.status === 'inactive') return [false, 'Chưa xác nhận tài khoản qua email!']
    if (user) {
        const verified = user.verifyPassword(password)
        if (verified) {
            return [true, user]
        }
    }

    return [false, 'Email hoặc mật khẩu không đúng.']
}

export function authToken(user) {
    const accessToken = generateToken({ user_id: user._id }, TOKEN_TYPE.AUTHORIZATION, LOGIN_EXPIRE_IN)
    const decode = jwt.decode(accessToken)
    const expireIn = decode.exp - decode.iat
    return {
        access_token: accessToken,
        expire_in: expireIn,
        auth_type: 'Bearer Token',
    }
}

export async function register({ avatar,  ...requestBody }) {
    if (avatar instanceof FileUpload) {
        requestBody.avatar = avatar.save('avatar')
    }

    const user = new User(requestBody)
    if (!user.ref_code) {
        // user.ref_code = generateRefCode(user._id) // hoặc random string
        // const savedUser = await user.save()
    
    }


    return await user.save()
}

export async function blockToken(token) {
    const decoded = jwt.decode(token)
    const expiresIn = decoded.exp
    const now = moment().unix()
    await tokenBlocklist.set(token, 1, expiresIn - now)
}

export async function profile(userId) {
    const user = await User.findOne({ _id: userId })
    return user
}

export async function updateProfile(currentUser, data) {
    const updatableFields = [
        'name', 'phone', 'full_name', 'first_name', 'address',
        'birth_date', 'gender', 'balance', 'total_earned',
        'method_withdraw', 'info_withdraw', 'ref_code', 'ref_by', 'status'
    ]

    for (const field of updatableFields) {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            currentUser[field] = data[field]
        }
    }

    if (data.avatar instanceof FileUpload) {
        if (currentUser.avatar) {
            FileUpload.remove(currentUser.avatar)
        }
        const savedAvatar = data.avatar.save('images')
        currentUser.avatar = savedAvatar
    }

    await currentUser.save()
}



export async function linkEmail(user, newEmail) {
    const existingUser = await User.findOne({ email: newEmail })
    if (existingUser) {
        throw new Error('Email đã được liên kết với tài khoản khác.')
    }

    user.email = newEmail
    await user.save()

    return user
}
