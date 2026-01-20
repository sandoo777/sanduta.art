// User Service - Business Logic

import { prisma } from '@/lib/prisma';
import { UserProfile, UpdateProfileDTO, UserServiceResult } from '../types';
import { logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';

export class UserService {
  async getProfile(userId: string): Promise<UserServiceResult<UserProfile>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: { orders: true },
          },
        },
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, data: user };
    } catch (error) {
      logger.error('UserService', 'Failed to fetch profile', { error, userId });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
      };
    }
  }

  async updateProfile(
    userId: string,
    updates: UpdateProfileDTO
  ): Promise<UserServiceResult> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updates,
      });

      logger.info('UserService', 'Profile updated', { userId });

      return { success: true, data: user };
    } catch (error) {
      logger.error('UserService', 'Failed to update profile', { error, userId });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<UserServiceResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.password) {
        return { success: false, error: 'User not found' };
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      logger.info('UserService', 'Password changed', { userId });

      return { success: true };
    } catch (error) {
      logger.error('UserService', 'Failed to change password', { error, userId });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change password',
      };
    }
  }
}

export const userService = new UserService();
