
import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-white/80 dark:bg-background-dark/80 backdrop-blur-2xl border-t border-gray-200 dark:border-white/5 pb-safe h-20 shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-around h-full px-4 max-w-2xl mx-auto">
        <NavButton 
          active={activeTab === 'dashboard'} 
          icon="dashboard" 
          label="Bord" 
          onClick={() => onTabChange('dashboard')} 
        />
        <NavButton 
          active={activeTab === 'planning'} 
          icon="calendar_month" 
          label="Planning" 
          onClick={() => onTabChange('planning')} 
        />
        <NavButton 
          active={activeTab === 'hosts'} 
          icon="home_work" 
          label="Hôtes" 
          onClick={() => onTabChange('hosts')} 
        />
        <NavButton 
          active={activeTab === 'messages'} 
          icon="chat" 
          label="Messages" 
          onClick={() => onTabChange('messages')} 
        />
      </div>
    </nav>
  );
};

const NavButton: React.FC<{ active: boolean; icon: string; label: string; onClick: () => void }> = ({ 
  active, 
  icon, 
  label, 
  onClick 
}) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 transition-all flex-1 ${
      active ? 'text-primary' : 'text-gray-400 dark:text-gray-600'
    }`}
  >
    <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${
      active ? 'bg-primary/10 scale-110 shadow-inner' : 'bg-transparent'
    }`}>
        <span className={`material-symbols-outlined text-[28px] ${active ? 'filled' : ''}`}>
        {icon}
        </span>
    </div>
    <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

export default BottomNav;
