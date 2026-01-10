'use client';

import { useState, useEffect } from 'react';
import { 
  NotificationType, 
  NotificationChannel, 
  NotificationTemplate,
  TemplateVariables,
  getNotificationTypeName 
} from '@/lib/notifications/notificationTypes';
import { Button, Input, Card, SectionTitle, Badge } from '@/components/ui';
import { Save, Eye, X, Plus, Edit2, Trash2 } from 'lucide-react';

export default function NotificationTemplatesPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/notifications/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (template: NotificationTemplate) => {
    try {
      const res = await fetch(`/api/notifications/templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      if (res.ok) {
        await fetchTemplates();
        setIsEditing(false);
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Sigur doriți să ștergeți acest template?')) return;

    try {
      const res = await fetch(`/api/notifications/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchTemplates();
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const renderVariablesList = (type: NotificationType) => {
    const variables = TemplateVariables[type] || [];
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Variabile Disponibile
        </h4>
        <div className="space-y-2">
          {variables.map((variable) => (
            <div key={variable.key} className="flex items-start gap-2">
              <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 font-mono text-indigo-600">
                {`{{${variable.key}}}`}
              </code>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">
                  {variable.label}
                  {variable.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {variable.description}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Ex: {variable.example}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Template-uri Notificări
          </h1>
          <p className="text-gray-600">
            Personalizează template-urile pentru notificări email și in-app
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates List */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Template-uri
                </h2>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsEditing(true);
                    setSelectedTemplate(null);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Nou
                </Button>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-indigo-300 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsEditing(false);
                      setPreviewMode(false);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getNotificationTypeName(template.type)}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            value={template.channel}
                            className="text-xs"
                          />
                          {template.autoSend && (
                            <Badge
                              value="Auto"
                              className="text-xs bg-green-100 text-green-800"
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template);
                            setIsEditing(true);
                          }}
                          className="p-1 text-gray-400 hover:text-indigo-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {templates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Nu există template-uri</p>
                    <p className="text-xs mt-1">Creează primul template</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Template Editor/Preview */}
          <div className="lg:col-span-2">
            {selectedTemplate || isEditing ? (
              <TemplateEditor
                template={selectedTemplate}
                isEditing={isEditing}
                previewMode={previewMode}
                onSave={handleSaveTemplate}
                onCancel={() => {
                  setIsEditing(false);
                  setPreviewMode(false);
                  setSelectedTemplate(null);
                }}
                onTogglePreview={() => setPreviewMode(!previewMode)}
                onEdit={() => setIsEditing(true)}
                renderVariablesList={renderVariablesList}
              />
            ) : (
              <Card className="p-8 text-center">
                <div className="text-gray-400">
                  <Eye className="w-12 h-12 mx-auto mb-3" />
                  <p className="text-sm">Selectează un template pentru a-l vizualiza</p>
                  <p className="text-xs mt-1">sau creează unul nou</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TEMPLATE EDITOR COMPONENT
// ==========================================

interface TemplateEditorProps {
  template: NotificationTemplate | null;
  isEditing: boolean;
  previewMode: boolean;
  onSave: (template: NotificationTemplate) => void;
  onCancel: () => void;
  onTogglePreview: () => void;
  onEdit: () => void;
  renderVariablesList: (type: NotificationType) => React.ReactNode;
}

function TemplateEditor({
  template,
  isEditing,
  previewMode,
  onSave,
  onCancel,
  onTogglePreview,
  onEdit,
  renderVariablesList,
}: TemplateEditorProps) {
  const [formData, setFormData] = useState<Partial<NotificationTemplate>>(
    template || {
      type: 'order_placed' as NotificationType,
      channel: NotificationChannel.EMAIL,
      name: '',
      enabled: true,
      autoSend: false,
      emailSubject: '',
      emailBodyHtml: '',
      emailBodyText: '',
      inAppTitle: '',
      inAppMessage: '',
      inAppIcon: 'Bell',
      inAppIconColor: 'indigo',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const templateData: NotificationTemplate = {
      id: template?.id || `tpl_${Date.now()}`,
      type: formData.type!,
      channel: formData.channel!,
      name: formData.name!,
      description: formData.description,
      emailSubject: formData.emailSubject,
      emailBodyHtml: formData.emailBodyHtml,
      emailBodyText: formData.emailBodyText,
      inAppTitle: formData.inAppTitle,
      inAppMessage: formData.inAppMessage,
      inAppIcon: formData.inAppIcon,
      inAppIconColor: formData.inAppIconColor,
      inAppActionUrl: formData.inAppActionUrl,
      inAppActionLabel: formData.inAppActionLabel,
      smsBody: formData.smsBody,
      variables: TemplateVariables[formData.type!] || [],
      enabled: formData.enabled!,
      autoSend: formData.autoSend!,
      createdAt: template?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(templateData);
  };

  if (previewMode && template) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Preview: {template.name}
          </h2>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onTogglePreview}>
              <X className="w-4 h-4 mr-1" />
              Închide
            </Button>
            <Button variant="primary" onClick={onEdit}>
              <Edit2 className="w-4 h-4 mr-1" />
              Editează
            </Button>
          </div>
        </div>

        {template.channel === NotificationChannel.EMAIL && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Subject:</label>
              <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200">
                {template.emailSubject}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Body (HTML):</label>
              <div
                className="mt-1 p-4 bg-white rounded border border-gray-200 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: template.emailBodyHtml || '' }}
              />
            </div>
          </div>
        )}

        {template.channel === NotificationChannel.IN_APP && (
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full bg-${template.inAppIconColor}-100`}>
                  <div className={`w-5 h-5 text-${template.inAppIconColor}-600`}>
                    🔔
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {template.inAppTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {template.inAppMessage}
                  </p>
                  {template.inAppActionLabel && (
                    <button className="text-sm text-indigo-600 font-medium mt-2">
                      {template.inAppActionLabel} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {renderVariablesList(template.type)}
      </Card>
    );
  }

  if (!isEditing && template) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {template.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {getNotificationTypeName(template.type)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onTogglePreview}>
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button variant="primary" onClick={onEdit}>
              <Edit2 className="w-4 h-4 mr-1" />
              Editează
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Canal</label>
              <div className="mt-1">
                <Badge value={template.channel} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <Badge
                  value={template.enabled ? 'Activ' : 'Inactiv'}
                  className={template.enabled ? 'bg-green-100 text-green-800' : ''}
                />
              </div>
            </div>
          </div>

          {template.description && (
            <div>
              <label className="text-sm font-medium text-gray-700">Descriere</label>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            </div>
          )}

          {renderVariablesList(template.type)}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {template ? 'Editează Template' : 'Template Nou'}
          </h2>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" />
              Anulează
            </Button>
            <Button type="submit" variant="primary">
              <Save className="w-4 h-4 mr-1" />
              Salvează
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nume Template *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="ex: Email Comandă Plasată"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tip Notificare *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as NotificationType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {Object.entries(TemplateVariables).map(([key, _]) => (
                  <option key={key} value={key}>
                    {getNotificationTypeName(key as NotificationType)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descriere
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Descriere scurtă a template-ului"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Canal *
              </label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value as NotificationChannel })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value={NotificationChannel.EMAIL}>Email</option>
                <option value={NotificationChannel.IN_APP}>In-App</option>
                <option value={NotificationChannel.SMS}>SMS</option>
              </select>
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Activ</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.autoSend}
                  onChange={(e) => setFormData({ ...formData, autoSend: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Trimitere Automată</span>
              </label>
            </div>
          </div>

          {/* Email Template Fields */}
          {formData.channel === NotificationChannel.EMAIL && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900">Email Template</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <Input
                  value={formData.emailSubject || ''}
                  onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                  placeholder="ex: Comanda ta {{orderNumber}} a fost plasată"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body HTML *
                </label>
                <textarea
                  value={formData.emailBodyHtml || ''}
                  onChange={(e) => setFormData({ ...formData, emailBodyHtml: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="HTML content cu variabile {{orderNumber}}, {{customerName}}, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body Text (fallback)
                </label>
                <textarea
                  value={formData.emailBodyText || ''}
                  onChange={(e) => setFormData({ ...formData, emailBodyText: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Plain text version"
                />
              </div>
            </div>
          )}

          {/* In-App Template Fields */}
          {formData.channel === NotificationChannel.IN_APP && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900">In-App Template</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titlu *
                </label>
                <Input
                  value={formData.inAppTitle || ''}
                  onChange={(e) => setFormData({ ...formData, inAppTitle: e.target.value })}
                  placeholder="ex: Comanda {{orderNumber}} plasată"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mesaj *
                </label>
                <textarea
                  value={formData.inAppMessage || ''}
                  onChange={(e) => setFormData({ ...formData, inAppMessage: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Mesajul notificării cu variabile"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <Input
                    value={formData.inAppIcon || ''}
                    onChange={(e) => setFormData({ ...formData, inAppIcon: e.target.value })}
                    placeholder="ex: Bell, CheckCircle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Culoare Icon
                  </label>
                  <select
                    value={formData.inAppIconColor || 'indigo'}
                    onChange={(e) => setFormData({ ...formData, inAppIconColor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="indigo">Indigo</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="red">Red</option>
                    <option value="yellow">Yellow</option>
                    <option value="gray">Gray</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action URL
                  </label>
                  <Input
                    value={formData.inAppActionUrl || ''}
                    onChange={(e) => setFormData({ ...formData, inAppActionUrl: e.target.value })}
                    placeholder="/orders/{{orderNumber}}"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Label
                  </label>
                  <Input
                    value={formData.inAppActionLabel || ''}
                    onChange={(e) => setFormData({ ...formData, inAppActionLabel: e.target.value })}
                    placeholder="Vezi Comanda"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SMS Template Fields */}
          {formData.channel === NotificationChannel.SMS && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900">SMS Template</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mesaj SMS *
                </label>
                <textarea
                  value={formData.smsBody || ''}
                  onChange={(e) => setFormData({ ...formData, smsBody: e.target.value })}
                  rows={3}
                  maxLength={160}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Mesaj SMS (max 160 caractere)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(formData.smsBody || '').length} / 160 caractere
                </p>
              </div>
            </div>
          )}

          {/* Variables Reference */}
          {formData.type && renderVariablesList(formData.type)}
        </div>
      </form>
    </Card>
  );
}
