import express from 'express'
import userAuthRoutes from './userAuth'

const router = express.Router()

router.use('/auth', userAuthRoutes)

export default router
