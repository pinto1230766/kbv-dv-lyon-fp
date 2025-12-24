
import React from 'react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="hidden md:flex flex-col w-20 lg:w-64 h-full bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-white/5 pt-6 pb-6 transition-all duration-300 shadow-sm z-20">
      <div className="flex items-center justify-center lg:justify-start lg:px-6 mb-8 gap-3">
        <div 
           className="h-10 w-10 rounded-full bg-cover bg-center border-2 border-primary shadow-md" 
           style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAmQ8GDkWSQFMTS9i8WMnuGTae3SBH6eQyXCMJigbBP5Bmqhx6crBxkJ2eVy9qIiG9sncYsom3vPCpniFCySx6ER8sjXwQHizI-86uvwuTgF2uV1F2E7Q164gcwzh73RVY1p61eSo31ianxh_J7SjReOcHnRgcyWGc-GkELWi370znmkZDGQtgYXHHRu4Q7QZwd2Fjeeo_PLRUFCJc6_qMiEkTp93_atyswtymhsK70fOJ4oHpOQEH7uVl-2QKgoyw48vMhL2vP8VM')` }}
        ></div>
        <div className="hidden lg:block">
           <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Congrégation</h1>
           <p className="text-xs text-text-secondary font-medium">KBV Lyon</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-3">
        <NavButton 
          active={activeTab === 'dashboard'} 
          icon="dashboard" 
          label="Tableau de bord" 
          onClick={() => onTabChange('dashboard')} 
        />
        <NavButton 
          active={activeTab === 'planning'} 
          icon="calendar_month" 
          label="Planning" 
          onClick={() => onTabChange('planning')} 
        />
        <NavButton 
          active={activeTab === 'speakers'} 
          icon="record_voice_over" 
          label="Orateurs" 
          onClick={() => onTabChange('speakers')} 
        />
        <NavButton 
          active={activeTab === 'hosts'} 
          icon="home" 
          label="Hébergement" 
          onClick={() => onTabChange('hosts')} 
        />
        <NavButton 
          active={activeTab === 'messages'} 
          icon="chat" 
          label="Communication" 
          onClick={() => onTabChange('messages')} 
        />
        <div className="my-2 border-t border-gray-200 dark:border-white/5 mx-2"></div>
        <NavButton 
          active={activeTab === 'settings'} 
          icon="settings" 
          label="Paramètres" 
          onClick={() => onTabChange('settings')} 
        />
      </div>
      
      <div className="mt-auto px-6 hidden lg:block">
          <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center">v1.2.0 • Build 2024</p>
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
    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
      active 
      ? 'bg-primary text-white shadow-lg shadow-primary/25' 
      : 'text-gray-500 dark:text-text-secondary hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
    } justify-center lg:justify-start group`}
    title={label}
  >
    <span className={`material-symbols-outlined text-[24px] transition-transform ${active ? 'filled scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
    <span className="hidden lg:block text-sm font-bold truncate">{label}</span>
  </button>
);

export default Sidebar;
