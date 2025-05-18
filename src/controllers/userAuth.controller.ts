import { Request, Response, RequestHandler } from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import models from '../models'

import createTransporter from '../utils/nodeMailer'

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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { username, password, role, personal, account } = req.body;

    if (!username || !password || !role || !personal.firstName || !personal.lastName || !account.name) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!usernameRegex.test(username)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Invalid Email Address' });
    }

    const testedPassword: string[] | boolean = passwordRegex(password);
    if (testedPassword !== true) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: testedPassword });
    }

    const existingUser = await models.User.findOne({ username }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ error: 'Username already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await models.User.create(
      [{
        username,
        hashedPassword,
        role,
        personal,
        accounts: { list: [], default: null }
      }],
      { session }
    ).then(res => res[0])

    const newAccount = await models.Account.create(
      [{
        name: account.name,
        owner: user._id
      }],
      { session }
    ).then(res => res[0]);

    // Update user's accounts
    user.accounts.list.push(newAccount._id);
    user.accounts.default = newAccount._id;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    const payload = { username: user.username, _id: user.id, role: user.role };
    const token: string = jwt.sign(payload, jwtSecret || 'secret', { expiresIn: '30m' });

    res.status(201).json({ token });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Signup Error:', error);

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error occurred' });
    }
  }
};


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

const testEmail: RequestHandler = async (req: Request, res: Response): Promise<any> => {

  try {
    const email = req.body

    console.log(email)

    res.status(200).json({ message: "Email Sent via Nodemailer" })

  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

const signInNotificationEmail: RequestHandler = async (req: Request, res: Response): Promise<any> => {

  try {
    const { SignInNotificationEmail: signInNotificationEmail, signedInUserEmail } = req.body

    //use the transporter here
    const transporter = await createTransporter()

    await transporter.sendMail({
      from: `KAAAJ Support ${process.env.GOOGLE_EMAIL}`,
      to: signedInUserEmail,
      subject: 'Sign In Successful',
      html: signInNotificationEmail
    })


    res.status(200).json({ message: "Email Sent via Nodemailer" })

  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }



}



export default {
  index,
  signUp,
  signIn,
  testEmail,
  signInNotificationEmail
};
