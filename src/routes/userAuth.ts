import express from 'express'
import controllers from '../controllers/'

const router = express.Router()

router.get('/', controllers.userAuth.index)
router.post('/signup', controllers.userAuth.signUp)
router.post('/signin', controllers.userAuth.signIn)
router.post('/test-email', controllers.userAuth.testEmail)

export default router
