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

export async function register({ avatar,ref, ...requestBody }) {
    if (avatar instanceof FileUpload) {
        requestBody.avatar = avatar.save('avatar')
    }

    requestBody.ref_code = requestBody.email.split('@')[0] + Math.floor(Math.random() * 10000) // Generate a unique ref_code

    let ref_by = null
    if(ref) {
        const referrer = await User.findOne({ref_code: ref})
        if(referrer) {
            ref_by = referrer._id
            requestBody.ref_by = ref_by

            await Referral.updateOne(
                {user_id: ref_by},
                {
                    $push: { user_ref: requestBody._id },
                    $inc: { total_earings: 0 } // Assuming you want to initialize total_earings
                },
                { upsert: true }
            )

            // cộng tiền
            await User.updateOne(
                { _id: ref_by },
                { $inc: { balance: 0 } } // Assuming you want to initialize balance increment
            )
        }
        
    }


    const user = new User(requestBody)


    await Referral.create({
        ref_link: `https://yourapp.com/register?ref=${requestBody.ref_code}`,
        user_id: user._id,
        user_ref: [],
        total_earings: 0
    })

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

export async function updateProfile(
    currentUser,
    {
        name,
        email,
        phone,
        full_name,
        first_name,
        avatar,
        address,
        birth_date,
        gender,
        balance,
        total_earned,
        method_withdraw,
        info_withdraw,
        ref_code,
        ref_by,
        status,
    }
) {
    currentUser.name = name
    currentUser.email = email
    currentUser.phone = phone
    currentUser.full_name = full_name
    currentUser.first_name = first_name
    currentUser.address = address
    currentUser.birth_date = birth_date
    currentUser.gender = gender
    currentUser.balance = balance
    currentUser.total_earned = total_earned
    currentUser.method_withdraw = method_withdraw
    currentUser.info_withdraw = info_withdraw
    currentUser.ref_code = ref_code
    currentUser.ref_by = ref_by
    currentUser.status = status

    if (avatar instanceof FileUpload) {
        if (currentUser.avatar) {
            FileUpload.remove(currentUser.avatar)
        }
        avatar = avatar.save('images')
        currentUser.avatar = avatar
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
