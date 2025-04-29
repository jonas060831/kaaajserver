import express from 'express'
import controllers from '../controllers/'
import { verifyToken } from '../middleware'

const router = express.Router()

router.get('/', verifyToken, controllers.accounts.index)

export default router
