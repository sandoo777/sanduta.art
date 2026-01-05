'use client';

import { useEffect } from 'react';
import { useSecurity, SecurityActivityItem } from '@/modules/account/useSecurity';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import {
  LockClosedIcon,
  LockOpenIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function RecentActivity() {
  const { activity, loading, fetchActivity } = useSecurity();

  useEffect(() => {
    fetchActivity(30);
  }, []);

  const getActivityIcon = (type: string, success: boolean) => {
    if (!success) {
      return <XCircleIcon className="w-5 h-5 text-red-600" />;
    }

    switch (type) {
      case 'LOGIN':
        return <LockOpenIcon className="w-5 h-5 text-green-600" />;
      case 'LOGOUT':
        return <LockClosedIcon className="w-5 h-5 text-gray-600" />;
      case 'PASSWORD_CHANGE':
        return <LockClosedIcon className="w-5 h-5 text-blue-600" />;
      case 'TWO_FACTOR_ENABLED':
        return <ShieldCheckIcon className="w-5 h-5 text-green-600" />;
      case 'TWO_FACTOR_DISABLED':
        return <ShieldExclamationIcon className="w-5 h-5 text-orange-600" />;
      case 'SESSION_REVOKED':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'FAILED_LOGIN':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'NEW_DEVICE':
        return <ComputerDesktopIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string, success: boolean) => {
    if (!success) {
      return 'bg-red-50 border-red-200';
    }

    switch (type) {
      case 'LOGIN':
        return 'bg-green-50 border-green-200';
      case 'FAILED_LOGIN':
        return 'bg-red-50 border-red-200';
      case 'PASSWORD_CHANGE':
      case 'TWO_FACTOR_ENABLED':
        return 'bg-blue-50 border-blue-200';
      case 'TWO_FACTOR_DISABLED':
      case 'SESSION_REVOKED':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Activitate recentă</h3>
        <p className="text-sm text-gray-600">
          Istoric complet al activităților legate de securitatea contului tău
        </p>
      </div>

      {/* Activity List */}
      <div className="space-y-2">
        {activity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShieldCheckIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nu există activități recente</p>
          </div>
        ) : (
          activity.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border ${getActivityColor(item.type, item.success)} flex items-start gap-3`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(item.type, item.success)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 mb-1">
                  {item.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                  <span>
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                      locale: ro
                    })}
                  </span>
                  
                  {item.ipAddress && (
                    <span className="flex items-center gap-1">
                      <span className="text-gray-400">•</span>
                      {item.ipAddress}
                    </span>
                  )}
                  
                  {item.location && (
                    <span className="flex items-center gap-1">
                      <span className="text-gray-400">•</span>
                      {item.location}
                    </span>
                  )}
                </div>

                {item.userAgent && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {item.userAgent}
                  </p>
                )}
              </div>

              {!item.success && (
                <span className="flex-shrink-0 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                  Eșuat
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {activity.length > 0 && activity.some(a => !a.success) && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900 mb-1">
                Activitate suspectă detectată
              </p>
              <p className="text-sm text-red-800">
                Am detectat încercări eșuate de autentificare. Dacă nu ești tu, 
                schimbă-ți parola imediat și activează autentificarea în doi pași.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
