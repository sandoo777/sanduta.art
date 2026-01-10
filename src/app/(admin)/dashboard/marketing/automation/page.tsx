/**
 * Email Automation Management Page
 */

'use client';

import { useEffect, useState } from 'react';
import { Mail, Plus, Edit, Trash2, Power, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useMarketing, EmailAutomation, AutomationType, CreateAutomationInput, EMAIL_VARIABLES } from '@/modules/admin/useMarketing';

const automationTypeLabels: Record<AutomationType, string> = {
  WELCOME_SERIES: 'Serie Welcome',
  ABANDONED_CART: 'Coș Abandonat',
  ORDER_FOLLOW_UP: 'Follow-up Comandă',
  REVIEW_REQUEST: 'Cerere Review',
  REACTIVATION: 'Reactivare',
  BIRTHDAY: 'Aniversare',
  CAMPAIGN_TRIGGER: 'Trigger Campanie',
};

export default function AutomationPage() {
  const { fetchAutomations, createAutomation, updateAutomation, deleteAutomation, loading } = useMarketing();
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<EmailAutomation | null>(null);

  const [formData, setFormData] = useState<CreateAutomationInput>({
    name: '',
    type: 'WELCOME_SERIES',
    trigger: 'ACCOUNT_CREATED',
    subject: '',
    body: '',
    triggerDelay: 0,
  });

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    const data = await fetchAutomations();
    setAutomations(data);
  };

  const handleCreate = async () => {
    const result = await createAutomation(formData);
    if (result) {
      await loadAutomations();
      setShowDialog(false);
    }
  };

  const insertVariable = (varKey: string) => {
    setFormData({ ...formData, body: formData.body + `{{${varKey}}}` });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Automation</h1>
          <p className="mt-2 text-gray-600">Automatizează email-uri pentru clienți</p>
        </div>
        <Button variant="primary" onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Automatizare Nouă
        </Button>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {loading && <div className="text-center py-12 text-gray-500">Se încarcă...</div>}
        {!loading && automations.map((automation) => (
          <Card key={automation.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{automation.name}</h3>
                  <Badge>{automationTypeLabels[automation.type]}</Badge>
                  {automation.active ? (
                    <Badge variant="success">Activ</Badge>
                  ) : (
                    <Badge>Inactiv</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">Subiect: {automation.subject}</p>
                {automation.triggerDelay && automation.triggerDelay > 0 && (
                  <p className="text-xs text-gray-500">Trigger după: {automation.triggerDelay}h</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Power className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
            {(automation.sent || automation.opened || automation.clicked) && (
              <div className="grid grid-cols-4 gap-4 mt-4 border-t pt-4">
                <div>
                  <p className="text-xs text-gray-600">Trimise</p>
                  <p className="text-lg font-bold text-gray-900">{automation.sent || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Deschise</p>
                  <p className="text-lg font-bold text-blue-600">{automation.opened || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Click-uri</p>
                  <p className="text-lg font-bold text-green-600">{automation.clicked || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Conversii</p>
                  <p className="text-lg font-bold text-purple-600">{automation.converted || 0}</p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <Card className="w-full max-w-3xl m-4 p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Automatizare Nouă</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nume Automatizare"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as AutomationType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(automationTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Subiect Email"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              
              {/* Variables */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Variabile disponibile:</p>
                <div className="flex flex-wrap gap-2">
                  {EMAIL_VARIABLES.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => insertVariable(variable.key)}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                    >
                      {`{{${variable.key}}}`}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Conținut Email (HTML)"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                rows={10}
              />
              
              <input
                type="number"
                placeholder="Delay (ore)"
                value={formData.triggerDelay || 0}
                onChange={(e) => setFormData({ ...formData, triggerDelay: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                min="0"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDialog(false)}>Anulează</Button>
              <Button variant="primary" onClick={handleCreate} loading={loading}>Creează</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
