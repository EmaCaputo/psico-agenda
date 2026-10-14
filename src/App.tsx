import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedInitialDataIfNeeded } from './db/db';
import type { Appointment } from './types';
import { useFinancials } from './hooks/useFinancials';

import { Header } from './components/layout/Header';
import { BottomNav, type NavTab } from './components/layout/BottomNav';
import { AgendaView } from './components/agenda/AgendaView';
import { PatientsListView } from './components/patients/PatientsListView';
import { PatientDetailView } from './components/patients/PatientDetailView';
import { PaymentsView } from './components/payments/PaymentsView';
import { SettingsView } from './components/settings/SettingsView';

import { NewAppointmentModal } from './components/appointments/NewAppointmentModal';
import { AppointmentDetailModal } from './components/appointments/AppointmentDetailModal';
import { NewPatientModal } from './components/patients/NewPatientModal';
import { NewPaymentModal } from './components/payments/NewPaymentModal';
import { PWAInstallGuideModal } from './components/common/PWAInstallGuideModal';
import { PinLockScreen } from './components/security/PinLockScreen';

export function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTab, setCurrentTab] = useState<NavTab>('agenda');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Modals state
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [newAppointmentPreselectedDate, setNewAppointmentPreselectedDate] = useState<string | undefined>();
  const [newAppointmentPreselectedPatientId, setNewAppointmentPreselectedPatientId] = useState<string | undefined>();

  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);

  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [paymentPreselect, setPaymentPreselect] = useState<{
    patientId?: string;
    amount?: number;
    appointment?: Appointment | null;
  }>({});

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentDetailOpen, setIsAppointmentDetailOpen] = useState(false);

  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);

  // Security / PIN lock state
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Seed sample data on first run
  useEffect(() => {
    seedInitialDataIfNeeded().then(() => {
      setIsInitialized(true);
    });
  }, []);

  // Live queries from Dexie
  const settingsList = useLiveQuery(() => db.settings.toArray()) || [];
  const settings = settingsList[0];

  const {
    patientSummaries,
    totalOutstandingDebt,
    currentMonthIncome,
    completedSessionsThisMonth,
    patientsWithDebt,
    payments,
    appointments,
    patients
  } = useFinancials();

  // Handle lock status
  const requiresPin = settings?.requirePin && Boolean(settings?.pinCode);
  const showLockScreen = isInitialized && requiresPin && !isUnlocked;

  const handleOpenNewAppointment = (date?: string, patientId?: string) => {
    setNewAppointmentPreselectedDate(date);
    setNewAppointmentPreselectedPatientId(patientId);
    setIsNewAppointmentOpen(true);
  };

  const handleOpenNewPayment = (patientId?: string, amount?: number, appointment?: Appointment | null) => {
    setPaymentPreselect({ patientId, amount, appointment });
    setIsNewPaymentOpen(true);
  };

  const handleSelectAppointment = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsAppointmentDetailOpen(true);
  };

  const handleSelectPatient = (patId: string) => {
    setSelectedPatientId(patId);
    setCurrentTab('patients');
  };

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-serif text-2xl animate-pulse">
          Ψ
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Cargando PsicoAgenda...</p>
      </div>
    );
  }

  if (showLockScreen && settings) {
    return (
      <PinLockScreen
        correctPin={settings.pinCode || ''}
        therapistName={settings.therapistName}
        onUnlocked={() => setIsUnlocked(true)}
      />
    );
  }

  const selectedPatient = selectedPatientId
    ? patients.find((p) => p.id === selectedPatientId) || null
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        settings={settings}
        onNewAppointment={() => handleOpenNewAppointment()}
        onNewPatient={() => setIsNewPatientOpen(true)}
        onShowInstallGuide={() => setIsInstallGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'agenda' && (
          <AgendaView
            appointments={appointments}
            patients={patients}
            settings={settings}
            onSelectAppointment={handleSelectAppointment}
            onNewAppointment={(date) => handleOpenNewAppointment(date)}
          />
        )}

        {currentTab === 'patients' && (
          selectedPatient ? (
            <PatientDetailView
              patient={selectedPatient}
              appointments={appointments}
              payments={payments}
              settings={settings}
              onBack={() => setSelectedPatientId(null)}
              onScheduleAppointment={(patId) => handleOpenNewAppointment(undefined, patId)}
              onRegisterPayment={(patId, amt) => handleOpenNewPayment(patId, amt)}
              onSelectAppointment={handleSelectAppointment}
            />
          ) : (
            <PatientsListView
              patients={patients}
              patientSummaries={patientSummaries}
              settings={settings}
              onSelectPatient={handleSelectPatient}
              onNewPatient={() => setIsNewPatientOpen(true)}
            />
          )
        )}

        {currentTab === 'payments' && (
          <PaymentsView
            patients={patients}
            payments={payments}
            patientSummaries={patientSummaries}
            patientsWithDebt={patientsWithDebt}
            totalOutstandingDebt={totalOutstandingDebt}
            currentMonthIncome={currentMonthIncome}
            completedSessionsThisMonth={completedSessionsThisMonth}
            settings={settings}
            onNewPayment={(patId, amt) => handleOpenNewPayment(patId, amt)}
            onSelectPatient={handleSelectPatient}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onShowInstallGuide={() => setIsInstallGuideOpen(true)}
          />
        )}
      </main>

      {/* Bottom Tab Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'patients' && currentTab === 'patients') {
            // reset patient detail to view full list
            setSelectedPatientId(null);
          }
          setCurrentTab(tab);
        }}
        pendingDebtCount={patientsWithDebt.length}
      />

      {/* Modals */}
      <NewAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
        patients={patients}
        settings={settings}
        preselectedDate={newAppointmentPreselectedDate}
        preselectedPatientId={newAppointmentPreselectedPatientId}
        onPatientCreatedNeeded={() => setIsNewPatientOpen(true)}
      />

      <AppointmentDetailModal
        isOpen={isAppointmentDetailOpen}
        onClose={() => setIsAppointmentDetailOpen(false)}
        appointment={selectedAppointment}
        patient={
          selectedAppointment
            ? patients.find((p) => p.id === selectedAppointment.patientId) || null
            : null
        }
        settings={settings}
        onRegisterPaymentForSession={(apt, pat) => {
          handleOpenNewPayment(pat.id, apt.fee, apt);
        }}
        onViewPatient={(patId) => {
          setSelectedPatientId(patId);
          setCurrentTab('patients');
        }}
      />

      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
        settings={settings}
        onPatientCreated={(newPatId) => {
          setSelectedPatientId(newPatId);
          setCurrentTab('patients');
        }}
      />

      <NewPaymentModal
        isOpen={isNewPaymentOpen}
        onClose={() => setIsNewPaymentOpen(false)}
        patients={patients}
        settings={settings}
        preselectedPatientId={paymentPreselect.patientId}
        preselectedAmount={paymentPreselect.amount}
        preselectedAppointment={paymentPreselect.appointment}
      />

      <PWAInstallGuideModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
      />
    </div>
  );
}

export default App;
