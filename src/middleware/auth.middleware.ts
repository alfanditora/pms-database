import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET must be defined in your .env file');
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'Authorization header with Bearer token is required'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Token is required'
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret);
    
    (req as any).user = decoded;

    next();
  } catch (error) {
    if ((error as Error).name === 'TokenExpiredError') {
      res.status(401).json({
        status: 'error',
        message: 'Token expired'
      });
      return;
    }

    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
      return;
    }
    
    if (user.privillege !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin only.'
      });
      return;
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

export const operationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
      return;
    }

    if (user.privillege !== 'OPERATION' && user.privillege !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. Operation or Admin only.'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};