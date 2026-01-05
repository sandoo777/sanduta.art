import { Metadata } from 'next';
import NotificationsList from '@/components/account/notifications/NotificationsList';

export const metadata: Metadata = {
  title: 'Notificări - Sanduta.art',
  description: 'Gestionează notificările tale'
};

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notificări</h1>
        <p className="text-gray-600">Vizualizează și gestionează toate notificările tale</p>
      </div>

      <NotificationsList />
    </div>
  );
}
