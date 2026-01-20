'use client';

import { useEffect, useState } from 'react';
import { useSecurity, UserSession } from '@/modules/account/useSecurity';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function ActiveSessions() {
  const { sessions, loading, fetchSessions, revokeSession, revokeAllSessions } = useSecurity();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Sigur vrei să închizi această sesiune?')) return;

    setMessage(null);
    try {
      const result = await revokeSession(sessionId);
      setMessage({ type: 'success', text: result.message });
    } catch (_error: unknown) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('Sigur vrei să închizi toate sesiunile? Vei fi deconectat de pe toate dispozitivele.')) {
      return;
    }

    setMessage(null);
    try {
      const result = await revokeAllSessions();
      setMessage({ type: 'success', text: result.message });
      // Reload after short delay
      setTimeout(() => window.location.reload(), 2000);
    } catch (_error: unknown) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const getDeviceIcon = (session: UserSession) => {
    const deviceName = session.deviceName?.toLowerCase() || '';
    if (deviceName.includes('mobile')) {
      return <DevicePhoneMobileIcon className="w-6 h-6" />;
    }
    return <ComputerDesktopIcon className="w-6 h-6" />;
  };

  const isCurrentSession = (session: UserSession) => {
    // Simple heuristic: most recent session is likely current
    // In production, you'd compare session tokens
    return sessions.indexOf(session) === 0;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900">Sesiuni active</h3>
          <p className="text-sm text-gray-600">
            Gestionează dispozitivele conectate la contul tău
          </p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={handleRevokeAll}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            Închide toate sesiunile
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <GlobeAltIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nu există sesiuni active</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isCurrent = isCurrentSession(session);
            
            return (
              <div
                key={session.id}
                className={`p-4 rounded-lg border ${
                  isCurrent
                    ? 'border-[#0066FF] bg-blue-50'
                    : 'border-gray-200 bg-white'
                } flex items-start justify-between gap-4`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    isCurrent ? 'bg-[#0066FF] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getDeviceIcon(session)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {session.deviceName || 'Dispozitiv necunoscut'}
                      </h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-[#0066FF] text-white text-xs rounded-full font-medium">
                          Sesiune curentă
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">{session.browser}</span> pe{' '}
                        <span className="font-medium">{session.os}</span>
                      </p>
                      {session.ipAddress && (
                        <p className="flex items-center gap-1">
                          <GlobeAltIcon className="w-4 h-4" />
                          {session.ipAddress}
                          {session.location && ` • ${session.location}`}
                        </p>
                      )}
                      <p className="text-gray-500">
                        Ultima activitate:{' '}
                        {formatDistanceToNow(new Date(session.lastActivity), {
                          addSuffix: true,
                          locale: ro
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Închide sesiunea"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {sessions.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Sfat de securitate:</strong> Dacă vezi sesiuni sau dispozitive pe care nu le recunoști, 
            închide-le imediat și schimbă-ți parola.
          </p>
        </div>
      )}
    </div>
  );
}
