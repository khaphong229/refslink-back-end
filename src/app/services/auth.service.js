import moment from 'moment'
import jwt from 'jsonwebtoken'
import {User} from '@/models'
import {cache, LOGIN_EXPIRE_IN, LINK_STATIC_URL, TOKEN_TYPE} from '@/configs'
import {FileUpload} from '@/utils/classes'
import {generateToken} from '@/utils/helpers'

export const tokenBlocklist = cache.create('token-block-list')

export async function checkValidLogin({email, password}) {
    const user = await User.findOne({email: email})

    if (user) {
        const verified = user.verifyPassword(password)
        if (verified) {
            return user
        }
    }

    return false
}

export function authToken(user) {
    const accessToken = generateToken({user_id: user._id}, TOKEN_TYPE.AUTHORIZATION, LOGIN_EXPIRE_IN)
    const decode = jwt.decode(accessToken)
    const expireIn = decode.exp - decode.iat
    return {
        access_token: accessToken,
        expire_in: expireIn,
        auth_type: 'Bearer Token',
    }
}

export async function register({avatar, ...requestBody}) {
    if (avatar instanceof FileUpload) {
        requestBody.avatar = avatar.save()
    }

    const user = new User(requestBody)
    return await user.save()
}

export async function blockToken(token) {
    const decoded = jwt.decode(token)
    const expiresIn = decoded.exp
    const now = moment().unix()
    await tokenBlocklist.set(token, 1, expiresIn - now)
}

export async function profile(userId) {
    const user = await User.findOne({_id: userId})
    user.avatar = user.avatar && LINK_STATIC_URL + user.avatar
    return user
}

export async function updateProfile(currentUser, {name, email, phone, avatar}) {
    currentUser.name = name
    currentUser.email = email
    currentUser.phone = phone
    if (avatar instanceof FileUpload) {
        if (currentUser.avatar) {
            FileUpload.remove(currentUser.avatar)
        }
        avatar = avatar.save('images')
        currentUser.avatar = avatar
    }

    await currentUser.save()
}
