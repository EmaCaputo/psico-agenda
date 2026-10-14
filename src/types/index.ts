export type AppointmentStatus = 
  | 'scheduled'          // Programada
  | 'completed'          // Realizada
  | 'canceled_patient'   // Cancelada por el paciente
  | 'canceled_therapist' // Cancelada por el terapeuta
  | 'no_show';           // Ausente sin aviso

export type PaymentMethod = 
  | 'cash'        // Efectivo
  | 'transfer'    // Transferencia
  | 'insurance'   // Obra Social / Prepaga
  | 'card'        // Débito / Crédito
  | 'other';      // Otro

export type SessionFrequency = 
  | 'weekly'      // Semanal
  | 'biweekly'    // Quincenal
  | 'monthly'     // Mensual
  | 'as_needed';  // A demanda

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dni?: string;
  healthInsurance?: string;    // Obra social o Particular
  insuranceNumber?: string;    // Nro de afiliado
  defaultFee: number;          // Honorario acordado
  sessionFrequency: SessionFrequency;
  emergencyContact?: string;   // Nombre y teléfono
  diagnosis?: string;          // Motivo de consulta / encuadre clínico
  notes?: string;              // Observaciones generales
  active: boolean;             // Si está en tratamiento activo
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;               // YYYY-MM-DD
  startTime: string;          // HH:mm (ej: "15:00")
  durationMinutes: number;    // ej: 50
  status: AppointmentStatus;
  fee: number;                // Honorario de esta sesión
  notes?: string;             // Evolución / Notas clínicas confidenciales
  recurringGroupId?: string;  // Si se generó como serie semanal recurrente
  createdAt: string;
}

export interface Payment {
  id: string;
  patientId: string;
  appointmentId?: string;     // Opcional si se vinculó a una sesión puntual
  amount: number;
  date: string;               // YYYY-MM-DD
  method: PaymentMethod;
  notes?: string;             // ej: "Transferencia Banco Galicia"
  createdAt: string;
}

export interface AppSettings {
  id: string;
  therapistName: string;
  currencySymbol: string;     // $, ARS, USD, etc.
  defaultSessionDuration: number; // en minutos, default 50
  defaultFee: number;
  whatsappReminderTemplate: string;
  pinCode?: string;           // Código de 4 dígitos opcional
  requirePin: boolean;
}

export interface PatientFinancialSummary {
  patientId: string;
  totalBilled: number;
  totalPaid: number;
  balance: number;            // balance > 0: debe dinero. balance < 0: crédito a favor.
  unpaidSessionsCount: number;
}
