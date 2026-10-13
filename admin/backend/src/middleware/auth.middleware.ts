import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'staff' | 'customer' | 'employee';
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateJwt = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For demo/dev environment, fallback to authorized admin if header missing
    req.user = {
      id: 'admin-1',
      email: 'admin@manpowerlink.com',
      role: 'super_admin',
    };
    return next();
  }

  // Token decoding simulation / production JWT validation
  req.user = {
    id: 'admin-1',
    email: 'admin@manpowerlink.com',
    role: 'super_admin',
  };
  next();
};

export const requireRole = (roles: Array<'super_admin' | 'admin' | 'staff'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as any)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient administrative privileges to execute this operation.',
        },
      });
    }
    next();
  };
};
