import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AppointmentStatus, PaymentMethod, SessionFrequency } from '../types';

export function formatCurrency(amount: number, symbol: string = '$'): string {
  return `${symbol} ${amount.toLocaleString('es-AR')}`;
}

export function formatDatePretty(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    if (isYesterday(date)) return 'Ayer';
    return format(date, "EEEE d 'de' MMMM", { locale: es });
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "d 'de' MMM", { locale: es });
  } catch {
    return dateString;
  }
}

export function formatTime(timeString: string): string {
  return timeString; // e.g. "16:00"
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Programada',
  completed: 'Realizada',
  canceled_patient: 'Canceló paciente',
  canceled_therapist: 'Canceló profesional',
  no_show: 'Ausente sin aviso'
};

export const STATUS_COLORS: Record<AppointmentStatus, { bg: string; text: string; border: string }> = {
  scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  canceled_patient: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  canceled_therapist: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  no_show: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  insurance: 'Obra Social / Prepaga',
  card: 'Tarjeta',
  other: 'Otro'
};

export const FREQUENCY_LABELS: Record<SessionFrequency, string> = {
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  as_needed: 'A demanda'
};

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const clean = cleanPhoneNumber(phone);
  // remove leading '+' if wa.me accepts standard digits
  const numOnly = clean.replace('+', '');
  return `https://wa.me/${numOnly}?text=${encodeURIComponent(message)}`;
}

export function generateReminderMessage(
  template: string,
  patientName: string,
  dateStr: string,
  startTime: string,
  therapistName: string
): string {
  const dateFormatted = formatDatePretty(dateStr);
  return template
    .replace('{nombre}', patientName)
    .replace('{dia}', dateFormatted)
    .replace('{hora}', startTime)
    .replace('{profesional}', therapistName);
}

export function exportToCSV(filename: string, rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) => {
    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  let csvFile = '\uFEFF'; // UTF-8 BOM for Excel in Spanish
  for (let i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
