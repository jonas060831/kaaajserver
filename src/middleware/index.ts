// src/middleware/index.ts
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface AuthenticatedRequest extends Request {
  user?: any //fix for now
}

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction):any => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or malformed.' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload

    req.user = decoded

    next()
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(403).json({ error: 'Token has expired.' })
    } else {
      res.status(401).json({ error: 'Invalid token.' })
    }
  }
}
