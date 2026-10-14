import Dexie, { type Table } from 'dexie';
import type { Patient, Appointment, Payment, AppSettings } from '../types';

export class PsicoDatabase extends Dexie {
  patients!: Table<Patient, string>;
  appointments!: Table<Appointment, string>;
  payments!: Table<Payment, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('PsicoAgendaDB');
    this.version(1).stores({
      patients: 'id, name, phone, healthInsurance, active, createdAt',
      appointments: 'id, patientId, date, startTime, status, recurringGroupId, createdAt',
      payments: 'id, patientId, appointmentId, date, method, createdAt',
      settings: 'id'
    });
  }
}

export const db = new PsicoDatabase();

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'main',
  therapistName: 'Lic. Psicología',
  currencySymbol: '$',
  defaultSessionDuration: 50,
  defaultFee: 20000,
  whatsappReminderTemplate: 'Hola {nombre}, te recuerdo nuestro turno para el día {dia} a las {hora} hs. Por favor confirmame tu asistencia. Saludos cordiales!',
  requirePin: false,
  pinCode: ''
};

// Seed initial sample data if completely empty
export async function seedInitialDataIfNeeded() {
  const patientCount = await db.patients.count();
  if (patientCount > 0) return;

  // Insert settings
  await db.settings.put(DEFAULT_SETTINGS);

  const now = new Date();
  const formatYMD = (d: Date) => d.toISOString().split('T')[0];
  
  const today = formatYMD(now);
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatYMD(tomorrow);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 4);
  const nextWeekStr = formatYMD(nextWeek);

  const samplePatients: Patient[] = [
    {
      id: 'pat-1',
      name: 'Lucía Fernández',
      phone: '+5491155551234',
      email: 'lucia.f@example.com',
      dni: '36.840.112',
      healthInsurance: 'Particular',
      defaultFee: 22000,
      sessionFrequency: 'weekly',
      emergencyContact: 'Martín (Pareja) - 11 4444-2222',
      diagnosis: 'Tratamiento por cuadro de ansiedad generalizada y estrés laboral.',
      notes: 'Prefiere las sesiones de la tarde. Muy puntual.',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'pat-2',
      name: 'Carlos Benítez',
      phone: '+5491166669876',
      email: 'carlos.b@example.com',
      healthInsurance: 'OSDE 210',
      insuranceNumber: '849204910-01',
      defaultFee: 20000,
      sessionFrequency: 'weekly',
      emergencyContact: 'Elena (Madre) - 11 3333-8888',
      diagnosis: 'Elaboración de duelo y reestructuración vincular.',
      notes: 'Solicita factura para reintegro a fin de mes.',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'pat-3',
      name: 'Mariana Rossi',
      phone: '+5491177774433',
      defaultFee: 20000,
      healthInsurance: 'Swiss Medical',
      sessionFrequency: 'biweekly',
      diagnosis: 'Acompañamiento en transición de carrera profesional.',
      notes: 'Frecuencia quincenal.',
      active: true,
      createdAt: new Date().toISOString()
    }
  ];

  await db.patients.bulkAdd(samplePatients);

  const sampleAppointments: Appointment[] = [
    {
      id: 'apt-1',
      patientId: 'pat-1',
      date: yesterdayStr,
      startTime: '16:00',
      durationMinutes: 50,
      status: 'completed',
      fee: 22000,
      notes: 'Sesión productiva. Se abordaron técnicas de respiración y registro de pensamientos automáticos.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'apt-2',
      patientId: 'pat-2',
      date: today,
      startTime: '17:00',
      durationMinutes: 50,
      status: 'scheduled',
      fee: 20000,
      notes: '',
      createdAt: new Date().toISOString()
    },
    {
      id: 'apt-3',
      patientId: 'pat-1',
      date: tomorrowStr,
      startTime: '15:00',
      durationMinutes: 50,
      status: 'scheduled',
      fee: 22000,
      notes: '',
      createdAt: new Date().toISOString()
    },
    {
      id: 'apt-4',
      patientId: 'pat-3',
      date: nextWeekStr,
      startTime: '18:00',
      durationMinutes: 50,
      status: 'scheduled',
      fee: 20000,
      notes: '',
      createdAt: new Date().toISOString()
    }
  ];

  await db.appointments.bulkAdd(sampleAppointments);

  const samplePayments: Payment[] = [
    {
      id: 'pay-1',
      patientId: 'pat-1',
      appointmentId: 'apt-1',
      amount: 22000,
      date: yesterdayStr,
      method: 'transfer',
      notes: 'Transferencia Mercado Pago',
      createdAt: new Date().toISOString()
    }
  ];

  await db.payments.bulkAdd(samplePayments);
}

// Backup & Export Functions
export async function exportDatabaseToJson(): Promise<string> {
  const [patients, appointments, payments, settings] = await Promise.all([
    db.patients.toArray(),
    db.appointments.toArray(),
    db.payments.toArray(),
    db.settings.toArray()
  ]);

  const backupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appName: 'PsicoAgenda',
    data: {
      patients,
      appointments,
      payments,
      settings: settings[0] || DEFAULT_SETTINGS
    }
  };

  return JSON.stringify(backupData, null, 2);
}

export async function importDatabaseFromJson(jsonString: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.data || !parsed.data.patients) {
      throw new Error('Formato de copia de seguridad no válido');
    }

    await db.transaction('rw', [db.patients, db.appointments, db.payments, db.settings], async () => {
      await db.patients.clear();
      await db.appointments.clear();
      await db.payments.clear();
      await db.settings.clear();

      if (parsed.data.patients?.length) {
        await db.patients.bulkAdd(parsed.data.patients);
      }
      if (parsed.data.appointments?.length) {
        await db.appointments.bulkAdd(parsed.data.appointments);
      }
      if (parsed.data.payments?.length) {
        await db.payments.bulkAdd(parsed.data.payments);
      }
      if (parsed.data.settings) {
        await db.settings.put(parsed.data.settings);
      }
    });

    return true;
  } catch (error) {
    console.error('Error importing backup:', error);
    throw error;
  }
}
