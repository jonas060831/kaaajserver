import dotenv from 'dotenv'
// use env variables
dotenv.config()
import mongoose from 'mongoose'
import cors from 'cors'
import express, { Request, Response } from 'express'
import morgan from 'morgan'
import { connectToDatabase } from './database'

import routes from './routes'

export const app = express();

const PORT = process.env.PORT || 4000;

//Connect to database
connectToDatabase()


// middlewares
app.use(morgan('tiny')) //logger
app.use(express.json())
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {

    //allowed origins array
    const allowedOrigins: string[] = [
      process.env.MAIN_SITE || 'http://localhost:5173',
      process.env.COMPANY_SITE || 'http://localhost:5174'
    ]

    if(!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))


app.get('/', (req: Request, res: Response) => { res.send({message: 'Welcome to KAAAJ API'})})


app.use('/api', routes)

// Only listen once and export the server
export const server = app.listen(PORT, () =>  {
  console.log(`🚀 Server listening on PORT: ${PORT}`);
});
