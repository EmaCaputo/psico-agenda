import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { PatientFinancialSummary } from '../types';

export function useFinancials() {
  const patients = useLiveQuery(() => db.patients.toArray()) || [];
  const appointments = useLiveQuery(() => db.appointments.toArray()) || [];
  const payments = useLiveQuery(() => db.payments.toArray()) || [];

  // Calculate financial summaries for each patient
  const patientSummaries: Record<string, PatientFinancialSummary> = {};

  patients.forEach(pat => {
    patientSummaries[pat.id] = {
      patientId: pat.id,
      totalBilled: 0,
      totalPaid: 0,
      balance: 0,
      unpaidSessionsCount: 0
    };
  });

  // Sum up completed sessions fee
  appointments.forEach(apt => {
    if (apt.status === 'completed' && patientSummaries[apt.patientId]) {
      patientSummaries[apt.patientId].totalBilled += apt.fee || 0;
    }
  });

  // Sum up payments
  payments.forEach(pay => {
    if (patientSummaries[pay.patientId]) {
      patientSummaries[pay.patientId].totalPaid += pay.amount || 0;
    }
  });

  // Compute balance and unpaid approximate count
  let totalOutstandingDebt = 0;
  let totalCollectedAllTime = 0;

  Object.values(patientSummaries).forEach(summary => {
    summary.balance = summary.totalBilled - summary.totalPaid;
    if (summary.balance > 0) {
      totalOutstandingDebt += summary.balance;
      const patient = patients.find(p => p.id === summary.patientId);
      const fee = patient?.defaultFee || 1;
      summary.unpaidSessionsCount = Math.max(1, Math.round(summary.balance / fee));
    }
    totalCollectedAllTime += summary.totalPaid;
  });

  // Current month stats
  const currentMonthStr = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  
  const currentMonthPayments = payments.filter(p => p.date?.startsWith(currentMonthStr));
  const currentMonthIncome = currentMonthPayments.reduce((acc, p) => acc + p.amount, 0);

  const currentMonthAppointments = appointments.filter(a => a.date?.startsWith(currentMonthStr));
  const completedSessionsThisMonth = currentMonthAppointments.filter(a => a.status === 'completed').length;
  const scheduledSessionsThisMonth = currentMonthAppointments.length;

  // Patients with pending balance
  const patientsWithDebt = patients
    .map(p => ({
      patient: p,
      summary: patientSummaries[p.id] || { patientId: p.id, totalBilled: 0, totalPaid: 0, balance: 0, unpaidSessionsCount: 0 }
    }))
    .filter(item => item.summary.balance > 0)
    .sort((a, b) => b.summary.balance - a.summary.balance);

  return {
    patientSummaries,
    totalOutstandingDebt,
    totalCollectedAllTime,
    currentMonthIncome,
    completedSessionsThisMonth,
    scheduledSessionsThisMonth,
    patientsWithDebt,
    payments,
    appointments,
    patients
  };
}
