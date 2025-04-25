
import dotenv from 'dotenv'
// Load environment variables
dotenv.config()

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import routes from './routes'

export const app = express()
let server: ReturnType<typeof app.listen> | null = null

// Middlewares
app.use(morgan('tiny'))
app.use(express.json())

//bots malicious scanner guard
app.use((req: Request, res: Response, next: NextFunction): void => {
  const blacklist: string[] = [
    '.env', '.git', 'phpunit', 'eval-stdin.php',
    'php-cgi', 'index.php', 'think', 'actuator',
  ];

  if (blacklist.some((path) => req.url.includes(path))) {
    res.status(403).send('Forbidden');
    return;
  }

  next();
});

// cors
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

app.get('/', (req: Request, res: Response) => {
  res.send({ message: 'Welcome to KAAAJ API' })
})

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
