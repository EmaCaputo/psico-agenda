import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, DollarSign, Repeat, AlertCircle } from 'lucide-react';
import { db } from '../../db/db';
import type { Patient, AppSettings } from '../../types';
import { format } from 'date-fns';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  settings?: AppSettings;
  preselectedPatientId?: string;
  preselectedDate?: string;
  onPatientCreatedNeeded?: () => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  patients,
  settings,
  preselectedPatientId,
  preselectedDate,
  onPatientCreatedNeeded
}) => {
  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [date, setDate] = useState(preselectedDate || format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('16:00');
  const [durationMinutes, setDurationMinutes] = useState(settings?.defaultSessionDuration || 50);
  const [fee, setFee] = useState<number>(settings?.defaultFee || 20000);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // When preselected values change or open
  useEffect(() => {
    if (isOpen) {
      if (preselectedPatientId) {
        setPatientId(preselectedPatientId);
        const pat = patients.find(p => p.id === preselectedPatientId);
        if (pat) setFee(pat.defaultFee);
      } else if (patients.length > 0 && !patientId) {
        setPatientId(patients[0].id);
        setFee(patients[0].defaultFee);
      }

      if (preselectedDate) {
        setDate(preselectedDate);
      }
    }
  }, [isOpen, preselectedPatientId, preselectedDate, patients]);

  // When patient selection changes, update fee to their default fee
  const handlePatientChange = (id: string) => {
    setPatientId(id);
    const pat = patients.find(p => p.id === id);
    if (pat) {
      setFee(pat.defaultFee);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setError('Por favor selecciona un paciente.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const baseDate = new Date(`${date}T${startTime}:00`);
      const recurringGroupId = isRecurring ? `rec-${Date.now()}` : undefined;

      const count = isRecurring ? Math.max(1, recurringWeeks) : 1;

      for (let i = 0; i < count; i++) {
        const currentDate = new Date(baseDate);
        currentDate.setDate(currentDate.getDate() + (i * 7));
        const dateStr = format(currentDate, 'yyyy-MM-dd');

        await db.appointments.add({
          id: `apt-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          patientId,
          date: dateStr,
          startTime,
          durationMinutes: Number(durationMinutes),
          status: 'scheduled',
          fee: Number(fee),
          notes: i === 0 ? notes : '',
          recurringGroupId,
          createdAt: new Date().toISOString()
        });
      }

      onClose();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al guardar el turno.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Nuevo Turno</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Patient Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">Paciente *</label>
              {onPatientCreatedNeeded && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onPatientCreatedNeeded();
                  }}
                  className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
                >
                  + Crear nuevo
                </button>
              )}
            </div>
            {patients.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-200">
                Aún no tienes pacientes registrados.{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onPatientCreatedNeeded) onPatientCreatedNeeded();
                  }}
                  className="font-bold underline"
                >
                  Crear paciente ahora
                </button>
              </div>
            ) : (
              <select
                value={patientId}
                onChange={(e) => handlePatientChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                required
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.healthInsurance ? `(${p.healthInsurance})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Fecha *</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Hora de Inicio *</label>
              <div className="relative">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Duration & Fee Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Duración (min)
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value={45}>45 minutos</option>
                <option value={50}>50 minutos (Estándar)</option>
                <option value={60}>60 minutos (1 hora)</option>
                <option value={80}>80 minutos (Pareja/Familia)</option>
                <option value={90}>90 minutos</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                <DollarSign className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Honorario ({settings?.currencySymbol || '$'})
              </label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                min="0"
                step="500"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                required
              />
            </div>
          </div>

          {/* Recurrence Option */}
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-slate-800 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded-sm border-slate-300 focus:ring-teal-500"
                />
                <Repeat className="w-4 h-4 text-teal-600" />
                <span>Turno Fijo Recurrente</span>
              </label>
            </div>
            
            {isRecurring && (
              <div className="pt-2 flex items-center space-x-2 text-xs text-slate-600">
                <span>Repetir el mismo día y hora por:</span>
                <select
                  value={recurringWeeks}
                  onChange={(e) => setRecurringWeeks(Number(e.target.value))}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                >
                  <option value={4}>4 semanas (1 mes)</option>
                  <option value={8}>8 semanas (2 meses)</option>
                  <option value={12}>12 semanas (3 meses)</option>
                </select>
              </div>
            )}
          </div>

          {/* Initial note */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Observación / Motivo (opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Primera entrevista, sesión virtual, traer informe..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || patients.length === 0}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md shadow-teal-600/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Guardando...' : 'Programar Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
