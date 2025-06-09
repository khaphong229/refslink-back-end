import express from 'express'
import { getTopLinks, getClientTopLinks } from '../../app/controllers/client/top-links.controller'
import requireAuthentications from '../../app/middleware/common/client/require-authentication'

const router = express.Router()

// Public route for all top links
router.get('/', getTopLinks)

// Protected route for client's top links
router.get('/my-links', requireAuthentications, getClientTopLinks)

export default router 