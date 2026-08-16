import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

interface CustomError extends Error {
  statusCode?: number;
  kind?: string;
}

const errorHandler = (err: CustomError, req: Request, res: Response, _next: NextFunction): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (err.message && err.message.includes('duplicate key')) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default errorHandler;
