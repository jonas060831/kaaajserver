import express from 'express'
import controllers from '../controllers/'

const router = express.Router()

router.get('/', controllers.userAuth.index)
router.post('/signup', controllers.userAuth.signUp)
router.post('/signin', controllers.userAuth.signIn)

export default router
