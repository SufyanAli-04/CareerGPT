import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({ message: 'Not authorized, user not found' });
      return;
    }

    if (user.suspended) {
      res.status(403).json({ message: 'Not authorized, account is suspended' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.userRole === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: admin credentials required' });
  }
};

export default protect;
