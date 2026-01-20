import { useState } from 'react';

export interface UserSession {
  id: string;
  deviceName: string | null;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  location: string | null;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
}

export interface SecurityActivityItem {
  id: string;
  type: string;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  location: string | null;
  success: boolean;
  createdAt: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  otpauthUrl: string;
}

export function useSecurity() {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [activity, setActivity] = useState<SecurityActivityItem[]>([]);
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null);

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/account/security/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      return { success: true, message: data.message };
    } catch (_error) {
      console.error('Error changing password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generate2FA = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/account/security/2fa/generate', {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate 2FA');
      }

      setTwoFactorSetup(data);
      return data;
    } catch (_error) {
      console.error('Error generating 2FA:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const enable2FA = async (secret: string, code: string, backupCodes: string[]) => {
    setLoading(true);
    try {
      const response = await fetch('/api/account/security/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, code, backupCodes })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enable 2FA');
      }

      setTwoFactorSetup(null);
      return { success: true, message: data.message };
    } catch (_error) {
      console.error('Error enabling 2FA:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async (code: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/account/security/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA');
      }

      return { success: true, message: data.message };
    } catch (_error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/account/security/sessions');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sessions');
      }

      setSessions(data.sessions);
      return data.sessions;
    } catch (_error) {
      console.error('Error fetching sessions:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/account/security/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke session');
      }

      // Remove from local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      return { success: true, message: data.message };
    } catch (_error) {
      console.error('Error revoking session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const revokeAllSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/account/security/sessions/revoke-all', {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke all sessions');
      }

      setSessions([]);
      return { success: true, message: data.message };
    } catch (_error) {
      console.error('Error revoking all sessions:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async (limit = 20) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/account/security/activity?limit=${limit}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch activity');
      }

      setActivity(data.activities);
      return data.activities;
    } catch (_error) {
      console.error('Error fetching activity:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    sessions,
    activity,
    twoFactorSetup,
    changePassword,
    generate2FA,
    enable2FA,
    disable2FA,
    fetchSessions,
    revokeSession,
    revokeAllSessions,
    fetchActivity
  };
}
