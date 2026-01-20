// User Hook - React Hook pentru profil utilizator

'use client';

import { useState } from 'react';
import { userService } from '../services/UserService';
import { UserProfile, UpdateProfileDTO, UserServiceResult } from '../types';

export function useUser() {
  const [loading, setLoading] = useState(false);

  /**
   * Obține profilul utilizatorului curent
   */
  const getProfile = async (userId: string): Promise<UserServiceResult<UserProfile>> => {
    setLoading(true);
    try {
      return await userService.getProfile(userId);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizează profilul utilizatorului
   */
  const updateProfile = async (
    userId: string,
    updates: UpdateProfileDTO
  ): Promise<UserServiceResult> => {
    setLoading(true);
    try {
      return await userService.updateProfile(userId, updates);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Schimbă parola utilizatorului
   */
  const changePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<UserServiceResult> => {
    setLoading(true);
    try {
      return await userService.changePassword(userId, currentPassword, newPassword);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getProfile,
    updateProfile,
    changePassword,
  };
}
