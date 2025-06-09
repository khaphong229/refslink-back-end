export const generateRefCode = (userId) => {
    const userIdStr = userId.toString().slice(-4)

    const randomLetters = Array.from({ length: 4 }, () =>
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('')

    return `${randomLetters}${userIdStr}`.toUpperCase()
}
