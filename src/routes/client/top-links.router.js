import { Router } from 'express'
import { getTopLinks } from '../../app/controllers/client/top-links.controller'

const router = Router()

// GET /api/top-links?period=week|month
router.get('/', getTopLinks)

export default router 