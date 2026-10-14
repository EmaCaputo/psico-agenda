import React, { useState } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, MessageCircle, 
  Plus
} from 'lucide-react';
import { format, addDays, subDays, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment, Patient, AppSettings } from '../../types';
import { 
  formatDatePretty, 
  formatCurrency, 
  STATUS_LABELS, 
  STATUS_COLORS, 
  buildWhatsAppLink, 
  generateReminderMessage 
} from '../../utils/formatters';

interface AgendaViewProps {
  appointments: Appointment[];
  patients: Patient[];
  settings?: AppSettings;
  onSelectAppointment: (apt: Appointment) => void;
  onNewAppointment: (date?: string) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  appointments,
  patients,
  settings,
  onSelectAppointment,
  onNewAppointment
}) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const currentDateObj = parseISO(selectedDate);

  // Filter appointments for selected date
  const dayAppointments = appointments
    .filter((a) => a.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Quick day jump handlers
  const handlePrevDay = () => {
    setSelectedDate(format(subDays(currentDateObj, 1), 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    setSelectedDate(format(addDays(currentDateObj, 1), 'yyyy-MM-dd'));
  };

  const handleToday = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  };

  // Generate mini 7-day strip around selected date
  const weekDays = [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
    const d = addDays(currentDateObj, offset);
    const dateStr = format(d, 'yyyy-MM-dd');
    const count = appointments.filter((a) => a.date === dateStr).length;
    return {
      dateObj: d,
      dateStr,
      dayName: format(d, 'EEE', { locale: es }),
      dayNumber: format(d, 'd'),
      isCurrent: isSameDay(d, currentDateObj),
      isRealToday: isSameDay(d, new Date()),
      count
    };
  });

  const getPatient = (patientId: string) => {
    return patients.find((p) => p.id === patientId);
  };

  // Stats for the selected day
  const completedCount = dayAppointments.filter((a) => a.status === 'completed').length;
  const projectedIncome = dayAppointments.reduce((sum, a) => sum + (a.fee || 0), 0);

  const handleWhatsAppQuick = (e: React.MouseEvent, apt: Appointment, pat: Patient) => {
    e.stopPropagation();
    if (!pat.phone) {
      alert('El paciente no tiene teléfono registrado.');
      return;
    }
    const template = settings?.whatsappReminderTemplate || 'Hola {nombre}, te recuerdo nuestro turno el {dia} a las {hora} hs.';
    const text = generateReminderMessage(
      template,
      pat.name,
      apt.date,
      apt.startTime,
      settings?.therapistName || 'Lic. Psicología'
    );
    window.open(buildWhatsAppLink(pat.phone, text), '_blank');
  };

  return (
    <div className="pb-safe animate-in fade-in duration-150">
      <div className="max-w-3xl mx-auto px-4 py-3 space-y-3">
        {/* Date Selector Header */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevDay}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                title="Día anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base font-bold text-slate-800 capitalize leading-tight">
                  {formatDatePretty(selectedDate)}
                </h2>
                <span className="text-xs text-slate-500">
                  {format(currentDateObj, "d 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>
              <button
                onClick={handleNextDay}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                title="Día siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
              >
                Hoy
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-700 bg-white"
              />
            </div>
          </div>

          {/* Mini 7-day strip */}
          <div className="grid grid-cols-7 gap-1 pt-2 border-t border-slate-100 text-center">
            {weekDays.map((wd) => (
              <button
                key={wd.dateStr}
                onClick={() => setSelectedDate(wd.dateStr)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                  wd.isCurrent
                    ? 'bg-teal-600 text-white font-bold shadow-sm shadow-teal-600/30'
                    : wd.isRealToday
                    ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider capitalize">
                  {wd.dayName}
                </span>
                <span className="text-sm mt-0.5">{wd.dayNumber}</span>
                {wd.count > 0 && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      wd.isCurrent ? 'bg-white' : 'bg-teal-500'
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Day Summary Strip */}
        <div className="flex items-center justify-between text-xs px-2 text-slate-600">
          <div className="flex items-center space-x-3">
            <span>
              <strong>{dayAppointments.length}</strong> {dayAppointments.length === 1 ? 'turno' : 'turnos'}
            </span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">
              <strong>{completedCount}</strong> realizadas
            </span>
          </div>
          <div className="font-semibold text-slate-800">
            Total: {formatCurrency(projectedIncome, settings?.currencySymbol)}
          </div>
        </div>

        {/* Appointments List */}
        {dayAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-700 text-sm">Sin turnos para este día</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Aprovecha el espacio libre o agenda una nueva sesión.
              </p>
            </div>
            <button
              onClick={() => onNewAppointment(selectedDate)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Programar Turno</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {dayAppointments.map((apt) => {
              const pat = getPatient(apt.patientId);
              const statusConf = STATUS_COLORS[apt.status];

              return (
                <div
                  key={apt.id}
                  onClick={() => onSelectAppointment(apt)}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 hover:border-teal-300 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {/* Time Block */}
                      <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-2 text-center min-w-[62px]">
                        <span className="text-sm font-bold text-slate-800 leading-none">
                          {apt.startTime}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 font-medium">
                          {apt.durationMinutes}m
                        </span>
                      </div>

                      {/* Patient & Details */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-800 text-sm">
                            {pat?.name || 'Paciente no encontrado'}
                          </h3>
                        </div>

                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1 flex-wrap gap-y-1">
                          {pat?.healthInsurance && (
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium text-slate-700">
                              {pat.healthInsurance}
                            </span>
                          )}
                          <span className="font-semibold text-slate-700">
                            {formatCurrency(apt.fee, settings?.currencySymbol)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status & WhatsApp Trigger */}
                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                      >
                        {STATUS_LABELS[apt.status]}
                      </span>

                      {pat?.phone && (
                        <button
                          onClick={(e) => handleWhatsAppQuick(e, apt, pat)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors border border-emerald-200"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notes snippet if exists */}
                  {apt.notes && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600 line-clamp-1 italic">
                      Notas: {apt.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
