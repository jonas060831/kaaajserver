import { Request, Response, RequestHandler } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import models from '../models'

import { usernameRegex, passwordRegex } from '../helpers/regex'

// Define saltRounds as a number or undefined, use parseInt with fallback
const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;
// Ensure that JWT_SECRET is defined before using it
const jwtSecret = process.env.JWT_SECRET;

const index = async (req: Request, res: Response): Promise<void> => {
  try {
    const allUsers = await models.User.find({});
    res.status(200).send(allUsers);
  } catch (error) {
    // Using the type `unknown` for better safety before asserting
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error occurred' });
    }
  }
};

const signUp: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password, role, personal, account } = req.body;

    //console.log('Full body:', JSON.stringify(req.body, null, 2))

    // Validate input
    if (!username || !password || !role || !personal || !personal.firstName || !personal.lastName || !personal.middleName || !account.name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Invalid Email Address' });
    }

    const testedPassword: string[] | boolean = passwordRegex(password);
    if (testedPassword !== true) {
      return res.status(400).json({ error: testedPassword });
    }

    // Check if the user exists
    const existingUser = await models.User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user
    const user = await models.User.create({
      username,
      hashedPassword,
      role,
      personal
    });

    // Create the first account for this user
    const newAccount = await models.Account.create({
      name: account.name,
      owner: user._id
    });

    // Add the account to the user's accounts array
    await user.accounts.push(newAccount._id);
    await user.save(); // Save again after updating accounts a

    // Create the token payload
    const payload = { username: user.username, _id: user.id, role: user.role };

    // Create the JWT token
    const token: string = jwt.sign(payload, jwtSecret || 'secret', { expiresIn: '30m' });

    // Send the token
    res.status(201).json({ token });

  } catch (error) {
    console.error('Signup Error:', error);

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error occurred' });
    }
  }
}


const signIn = async (req: Request, res: Response): Promise<any> => {
  try {
      const { username, password } = req.body

      const user = await models.User.findOne({ username })

      if(!user) return res.status(401).json({ error: 'Invalid credentials.' })

      //there is a match check the password if its correct using bcrypt
      const isPasswordCorrect = bcrypt.compareSync(password, user.hashedPassword)

      //incorrect password
      if(!isPasswordCorrect) return res.status(401).json({error: 'Invalid credentials.' })

      //construct the payload
      const payload = { username: user.username, _id: user.id, role: user.role }

      //create the token
      const token :string = jwt.sign(payload , jwtSecret || 'secret', { expiresIn: '1h' })

      res.status(200).json({ token })

  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export default {
  index,
  signUp,
  signIn
};
