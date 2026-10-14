import React, { useState } from 'react';
import { X, User, Phone, Mail, Shield, DollarSign, AlertCircle, HeartHandshake } from 'lucide-react';
import { db } from '../../db/db';
import type { AppSettings, SessionFrequency } from '../../types';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: AppSettings;
  onPatientCreated?: (patientId: string) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  settings,
  onPatientCreated
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [healthInsurance, setHealthInsurance] = useState('Particular');
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [defaultFee, setDefaultFee] = useState<number>(settings?.defaultFee || 20000);
  const [sessionFrequency, setSessionFrequency] = useState<SessionFrequency>('weekly');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del paciente es obligatorio.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const newId = `pat-${Date.now()}`;
      await db.patients.add({
        id: newId,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        dni: dni.trim() || undefined,
        healthInsurance: healthInsurance.trim() || 'Particular',
        insuranceNumber: insuranceNumber.trim() || undefined,
        defaultFee: Number(defaultFee) || 0,
        sessionFrequency,
        emergencyContact: emergencyContact.trim() || undefined,
        diagnosis: diagnosis.trim() || undefined,
        notes: notes.trim() || undefined,
        active: true,
        createdAt: new Date().toISOString()
      });

      if (onPatientCreated) {
        onPatientCreated(newId);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al guardar la ficha del paciente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Nuevo Paciente</h2>
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

          {/* Nombre y Apellido */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Nombre y Apellido *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Lic. / Juan Pérez"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Teléfono & DNI */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                <Phone className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Teléfono (WhatsApp)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 11 ..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                DNI / Documento
              </label>
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Opcional"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Obra Social & Honorario */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                <Shield className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Cobertura Médica
              </label>
              <input
                type="text"
                value={healthInsurance}
                onChange={(e) => setHealthInsurance(e.target.value)}
                placeholder="Particular / OSDE / Prepaga"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                <DollarSign className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Honorario Acordado ({settings?.currencySymbol || '$'})
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={defaultFee}
                onChange={(e) => setDefaultFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                required
              />
            </div>
          </div>

          {/* Frecuencia y Contacto de Urgencia */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Frecuencia</label>
              <select
                value={sessionFrequency}
                onChange={(e) => setSessionFrequency(e.target.value as SessionFrequency)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
                <option value="as_needed">A demanda</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                <HeartHandshake className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Contacto Urgencia
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Nombre y Teléfono"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Motivo de consulta / Encuadre */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Motivo de Consulta / Encuadre Clínico (Confidencial)
            </label>
            <textarea
              rows={2}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Ej: Ansiedad, derivación médica, reestructuración vincular..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Email y Nro de Afiliado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                <Mail className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                N° de Afiliado
              </label>
              <input
                type="text"
                value={insuranceNumber}
                onChange={(e) => setInsuranceNumber(e.target.value)}
                placeholder="Opcional"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Notas Adicionales */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Notas Adicionales
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferencias horarias, observaciones..."
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
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md shadow-teal-600/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Guardando...' : 'Crear Ficha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
