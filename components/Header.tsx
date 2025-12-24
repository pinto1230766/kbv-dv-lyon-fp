
import React, { useState, useMemo } from 'react';
import { TabType, NavigationProps } from '../types';
import { useData } from '../DataContext';

interface HeaderProps {
  onProfileClick: () => void;
  onNavigate: (tab: TabType, props?: NavigationProps) => void;
}

const Header: React.FC<HeaderProps> = ({ onProfileClick, onNavigate }) => {
  const { actions, appSettings } = useData();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Map actions to notifications
  const notifications = useMemo(() => {
    return actions.map(action => ({
      id: action.id,
      icon: action.icon,
      text: action.title,
      subtext: action.subtitle,
      color: action.color, // Expecting tailwind classes
      actionItem: action
    }));
  }, [actions]);

  const handleNotifClick = (actionItem: any) => {
    setIsNotifOpen(false);
    if (actionItem.visitId) {
      onNavigate('planning', { visitId: actionItem.visitId });
    } else if (actionItem.speakerId) {
      onNavigate('speakers', { speakerId: actionItem.speakerId });
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onProfileClick}>
          <div className="relative">
            <div 
              className="h-10 w-10 rounded-full bg-cover bg-center border-2 border-primary/20 group-hover:border-primary transition-colors" 
              style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAmQ8GDkWSQFMTS9i8WMnuGTae3SBH6eQyXCMJigbBP5Bmqhx6crBxkJ2eVy9qIiG9sncYsom3vPCpniFCySx6ER8sjXwQHizI-86uvwuTgF2uV1F2E7Q164gcwzh73RVY1p61eSo31ianxh_J7SjReOcHnRgcyWGc-GkELWi370znmkZDGQtgYXHHRu4Q7QZwd2Fjeeo_PLRUFCJc6_qMiEkTp93_atyswtymhsK70fOJ4oHpOQEH7uVl-2QKgoyw48vMhL2vP8VM')` }}
            ></div>
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background-light dark:border-background-dark"></div>
          </div>
          <div>
            <h2 className="text-[10px] text-gray-500 dark:text-text-secondary font-medium leading-tight uppercase tracking-widest">{appSettings.congregationName}</h2>
            <h1 className="text-lg font-bold leading-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors">Bonjour, {appSettings.userName}</h1>
          </div>
        </div>
        <button 
          onClick={() => setIsNotifOpen(true)}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors border border-transparent dark:border-white/5"
        >
          <span className="material-symbols-outlined text-gray-600 dark:text-text-secondary">notifications</span>
          {notifications.length > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border border-background-light dark:border-background-dark"></span>
          )}
        </button>
      </header>
      
      {isNotifOpen && (
        <div 
          className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm animate-in fade-in-25 duration-200"
          onClick={() => setIsNotifOpen(false)}
        >
          <div 
            className="absolute top-20 right-4 w-80 bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
              <h3 className="font-bold text-gray-900 dark:text-white">Notifications ({notifications.length})</h3>
            </div>
            <div className="flex flex-col max-h-[300px] overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-text-secondary">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_off</span>
                  <p className="text-xs">Aucune action requise</p>
                </div>
              ) : (
                notifications.map(notif => (
                   <div 
                     key={notif.id} 
                     onClick={() => handleNotifClick(notif.actionItem)}
                     className="p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/5 last:border-0 transition-colors cursor-pointer"
                   >
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.color}`}>
                        <span className="material-symbols-outlined text-lg">{notif.icon}</span>
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-xs text-gray-800 dark:text-gray-200 font-medium leading-snug truncate">{notif.text}</p>
                       <p className="text-[10px] text-gray-400 dark:text-text-secondary mt-0.5 truncate">{notif.subtext}</p>
                     </div>
                   </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
