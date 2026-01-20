// User Domain - Types

import { User } from '@prisma/client';

export type { User };

export interface UserProfile extends User {
  _count?: {
    orders: number;
  };
}

export interface UpdateProfileDTO {
  name?: string;
  phone?: string;
  address?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface UserServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
