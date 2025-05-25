import cors from 'cors'

export const corsOptions = {
    origin: '*',
    credentials: false,
}

const corsHandler = cors(corsOptions)

export default corsHandler
