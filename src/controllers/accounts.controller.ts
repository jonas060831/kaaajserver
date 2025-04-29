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

const addNew = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {

    const { name } = req.body
    const newAccount = await models.Account.create({
        name: name,
        owner: req.user._id
    })

    const user = await models.User.findById(req.user._id)

    if(!user) return res.status(401).json({ error: 'Unauthorized' })

    // Update user's accounts
    user.accounts.list.push(newAccount._id);
    await user.save();

    res.json(newAccount)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

const accountById = async(req: AuthenticatedRequest, res: Response): Promise<any> => {

  try {
    const { accountId } = req.params

    const account = await models.Account.findById(accountId)

    if(!account) return res.status(404).json({ error: 'Account not found.' })

    //only the owner of the account can view its details
    if(!(account.owner.equals(req.user._id))) return res.status(403).json({ error: 'Unauthorized' })

    res.json(account)

  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}


export default {
  index,
  addNew,
  accountById
}
