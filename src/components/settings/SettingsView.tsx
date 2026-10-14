import React, { useState, useRef } from 'react';
import { 
  User, MessageCircle, Lock, Download, 
  Upload, HelpCircle, RefreshCw, Trash2, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { db, DEFAULT_SETTINGS, exportDatabaseToJson, importDatabaseFromJson, seedInitialDataIfNeeded } from '../../db/db';
import type { AppSettings } from '../../types';

interface SettingsViewProps {
  settings?: AppSettings;
  onShowInstallGuide: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings = DEFAULT_SETTINGS,
  onShowInstallGuide
}) => {
  const [form, setForm] = useState<AppSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await db.settings.put(form);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportBackup = async () => {
    try {
      const jsonStr = await exportDatabaseToJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `psicoagenda-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error al generar la copia de seguridad.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('¿Estás seguro de restaurar esta copia? Los datos actuales se reemplazarán por el contenido del archivo.')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        await importDatabaseFromJson(content);
        alert('¡Copia de seguridad restaurada con éxito!');
        window.location.reload();
      };
      reader.readAsText(file);
    } catch (err) {
      console.error(err);
      alert('Error al importar el archivo. Verifica que sea un respaldo válido de PsicoAgenda.');
    }
  };

  const handleLoadDemoData = async () => {
    if (confirm('¿Deseas restaurar los datos de demostración iniciales?')) {
      await db.patients.clear();
      await db.appointments.clear();
      await db.payments.clear();
      await seedInitialDataIfNeeded();
      window.location.reload();
    }
  };

  const handleClearAllData = async () => {
    if (confirm('ATENCIÓN: ¿Estás seguro de que deseas borrar TODOS los pacientes, turnos y cobros? Esta acción no se puede deshacer si no tienes un respaldo.')) {
      if (confirm('Confirmación final: ¿Realmente deseas vaciar la base de datos?')) {
        await db.patients.clear();
        await db.appointments.clear();
        await db.payments.clear();
        window.location.reload();
      }
    }
  };

  // Preview reminder text
  const previewMessage = form.whatsappReminderTemplate
    .replace('{nombre}', 'Lucía')
    .replace('{dia}', 'Mañana')
    .replace('{hora}', '16:00')
    .replace('{profesional}', form.therapistName || 'Lic. Psicología');

  return (
    <div className="pb-safe animate-in fade-in duration-150">
      <div className="max-w-3xl mx-auto px-4 py-3 space-y-4">
        {/* Form Settings */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Card: Professional Profile */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-800">Perfil Profesional</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre / Título</label>
                <input
                  type="text"
                  value={form.therapistName}
                  onChange={(e) => setForm({ ...form, therapistName: e.target.value })}
                  placeholder="Ej: Lic. María Laura Pérez"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Símbolo Moneda</label>
                  <input
                    type="text"
                    value={form.currencySymbol}
                    onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Honorario Base</label>
                  <input
                    type="number"
                    value={form.defaultFee}
                    onChange={(e) => setForm({ ...form, defaultFee: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duración (min)</label>
                  <input
                    type="number"
                    value={form.defaultSessionDuration}
                    onChange={(e) => setForm({ ...form, defaultSessionDuration: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: WhatsApp Message Customizer */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">Plantilla de Recordatorio por WhatsApp</h2>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-500">
                Puedes usar las siguientes variables: <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">&#123;nombre&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">&#123;dia&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">&#123;hora&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">&#123;profesional&#125;</code>.
              </p>
              <textarea
                rows={3}
                value={form.whatsappReminderTemplate}
                onChange={(e) => setForm({ ...form, whatsappReminderTemplate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
                <span className="text-[11px] font-bold text-emerald-800 block mb-1">Vista Previa del Mensaje:</span>
                <p className="text-xs text-emerald-950 italic">"{previewMessage}"</p>
              </div>
            </div>
          </div>

          {/* Card: PIN Security */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Lock className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-800">Privacidad & Bloqueo por PIN</h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={form.requirePin}
                  onChange={(e) => setForm({ ...form, requirePin: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded-sm border-slate-300 focus:ring-teal-500"
                />
                <span>Solicitar PIN de 4 dígitos al abrir la aplicación</span>
              </label>

              {form.requirePin && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código PIN (4 números)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={form.pinCode || ''}
                    onChange={(e) => setForm({ ...form, pinCode: e.target.value.replace(/\D/g, '') })}
                    placeholder="1234"
                    className="w-32 p-2.5 rounded-xl border border-slate-200 text-center tracking-widest text-base font-bold text-slate-800"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Protege el secreto profesional de las notas clínicas si prestas tu teléfono.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end space-x-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Configuración guardada</span>
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/25 active:scale-95 transition-all"
            >
              {isSaving ? 'Guardando...' : 'Guardar Ajustes'}
            </button>
          </div>
        </form>

        {/* Card: Installation Guide & PWA */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
            <h3 className="text-sm font-bold text-teal-900">Instalación en iPhone (PWA)</h3>
          </div>
          <p className="text-xs text-teal-800">
            Esta aplicación está diseñada para funcionar sin internet y sin tiendas de aplicaciones. Puedes anclarla a la pantalla de inicio con su ícono propio.
          </p>
          <button
            onClick={onShowInstallGuide}
            className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Ver cómo instalar en iPhone paso a paso</span>
          </button>
        </div>

        {/* Card: Backup and Data Management */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Download className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-800">Copias de Seguridad (Backup)</h2>
          </div>

          <p className="text-xs text-slate-500">
            Tus datos se guardan de forma 100% segura y privada en este dispositivo. Te recomendamos descargar una copia de seguridad periódicamente.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4 text-teal-600" />
              <span>Descargar Copia (.json)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center space-x-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Restaurar Copia (.json)</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <button
              onClick={handleLoadDemoData}
              className="text-slate-600 hover:text-slate-900 flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restablecer datos de prueba</span>
            </button>

            <button
              onClick={handleClearAllData}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrar todos los datos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
