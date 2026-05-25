import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger/logger.js';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error: ${error.message}`);

  res.status(error.status || 500).json({
    error: error.message || 'Internal Server Error',
    path: req.path,
    timestamp: new Date().toISOString()
  });
};
