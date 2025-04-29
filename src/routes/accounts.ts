import express from 'express'
import controllers from '../controllers/'
import { verifyToken } from '../middleware'

const router = express.Router()

router.get('/', verifyToken, controllers.accounts.index)
router.post('/', verifyToken, controllers.accounts.addNew)
router.get('/:accountId', verifyToken, controllers.accounts.accountById)

export default router
