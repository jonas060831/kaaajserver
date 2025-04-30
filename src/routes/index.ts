import express from 'express'
import userAuthRoutes from './userAuth'
import usersRoutes from './users'
import accountsRoutes from './accounts'

const router = express.Router()

router.use('/auth', userAuthRoutes)
router.use('/users', usersRoutes)
router.use('/accounts', accountsRoutes)

export default router
