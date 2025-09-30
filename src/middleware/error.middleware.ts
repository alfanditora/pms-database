import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error(error.stack); 

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: error.message || 'An unexpected error occurred.',
  });
};