import express from 'express'
import controllers from '../controllers/'
import { verifyToken } from '../middleware'

const router = express.Router()

router.get('/', verifyToken, controllers.users.index)
router.get('/:userId', verifyToken, controllers.users.profile)

export default router
