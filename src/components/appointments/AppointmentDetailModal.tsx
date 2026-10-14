import React, { useState } from 'react';
import { 
  X, Calendar, Clock, DollarSign, MessageCircle, 
  Trash2, FileText, CheckCircle2, UserCheck
} from 'lucide-react';
import { db } from '../../db/db';
import type { Appointment, Patient, AppSettings, AppointmentStatus } from '../../types';
import { 
  formatDatePretty, 
  formatCurrency, 
  STATUS_LABELS, 
  STATUS_COLORS, 
  buildWhatsAppLink, 
  generateReminderMessage 
} from '../../utils/formatters';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  patient: Patient | null;
  settings?: AppSettings;
  onRegisterPaymentForSession?: (apt: Appointment, pat: Patient) => void;
  onViewPatient?: (patId: string) => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  onClose,
  appointment,
  patient,
  settings,
  onRegisterPaymentForSession,
  onViewPatient
}) => {
  if (!isOpen || !appointment || !patient) return null;

  const [notes, setNotes] = useState(appointment.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    await db.appointments.update(appointment.id, { status: newStatus });
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await db.appointments.update(appointment.id, { notes });
    setIsSavingNotes(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar este turno?')) {
      await db.appointments.delete(appointment.id);
      onClose();
    }
  };

  const handleWhatsApp = () => {
    if (!patient.phone) {
      alert('Este paciente no tiene un número de teléfono registrado.');
      return;
    }
    const template = settings?.whatsappReminderTemplate || 'Hola {nombre}, te recuerdo nuestro turno el {dia} a las {hora} hs.';
    const text = generateReminderMessage(
      template,
      patient.name,
      appointment.date,
      appointment.startTime,
      settings?.therapistName || 'Lic. Psicología'
    );
    const link = buildWhatsAppLink(patient.phone, text);
    window.open(link, '_blank');
  };

  const statusConfig = STATUS_COLORS[appointment.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
              {STATUS_LABELS[appointment.status]}
            </span>
            <h2 className="text-lg font-bold text-slate-800 mt-1">{patient.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Quick Info Strip */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-700">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>{formatDatePretty(appointment.date)}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>{appointment.startTime} hs ({appointment.durationMinutes} min)</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700">
              <DollarSign className="w-4 h-4 text-teal-600" />
              <span className="font-semibold">{formatCurrency(appointment.fee, settings?.currencySymbol)}</span>
            </div>
            {patient.healthInsurance && (
              <div className="flex items-center space-x-2 text-slate-600 truncate">
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium truncate">
                  {patient.healthInsurance}
                </span>
              </div>
            )}
          </div>

          {/* WhatsApp Reminder Button */}
          {patient.phone && (
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm shadow-emerald-600/25 active:scale-[0.99] transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar Recordatorio por WhatsApp</span>
            </button>
          )}

          {/* Status Switcher */}
          <div>
            <label className="block font-semibold text-slate-700 mb-2">Estado del Turno</label>
            <div className="grid grid-cols-2 xs:grid-cols-3 gap-1.5">
              {(['scheduled', 'completed', 'canceled_patient', 'canceled_therapist', 'no_show'] as AppointmentStatus[]).map((st) => {
                const isSelected = appointment.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold text-center transition-all ${
                      isSelected
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {STATUS_LABELS[st]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Pay Action for completed sessions */}
          {appointment.status === 'completed' && onRegisterPaymentForSession && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-teal-900">Sesión Realizada</p>
                <p className="text-xs text-teal-700">Honorario: {formatCurrency(appointment.fee, settings?.currencySymbol)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onRegisterPaymentForSession(appointment, patient);
                  onClose();
                }}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95"
              >
                Registrar Cobro
              </button>
            </div>
          )}

          {/* Clinical Evolution Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center space-x-1.5 font-semibold text-slate-700">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Notas Clínicas / Evolución (Confidencial)</span>
              </label>
              {savedSuccess && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Guardado</span>
                </span>
              )}
            </div>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anotaciones de la sesión, intervenciones, tareas pactadas..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white active:scale-95 transition-all"
              >
                {isSavingNotes ? 'Guardando...' : 'Guardar Notas'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-semibold p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar Turno</span>
          </button>

          <div className="flex items-center space-x-2">
            {onViewPatient && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewPatient(patient.id);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Ver Ficha</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors"
            >
              Listo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
