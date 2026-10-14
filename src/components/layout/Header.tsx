import React from 'react';
import { UserPlus, CalendarPlus, ShieldCheck } from 'lucide-react';
import type { AppSettings } from '../../types';

interface HeaderProps {
  settings?: AppSettings;
  onNewAppointment: () => void;
  onNewPatient: () => void;
  onShowInstallGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onNewAppointment,
  onNewPatient,
  onShowInstallGuide
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 safe-top">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
            <span className="text-xl font-bold font-serif leading-none">Ψ</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">
              PsicoAgenda
            </h1>
            <p className="text-xs text-teal-700 font-medium truncate max-w-[170px] sm:max-w-xs">
              {settings?.therapistName || 'Lic. Psicología'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onShowInstallGuide && (
            <button
              onClick={onShowInstallGuide}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
              title="Instalar en teléfono"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}

          <button
            onClick={onNewPatient}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg active:scale-95 transition-all"
            title="Nuevo Paciente"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">+ Paciente</span>
          </button>

          <button
            onClick={onNewAppointment}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg active:scale-95 shadow-sm shadow-teal-600/25 transition-all"
            title="Nuevo Turno"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>+ Turno</span>
          </button>
        </div>
      </div>
    </header>
  );
};
