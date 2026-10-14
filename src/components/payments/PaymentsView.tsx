import React, { useState } from 'react';
import { 
  TrendingUp, AlertCircle, Plus, MessageCircle, 
  FileSpreadsheet, Trash2, CheckCircle2, Wallet
} from 'lucide-react';
import { db } from '../../db/db';
import type { Patient, Payment, AppSettings, PatientFinancialSummary } from '../../types';
import { 
  formatCurrency, 
  formatDatePretty, 
  PAYMENT_METHOD_LABELS, 
  buildWhatsAppLink, 
  exportToCSV 
} from '../../utils/formatters';

interface PaymentsViewProps {
  patients: Patient[];
  payments: Payment[];
  patientSummaries: Record<string, PatientFinancialSummary>;
  patientsWithDebt: { patient: Patient; summary: PatientFinancialSummary }[];
  totalOutstandingDebt: number;
  currentMonthIncome: number;
  completedSessionsThisMonth: number;
  settings?: AppSettings;
  onNewPayment: (patientId?: string, amount?: number) => void;
  onSelectPatient: (patientId: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  patients,
  payments,
  patientsWithDebt,
  totalOutstandingDebt,
  currentMonthIncome,
  completedSessionsThisMonth,
  settings,
  onNewPayment,
  onSelectPatient
}) => {
  const [subTab, setSubTab] = useState<'pending' | 'history'>('pending');

  const sortedPayments = [...payments].sort((a, b) => b.date.localeCompare(a.date));

  const handleDeletePayment = async (paymentId: string) => {
    if (confirm('¿Deseas eliminar este registro de pago? Se recalculará el saldo del paciente.')) {
      await db.payments.delete(paymentId);
    }
  };

  const handleExportPaymentsCSV = () => {
    const header = ['ID', 'Fecha', 'Paciente', 'Monto', 'Método', 'Notas'];
    const rows = sortedPayments.map((p) => {
      const pat = patients.find((pt) => pt.id === p.patientId);
      return [
        p.id,
        p.date,
        pat?.name || 'Desconocido',
        p.amount,
        PAYMENT_METHOD_LABELS[p.method] || p.method,
        p.notes || ''
      ];
    });

    exportToCSV(`cobros-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows]);
  };

  const handleWhatsAppDebtReminder = (p: Patient, debtAmount: number) => {
    if (!p.phone) {
      alert('El paciente no tiene teléfono registrado.');
      return;
    }
    const msg = `Hola ${p.name}, ¿cómo estás? Te escribo de parte del consultorio para hacerte llegar el resumen de sesiones pendientes por un total de ${formatCurrency(debtAmount, settings?.currencySymbol)}. Si necesitas los datos bancarios para transferencia avisame. ¡Muchas gracias!`;
    window.open(buildWhatsAppLink(p.phone, msg), '_blank');
  };

  return (
    <div className="pb-safe animate-in fade-in duration-150">
      <div className="max-w-3xl mx-auto px-4 py-3 space-y-4">
        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Month Income */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-2xl p-4 shadow-sm shadow-teal-700/20">
            <div className="flex items-center justify-between opacity-80 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Cobrado este mes</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-xl sm:text-2xl font-black">
              {formatCurrency(currentMonthIncome, settings?.currencySymbol)}
            </p>
            <p className="text-[11px] opacity-85 mt-1 font-medium">
              {completedSessionsThisMonth} {completedSessionsThisMonth === 1 ? 'sesión realizada' : 'sesiones realizadas'}
            </p>
          </div>

          {/* Card 2: Outstanding Debt */}
          <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-xs">
            <div className="flex items-center justify-between text-rose-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Por Cobrar</span>
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-rose-600">
              {formatCurrency(totalOutstandingDebt, settings?.currencySymbol)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              en {patientsWithDebt.length} {patientsWithDebt.length === 1 ? 'paciente' : 'pacientes'}
            </p>
          </div>
        </div>

        {/* Action Header Strip */}
        <div className="flex items-center justify-between pt-1">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setSubTab('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subTab === 'pending'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cuentas por Cobrar ({patientsWithDebt.length})
            </button>
            <button
              onClick={() => setSubTab('history')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subTab === 'history'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Historial ({payments.length})
            </button>
          </div>

          {/* Quick Add Payment */}
          <button
            onClick={() => onNewPayment()}
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-1 shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Cobro</span>
          </button>
        </div>

        {/* Tab 1: Pending Debtors */}
        {subTab === 'pending' && (
          <div className="space-y-2.5">
            {patientsWithDebt.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200 shadow-xs space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">¡Todos los pacientes están al día!</h3>
                <p className="text-xs text-slate-400">
                  No hay deudas ni pagos pendientes registrados en este momento.
                </p>
              </div>
            ) : (
              patientsWithDebt.map(({ patient, summary }) => (
                <div
                  key={patient.id}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-rose-100/80 flex items-center justify-between"
                >
                  <div
                    onClick={() => onSelectPatient(patient.id)}
                    className="cursor-pointer flex-1 min-w-0 pr-3"
                  >
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-800 text-sm truncate hover:text-teal-700">
                        {patient.name}
                      </h4>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                        {patient.healthInsurance || 'Particular'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-2 text-xs">
                      <span className="font-bold text-rose-600 text-sm">
                        Debe {formatCurrency(summary.balance, settings?.currencySymbol)}
                      </span>
                      <span className="text-slate-400">
                        (~{summary.unpaidSessionsCount} {summary.unpaidSessionsCount === 1 ? 'sesión' : 'sesiones'})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {patient.phone && (
                      <button
                        onClick={() => handleWhatsAppDebtReminder(patient, summary.balance)}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        title="Recordatorio amistoso por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onNewPayment(patient.id, summary.balance)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Cobrar</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Payment History */}
        {subTab === 'history' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button
                onClick={handleExportPaymentsCSV}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar historial a Excel (CSV)</span>
              </button>
            </div>

            {sortedPayments.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200 shadow-xs">
                <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">Aún no hay cobros registrados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedPayments.map((p) => {
                  const pat = patients.find((pt) => pt.id === p.patientId);
                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 text-sm">
                            {pat?.name || 'Paciente'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[10px]">
                            {PAYMENT_METHOD_LABELS[p.method]}
                          </span>
                        </div>
                        <p className="text-slate-500 mt-0.5">
                          {formatDatePretty(p.date)} {p.notes ? `• ${p.notes}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold text-emerald-700 text-sm">
                          + {formatCurrency(p.amount, settings?.currencySymbol)}
                        </span>
                        <button
                          onClick={() => handleDeletePayment(p.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                          title="Eliminar cobro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
