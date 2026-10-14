import React, { useState } from 'react';
import { 
  Search, UserPlus, MessageCircle, FileSpreadsheet, 
  CheckCircle, AlertCircle, ChevronRight, Users
} from 'lucide-react';
import type { Patient, AppSettings, PatientFinancialSummary } from '../../types';
import { formatCurrency, buildWhatsAppLink, exportToCSV, FREQUENCY_LABELS } from '../../utils/formatters';

interface PatientsListViewProps {
  patients: Patient[];
  patientSummaries: Record<string, PatientFinancialSummary>;
  settings?: AppSettings;
  onSelectPatient: (patientId: string) => void;
  onNewPatient: () => void;
}

export const PatientsListView: React.FC<PatientsListViewProps> = ({
  patients,
  patientSummaries,
  settings,
  onSelectPatient,
  onNewPatient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'debt' | 'inactive'>('active');

  const filteredPatients = patients.filter((pat) => {
    const summary = patientSummaries[pat.id];
    const matchesSearch =
      pat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pat.phone && pat.phone.includes(searchQuery)) ||
      (pat.healthInsurance && pat.healthInsurance.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === 'active') return pat.active;
    if (filterMode === 'inactive') return !pat.active;
    if (filterMode === 'debt') return (summary?.balance || 0) > 0;
    return true;
  });

  const handleExportCSV = () => {
    const header = ['ID', 'Nombre', 'Teléfono', 'Email', 'DNI', 'Cobertura', 'Honorario', 'Frecuencia', 'Estado', 'Saldo Pendiente'];
    const rows = patients.map((p) => {
      const summary = patientSummaries[p.id];
      return [
        p.id,
        p.name,
        p.phone,
        p.email || '',
        p.dni || '',
        p.healthInsurance || '',
        p.defaultFee,
        FREQUENCY_LABELS[p.sessionFrequency] || p.sessionFrequency,
        p.active ? 'Activo' : 'Inactivo',
        summary?.balance || 0
      ];
    });

    exportToCSV(`pacientes-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows]);
  };

  const handleWhatsApp = (e: React.MouseEvent, p: Patient) => {
    e.stopPropagation();
    if (!p.phone) return;
    window.open(buildWhatsAppLink(p.phone, `Hola ${p.name}, te escribo del consultorio.`), '_blank');
  };

  return (
    <div className="pb-safe animate-in fade-in duration-150">
      <div className="max-w-3xl mx-auto px-4 py-3 space-y-3">
        {/* Search and Action Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono u obra social..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Exportar lista a Excel (CSV)"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={onNewPatient}
              className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-1 shadow-xs active:scale-95 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Nuevo</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilterMode('active')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                filterMode === 'active'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              En Tratamiento ({patients.filter((p) => p.active).length})
            </button>
            <button
              onClick={() => setFilterMode('debt')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                filterMode === 'debt'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Con Saldo Pendiente
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                filterMode === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({patients.length})
            </button>
            <button
              onClick={() => setFilterMode('inactive')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                filterMode === 'inactive'
                  ? 'bg-slate-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Inactivos / Altas
            </button>
          </div>
        </div>

        {/* Patients List */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-700 text-sm">No se encontraron pacientes</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {searchQuery ? 'Prueba con otro término de búsqueda.' : 'Agrega tu primer paciente.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={onNewPatient}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Agregar Paciente</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPatients.map((pat) => {
              const summary = patientSummaries[pat.id] || { balance: 0 };
              const hasDebt = summary.balance > 0;
              const hasCredit = summary.balance < 0;

              return (
                <div
                  key={pat.id}
                  onClick={() => onSelectPatient(pat.id)}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 hover:border-teal-300 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{pat.name}</h3>
                      {!pat.active && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-semibold">
                          Alta
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1 flex-wrap gap-y-1">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {pat.healthInsurance || 'Particular'}
                      </span>
                      <span>•</span>
                      <span>{FREQUENCY_LABELS[pat.sessionFrequency]}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-700">
                        {formatCurrency(pat.defaultFee, settings?.currencySymbol)}
                      </span>
                    </div>

                    {/* Financial Status Badge */}
                    <div className="mt-2 flex items-center space-x-2 text-xs">
                      {hasDebt ? (
                        <span className="font-bold text-rose-600 flex items-center space-x-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          <AlertCircle className="w-3 h-3" />
                          <span>Debe {formatCurrency(summary.balance, settings?.currencySymbol)}</span>
                        </span>
                      ) : hasCredit ? (
                        <span className="font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                          A favor {formatCurrency(Math.abs(summary.balance), settings?.currencySymbol)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Al día</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Arrow */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {pat.phone && (
                      <button
                        onClick={(e) => handleWhatsApp(e, pat)}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
