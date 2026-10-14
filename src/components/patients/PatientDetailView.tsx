import React, { useState } from 'react';
import { 
  ArrowLeft, Phone, MessageCircle, DollarSign, Calendar, 
  FileText, Plus, Shield, Edit3, Trash2, HeartHandshake, CheckCircle
} from 'lucide-react';
import { db } from '../../db/db';
import type { Patient, Appointment, Payment, AppSettings } from '../../types';
import { 
  formatCurrency, 
  formatDatePretty, 
  buildWhatsAppLink, 
  STATUS_LABELS, 
  STATUS_COLORS, 
  PAYMENT_METHOD_LABELS,
  FREQUENCY_LABELS
} from '../../utils/formatters';

interface PatientDetailViewProps {
  patient: Patient;
  appointments: Appointment[];
  payments: Payment[];
  settings?: AppSettings;
  onBack: () => void;
  onScheduleAppointment: (patientId: string) => void;
  onRegisterPayment: (patientId: string, defaultAmount?: number) => void;
  onSelectAppointment: (apt: Appointment) => void;
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patient,
  appointments,
  payments,
  settings,
  onBack,
  onScheduleAppointment,
  onRegisterPayment,
  onSelectAppointment
}) => {
  const [activeTab, setActiveTab] = useState<'evolution' | 'appointments' | 'payments' | 'info'>('evolution');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...patient });

  // Filter this patient's appointments & payments
  const patientAppointments = appointments
    .filter(a => a.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const patientPayments = payments
    .filter(p => p.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Financial calculations
  const totalBilled = patientAppointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + (a.fee || 0), 0);

  const totalPaid = patientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const balance = totalBilled - totalPaid;

  const handleWhatsApp = () => {
    if (!patient.phone) {
      alert('El paciente no tiene teléfono registrado.');
      return;
    }
    const link = buildWhatsAppLink(patient.phone, `Hola ${patient.name}, te escribo del consultorio.`);
    window.open(link, '_blank');
  };

  const handleCall = () => {
    if (!patient.phone) return;
    window.location.href = `tel:${patient.phone}`;
  };

  const handleSaveEdit = async () => {
    await db.patients.update(patient.id, editForm);
    setIsEditing(false);
  };

  const handleDeletePatient = async () => {
    if (confirm(`¿Estás seguro de eliminar a ${patient.name}? Se conservarán los turnos y pagos históricos.`)) {
      await db.patients.delete(patient.id);
      onBack();
    }
  };

  return (
    <div className="pb-safe animate-in fade-in duration-150">
      {/* Top Navigation */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-[57px] z-20">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 font-semibold text-sm py-1 pr-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Pacientes</span>
        </button>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Editar Ficha"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  patient.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {patient.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {patient.healthInsurance || 'Particular'} • Frecuencia: {FREQUENCY_LABELS[patient.sessionFrequency]}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2">
              {patient.phone && (
                <>
                  <button
                    onClick={handleCall}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Llamar"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Balance Strip */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Estado de Cuenta</span>
              {balance > 0 ? (
                <div className="mt-0.5">
                  <span className="text-rose-600 font-bold text-base block">
                    Debe {formatCurrency(balance, settings?.currencySymbol)}
                  </span>
                  <span className="text-xs text-rose-500">
                    (~{Math.max(1, Math.round(balance / (patient.defaultFee || 1)))} sesiones)
                  </span>
                </div>
              ) : balance < 0 ? (
                <span className="text-teal-600 font-bold text-base block mt-0.5">
                  A favor {formatCurrency(Math.abs(balance), settings?.currencySymbol)}
                </span>
              ) : (
                <span className="text-emerald-600 font-bold text-base flex items-center space-x-1 mt-0.5">
                  <CheckCircle className="w-4 h-4 inline" />
                  <span>Al día</span>
                </span>
              )}
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Honorario Acordado</span>
              <span className="text-slate-800 font-bold text-base block mt-0.5">
                {formatCurrency(patient.defaultFee, settings?.currencySymbol)}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center justify-start sm:justify-end">
              <button
                onClick={() => onRegisterPayment(patient.id, balance > 0 ? balance : patient.defaultFee)}
                className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center space-x-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Registrar Pago</span>
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form Modal/Drawer if toggled */}
        {isEditing && (
          <div className="bg-white rounded-2xl p-5 border border-teal-200 shadow-md space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Editar Información del Paciente</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Teléfono</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Cobertura</label>
                <input
                  type="text"
                  value={editForm.healthInsurance || ''}
                  onChange={(e) => setEditForm({ ...editForm, healthInsurance: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Honorario</label>
                <input
                  type="number"
                  value={editForm.defaultFee}
                  onChange={(e) => setEditForm({ ...editForm, defaultFee: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Motivo / Encuadre Clínico</label>
                <textarea
                  rows={2}
                  value={editForm.diagnosis || ''}
                  onChange={(e) => setEditForm({ ...editForm, diagnosis: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleDeletePatient}
                className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Paciente</span>
              </button>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 text-xs bg-teal-600 text-white rounded-lg font-bold shadow-xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Pills */}
        <div className="flex border-b border-slate-200 space-x-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('evolution')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'evolution'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Evolución Clínica</span>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'appointments'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Turnos ({patientAppointments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'payments'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Pagos ({patientPayments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'info'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Ficha</span>
          </button>
        </div>

        {/* Sub-tab 1: Evolution Notes Timeline */}
        {activeTab === 'evolution' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Historial de Sesiones & Notas Evolutivas
              </h3>
              <button
                onClick={() => onScheduleAppointment(patient.id)}
                className="text-xs text-teal-600 font-bold hover:text-teal-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Turno</span>
              </button>
            </div>

            {patientAppointments.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No hay sesiones registradas aún</p>
                <p className="text-xs text-slate-400 mt-1">Programa una sesión para comenzar a registrar la evolución.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patientAppointments.map((apt) => {
                  const statusConf = STATUS_COLORS[apt.status];
                  return (
                    <div
                      key={apt.id}
                      onClick={() => onSelectAppointment(apt)}
                      className="bg-white rounded-xl p-4 border border-slate-200/90 hover:border-teal-300 transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-slate-800">
                          {formatDatePretty(apt.date)} • {apt.startTime} hs
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-semibold border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}>
                          {STATUS_LABELS[apt.status]}
                        </span>
                      </div>

                      {apt.notes ? (
                        <p className="text-xs text-slate-700 whitespace-pre-line bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {apt.notes}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Sin notas clínicas registradas (Toca para agregar)
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Sub-tab 2: Appointments */}
        {activeTab === 'appointments' && (
          <div className="space-y-2">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => onScheduleAppointment(patient.id)}
                className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-semibold text-xs shadow-xs flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Programar Turno</span>
              </button>
            </div>
            {patientAppointments.map((apt) => (
              <div
                key={apt.id}
                onClick={() => onSelectAppointment(apt)}
                className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between hover:border-teal-300 cursor-pointer text-xs"
              >
                <div>
                  <p className="font-bold text-slate-800">{formatDatePretty(apt.date)} - {apt.startTime} hs</p>
                  <p className="text-slate-500">{apt.durationMinutes} minutos • {formatCurrency(apt.fee, settings?.currencySymbol)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-semibold border ${STATUS_COLORS[apt.status].bg} ${STATUS_COLORS[apt.status].text}`}>
                  {STATUS_LABELS[apt.status]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Sub-tab 3: Payments */}
        {activeTab === 'payments' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recibos de Pago</span>
              <button
                onClick={() => onRegisterPayment(patient.id, balance > 0 ? balance : patient.defaultFee)}
                className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-semibold text-xs shadow-xs flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Pago</span>
              </button>
            </div>

            {patientPayments.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200">
                <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No hay pagos registrados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {patientPayments.map((pay) => (
                  <div
                    key={pay.id}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-emerald-700 text-sm">
                        + {formatCurrency(pay.amount, settings?.currencySymbol)}
                      </p>
                      <p className="text-slate-500">
                        {formatDatePretty(pay.date)} • {PAYMENT_METHOD_LABELS[pay.method]}
                      </p>
                      {pay.notes && <p className="text-slate-600 italic mt-0.5">{pay.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sub-tab 4: Intake Information */}
        {activeTab === 'info' && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div>
              <span className="font-semibold text-slate-400 block mb-0.5">Motivo de Consulta</span>
              <p className="text-slate-800 text-sm">{patient.diagnosis || 'No especificado'}</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-400 block mb-0.5">Contacto de Urgencia</span>
              <p className="text-slate-800 text-sm flex items-center space-x-1.5">
                <HeartHandshake className="w-4 h-4 text-rose-500" />
                <span>{patient.emergencyContact || 'No especificado'}</span>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-400 block mb-0.5">DNI / Afiliado</span>
              <p className="text-slate-800 text-sm">
                DNI: {patient.dni || 'S/D'} • Afiliado: {patient.insuranceNumber || 'S/D'}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-400 block mb-0.5">Notas adicionales</span>
              <p className="text-slate-700 whitespace-pre-line">{patient.notes || 'Sin notas adicionales'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
