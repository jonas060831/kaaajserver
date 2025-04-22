import express from 'express'
import userAuthRoutes from './userAuth'
import usersRoutes from './users'

const router = express.Router()

router.use('/auth', userAuthRoutes)
router.use('/users', usersRoutes)

export default router
