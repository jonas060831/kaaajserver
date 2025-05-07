import dotenv from 'dotenv'
// Load environment variables
dotenv.config()

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import routes from './routes'

export const app = express()
let server: ReturnType<typeof app.listen> | null = null

// Apply secure HTTP headers
app.use(helmet())

// Request logger
app.use(morgan('tiny'))

// Parse incoming JSON
app.use(express.json())

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Block malicious bots and scanners
app.use((req: Request, res: Response, next: NextFunction): void => {
  const forbiddenPatterns = [
    /\.env/, /\.git/, /php/i, /wp-config/i, /config/i,
    /secret/i, /credentials/i, /backup/i, /eval/i,
  ]
  const disallowedMethods = ['PROPFIND', 'TRACE']

  if (
    forbiddenPatterns.some((regex) => regex.test(req.url)) ||
    disallowedMethods.includes(req.method)
  ) {
    console.warn(`Blocked malicious request: ${req.method} ${req.url}`)
    res.status(403).send('Forbidden')
    return
  }

  next()
})

// CORS configuration
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins: string[] = [
      process.env.MAIN_SITE || 'http://localhost:5173',
      process.env.COMPANY_SITE || 'http://localhost:5174',
      process.env.DEVELOPMENT_SITE || 'http://localhost:5175',
    ]
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.send({ message: 'Welcome to KAAAJ API' })
})

// Mount routes
app.use('/api', routes)

// Start server only if not in test
if (process.env.NODE_ENV !== 'test') {
  import('./database').then(({ connectToDatabase }) => {
    connectToDatabase(process.env.MONGODB_URI!)
      .then(() => {
        const PORT = process.env.PORT || 4000
        server = app.listen(PORT, () => {
          console.log(`🚀 Server listening on PORT: ${PORT}`)
        })
      })
      .catch(err => {
        console.error('Database connection failed:', err)
      })
  })
}

export { server }
