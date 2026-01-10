'use client';

import { useState } from 'react';
import { NotificationType, getNotificationTypeName } from '@/lib/notifications/notificationTypes';
import { Button, Input, Card } from '@/components/ui';
import { X, Send, AlertTriangle } from 'lucide-react';

interface SendNotificationModalProps {
  orderId: string;
  customerEmail: string;
  customerName: string;
  onClose: () => void;
  onSent?: () => void;
}

export default function SendNotificationModal({
  orderId,
  customerEmail,
  customerName,
  onClose,
  onSent,
}: SendNotificationModalProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Predefined notification types for order issues
  const issueTypes = [
    {
      type: 'admin_order_issue',
      label: 'Problemă Comandă',
      templates: [
        {
          id: 'missing_file',
          label: 'Lipsă fișier',
          subject: 'Lipsă fișier pentru comanda {{orderNumber}}',
          message: 'Bună {{customerName}},\n\nNu am găsit fișierul pentru comanda ta #{{orderNumber}}. Te rugăm să îl încarci în contul tău.\n\nCu stimă,\nEchipa Sanduta.art',
        },
        {
          id: 'invalid_file',
          label: 'Fișier invalid',
          subject: 'Fișier invalid pentru comanda {{orderNumber}}',
          message: 'Bună {{customerName}},\n\nFișierul încărcat pentru comanda #{{orderNumber}} este invalid sau corupt. Te rugăm să încarci din nou fișierul.\n\nCu stimă,\nEchipa Sanduta.art',
        },
        {
          id: 'low_resolution',
          label: 'Rezoluție prea mică',
          subject: 'Rezoluție prea mică pentru comanda {{orderNumber}}',
          message: 'Bună {{customerName}},\n\nFișierul pentru comanda #{{orderNumber}} are rezoluție prea mică pentru calitate optimă. Recomandăm minim 300 DPI. Vrei să continuăm oricum sau încarci un fișier cu rezoluție mai mare?\n\nCu stimă,\nEchipa Sanduta.art',
        },
        {
          id: 'confirm_mockup',
          label: 'Confirmare machetă necesară',
          subject: 'Confirmă macheta pentru comanda {{orderNumber}}',
          message: 'Bună {{customerName}},\n\nÎnainte de a începe producția pentru comanda #{{orderNumber}}, te rugăm să confirmi macheta. Poți vizualiza macheta în contul tău.\n\nCu stimă,\nEchipa Sanduta.art',
        },
        {
          id: 'custom',
          label: 'Mesaj personalizat',
          subject: '',
          message: '',
        },
      ],
    },
  ];

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    
    if (template.id === 'custom') {
      setCustomSubject('');
      setCustomMessage('');
    } else {
      setCustomSubject(renderTemplate(template.subject));
      setCustomMessage(renderTemplate(template.message));
    }
  };

  const renderTemplate = (template: string) => {
    return template
      .replace(/{{orderNumber}}/g, orderId)
      .replace(/{{customerName}}/g, customerName)
      .replace(/{{customerEmail}}/g, customerEmail);
  };

  const handleSend = async () => {
    if (!selectedTemplate) {
      setError('Selectează un tip de notificare');
      return;
    }

    if (!customSubject || !customMessage) {
      setError('Completează subiectul și mesajul');
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Send email notification
      const emailRes = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customerEmail,
          subject: customSubject,
          message: customMessage,
          type: 'admin_order_issue',
          metadata: {
            orderId,
            template: selectedTemplate.id,
          },
        }),
      });

      if (!emailRes.ok) {
        throw new Error('Failed to send email');
      }

      // Send in-app notification
      const inAppRes = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: customerEmail, // In production, get userId from email
          type: 'admin_order_issue',
          title: customSubject,
          message: customMessage,
          actionUrl: `/orders/${orderId}`,
          actionLabel: 'Vezi Comanda',
        }),
      });

      if (!inAppRes.ok) {
        console.error('Failed to send in-app notification');
      }

      onSent?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to send notification:', err);
      setError('Eroare la trimiterea notificării. Încearcă din nou.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Trimite Notificare
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Către: <strong>{customerName}</strong> ({customerEmail})
              </p>
              <p className="text-sm text-gray-600">
                Comandă: <strong>#{orderId}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Template Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selectează Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {issueTypes[0].templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-4 text-left border-2 rounded-lg transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900 mb-1">
                    {template.label}
                  </div>
                  {template.id !== 'custom' && (
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {template.message.substring(0, 60)}...
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Subject */}
          {selectedTemplate && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subiect Email *
              </label>
              <Input
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="ex: Problemă cu comanda #ORD-12345"
                required
              />
            </div>
          )}

          {/* Custom Message */}
          {selectedTemplate && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mesaj *
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Scrie mesajul aici..."
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Mesajul va fi trimis prin email și ca notificare in-app
              </p>
            </div>
          )}

          {/* Preview Box */}
          {selectedTemplate && customMessage && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Preview:</h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                <strong>Subject:</strong> {customSubject}
                <div className="mt-2" />
                {customMessage}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={sending}
            >
              Anulează
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              loading={sending}
              disabled={!selectedTemplate || sending}
            >
              <Send className="w-4 h-4 mr-1" />
              Trimite Notificare
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
