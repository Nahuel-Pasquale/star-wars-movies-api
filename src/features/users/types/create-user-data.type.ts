import { UserRole } from '../enums/user-role.enum.js';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role?: UserRole;
}