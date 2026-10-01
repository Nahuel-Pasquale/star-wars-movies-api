import { AuthenticatedUser } from '../../features/auth/types/authenticated-user.type.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};