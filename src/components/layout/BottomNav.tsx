import React from 'react';
import { Calendar, Users, Wallet, Settings } from 'lucide-react';

export type NavTab = 'agenda' | 'patients' | 'payments' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingDebtCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  pendingDebtCount = 0
}) => {
  const tabs = [
    {
      id: 'agenda' as NavTab,
      label: 'Agenda',
      icon: Calendar
    },
    {
      id: 'patients' as NavTab,
      label: 'Pacientes',
      icon: Users
    },
    {
      id: 'payments' as NavTab,
      label: 'Cobros',
      icon: Wallet,
      badge: pendingDebtCount > 0 ? pendingDebtCount : undefined
    },
    {
      id: 'settings' as NavTab,
      label: 'Ajustes',
      icon: Settings
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-teal-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 leading-none">{tab.label}</span>
              {isActive && (
                <div className="w-1 h-1 bg-teal-600 rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
