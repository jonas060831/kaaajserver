import express,{ Request, Response, RequestHandler } from 'express'

import { verifyToken, AuthenticatedRequest } from '../middleware'

import models from '../models'

const router = express.Router()

const index = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {

    //list of all users
    const accounts = await models.Account.find({})
    res.json(accounts)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}




export default {
  index
}
