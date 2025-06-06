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

const search = async (req: Request, res: Response): Promise<any> => {
  const { role: queryRole } = req.query;

  try {
    //just getting all the display location that updated their location 
    if (queryRole) {
      const proprietors = await models.User.find({ role: queryRole }).populate("accounts.list");

      // Flatten all account lists from each user, filter those with a location
      const mergedAccountsWithLocation = proprietors.flatMap(user =>
        Array.isArray(user.accounts.list)
          ? user.accounts.list.filter((account: any) => account.location)
          : []
      );

      res.json(mergedAccountsWithLocation);
    } else {
      res.status(400).json({ error: "Missing role query parameter" }); //for now we dont have to require this later
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


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

const edit = async (req: AuthenticatedRequest, res: Response): Promise<any> => {

  try {
    const { accountId } = req.params

    //find via id
    const account = await models.Account.findById(accountId)

    if(!account) {
      res.status(404)
      throw new Error('Cannot find Account!')
    }

    //check permission
    if(!account.owner.equals(req.user._id)) return res.status(403).send("Unauthorized!")

    //TODO if location is being edited use get its longitude and latitude as well
    if(req.body.location) {
      //googles geo location
    }

    //permission granted
    const updatedAccount = await models.Account.findByIdAndUpdate(
      accountId,
      req.body,
      { new: true }
    )

    res.status(200).json(updatedAccount)

  } catch (error: any) {
    res.statusCode === 404 ? res.json({ error: error.message }) : res.json({ error: error.message })
  }

}


export default {
  index,
  addNew,
  search,
  accountById,
  edit
}
