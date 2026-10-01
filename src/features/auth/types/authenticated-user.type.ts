import { UserRole } from '../../users/enums/user-role.enum.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}