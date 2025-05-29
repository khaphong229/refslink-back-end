import moment from 'moment'
import jwt from 'jsonwebtoken'
import {Admin} from '@/models'
import {cache, LOGIN_EXPIRE_IN, LINK_STATIC_URL, TOKEN_TYPE} from '@/configs'
import {FileUpload} from '@/utils/classes'
import {generateToken} from '@/utils/helpers'

export const tokenBlocklist = cache.create('token-block-list')

export async function checkValidLogin({email, password}) {
    const admin = await Admin.findOne({email: email})
    if (admin) {
        const verified = admin.verifyPassword(password)
        if (verified) {
            return admin
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
        requestBody.avatar = avatar.save('avatar')
    }

    const admin = new Admin(requestBody)
    return await admin.save()
}

export async function blockToken(token) {
    const decoded = jwt.decode(token)
    const expiresIn = decoded.exp
    const now = moment().unix()
    await tokenBlocklist.set(token, 1, expiresIn - now)
}

export async function profile(userId) {
    const admin = await Admin.findOne({_id: userId})
    admin.avatar = admin.avatar && LINK_STATIC_URL + admin.avatar
    return admin
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
