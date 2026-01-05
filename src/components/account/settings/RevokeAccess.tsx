'use client';

import { useState } from 'react';
import { useSecurity } from '@/modules/account/useSecurity';
import { signOut } from 'next-auth/react';
import {
  ExclamationTriangleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

export default function RevokeAccess() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const { revokeAllSessions } = useSecurity();

  const handleRevokeAll = async () => {
    setIsRevoking(true);
    
    try {
      await revokeAllSessions();
      
      // Sign out after short delay
      setTimeout(() => {
        signOut({ callbackUrl: '/' });
      }, 1000);
    } catch (error) {
      console.error('Error revoking access:', error);
      setIsRevoking(false);
    }
  };

  if (!showConfirm) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldExclamationIcon className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Revocă accesul</h3>
            <p className="text-sm text-gray-600">
              Închide toate sesiunile și deconectează-te de pe toate dispozitivele
            </p>
          </div>
        </div>

        <div className="mb-4 p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Atenție!</strong> Această acțiune va:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-red-800 list-disc list-inside">
            <li>Închide toate sesiunile active</li>
            <li>Te va deconecta de pe toate dispozitivele</li>
            <li>Vei trebui să te autentifici din nou</li>
          </ul>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Revocă tot accesul
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-red-200 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Confirmă revocare acces</h3>
        </div>

        <div className="p-4 bg-red-50 rounded-lg mb-4">
          <p className="text-sm text-red-900 font-medium mb-2">
            Ești sigur că vrei să revoci tot accesul?
          </p>
          <p className="text-sm text-red-800">
            Toate sesiunile active vor fi închise și vei fi deconectat imediat. 
            Vei trebui să te autentifici din nou pentru a accesa contul.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isRevoking}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          Anulează
        </button>
        <button
          onClick={handleRevokeAll}
          disabled={isRevoking}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {isRevoking ? 'Se procesează...' : 'Confirmă revocare'}
        </button>
      </div>
    </div>
  );
}
