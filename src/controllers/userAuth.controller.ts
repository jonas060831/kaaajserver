import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import models from '../models'

import { usernameRegex, passwordRegex } from '../helpers/regex'

// Define saltRounds as a number or undefined, use parseInt with fallback
const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;

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

const signUp = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password, role } = req.body;

    // TODO: Validate input (ensure fields are not empty)
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if(!usernameRegex.test(username)) return res.status(400).json({ error: 'Invalid Email Address' })

    //i need to find a way where i can call a function and throw the specific error base on that string if it pass or fails

    const testedPassword :string[] | boolean = passwordRegex(password); // returns string | boolean

    if(testedPassword !== true) {
      return res.status(400).json({ error: testedPassword })
    }
    // Check if the user exists
    const existingUser = await models.User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken.' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user if there's no existing data
    const user = await models.User.create({
      username,
      hashedPassword,
      role,
    });

    //payload
    const payload = { username: user.username, _id: user.id, role: user.role }

    // Ensure that JWT_SECRET is defined before using it
    const jwtSecret = process.env.JWT_SECRET;

    //create the token
    const token :string = jwt.sign({ payload }, jwtSecret || 'secret', { expiresIn: '1d' })

    // send the token
    res.status(201).json({ token });

  } catch (error) {
    // Improved error handling with type assertion
    console.error('Signup Error:', error);

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error occurred' });
    }
  }
}

export default {
  index,
  signUp,
};
