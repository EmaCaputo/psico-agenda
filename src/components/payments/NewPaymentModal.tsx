import React, { useState, useEffect } from 'react';
import { X, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { db } from '../../db/db';
import type { Patient, AppSettings, PaymentMethod, Appointment } from '../../types';
import { format } from 'date-fns';
import { PAYMENT_METHOD_LABELS } from '../../utils/formatters';

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  settings?: AppSettings;
  preselectedPatientId?: string;
  preselectedAmount?: number;
  preselectedAppointment?: Appointment | null;
}

export const NewPaymentModal: React.FC<NewPaymentModalProps> = ({
  isOpen,
  onClose,
  patients,
  settings,
  preselectedPatientId,
  preselectedAmount,
  preselectedAppointment
}) => {
  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [amount, setAmount] = useState<number>(preselectedAmount || 20000);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [method, setMethod] = useState<PaymentMethod>('transfer');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (preselectedPatientId) {
        setPatientId(preselectedPatientId);
      } else if (patients.length > 0 && !patientId) {
        setPatientId(patients[0].id);
      }

      if (preselectedAmount !== undefined && preselectedAmount > 0) {
        setAmount(preselectedAmount);
      } else if (preselectedPatientId) {
        const p = patients.find(pat => pat.id === preselectedPatientId);
        if (p) setAmount(p.defaultFee);
      }
    }
  }, [isOpen, preselectedPatientId, preselectedAmount, patients]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setError('Por favor selecciona un paciente.');
      return;
    }
    if (amount <= 0) {
      setError('El monto debe ser mayor a 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await db.payments.add({
        id: `pay-${Date.now()}`,
        patientId,
        appointmentId: preselectedAppointment?.id,
        amount: Number(amount),
        date,
        method,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString()
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al registrar el pago.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Registrar Cobro</h2>
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
            <label className="block font-semibold text-slate-700 mb-1.5">Paciente *</label>
            <select
              value={patientId}
              onChange={(e) => {
                setPatientId(e.target.value);
                const pat = patients.find(p => p.id === e.target.value);
                if (pat && (!preselectedAmount || preselectedAmount <= 0)) {
                  setAmount(pat.defaultFee);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              required
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.healthInsurance || 'Particular'})
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Monto ({settings?.currencySymbol || '$'}) *
              </label>
              <input
                type="number"
                min="1"
                step="500"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-base focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Fecha *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                required
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-2">Medio de Pago</label>
            <div className="grid grid-cols-2 gap-2">
              {(['transfer', 'cash', 'insurance', 'card'] as PaymentMethod[]).map((m) => {
                const isSelected = method === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{PAYMENT_METHOD_LABELS[m]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes / Receipt */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Detalle / Referencia (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Transferencia Banco / Recibo 0041"
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Confirmar Cobro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
