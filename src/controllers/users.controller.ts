import express, { Request, Response } from 'express'

const router = express.Router()

import models from '../models'

import { verifyToken, AuthenticatedRequest } from '../middleware'

const index = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {

    //list of all users
    const users = await models.User.find({}, 'username')


    res.json(users)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

const profile = async (req: AuthenticatedRequest, res: Response) : Promise<any> => {

  try {
    const { userId } = req.params

    //the userId from the params must match the authenticated user
    if(req.user._id !== userId) return res.status(403).json({ error: 'Unauthorized' })

    const user = await models.User.findById(userId).populate('accounts.list');

    if(!user) return res.status(404).json({ error: 'User not found.' })

    res.json({ user })

  } catch (error : any) {
    res.status(500).json({ error: error.message })
  }
}


export default {
 index,
 profile
}
