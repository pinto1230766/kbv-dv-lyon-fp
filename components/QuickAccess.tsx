
import React from 'react';
import { TabType, NavigationProps } from '../types';
import { useData } from '../DataContext';

interface QuickAccessProps {
  onAction?: (tab: TabType, props?: NavigationProps) => void;
}

const QuickAccess: React.FC<QuickAccessProps> = ({ onAction }) => {
  const { syncData, isSyncing, exportData } = useData();

  const handleClick = (action: any) => {
    if (action.type === 'sync') {
      syncData();
    } else if (action.type === 'export') {
      if (confirm("Télécharger une sauvegarde des données (JSON) ?")) {
        exportData();
      }
    } else if (action.type === 'nav' && onAction) {
      onAction(action.tab, action.props);
    }
  };

  const actions = [
    { 
      id: 'visit',
      icon: 'add_location_alt', 
      label: 'Nouvelle Visite', 
      sub: 'Planifier',
      type: 'nav',
      tab: 'planning' as TabType, 
      props: { action: 'add' },
      bg: 'bg-primary text-white shadow-lg shadow-primary/25',
      iconColor: 'text-white'
    },
    { 
      id: 'speaker',
      icon: 'person_add', 
      label: 'Nouvel Orateur', 
      sub: 'Ajouter',
      type: 'nav',
      tab: 'speakers' as TabType, 
      props: { action: 'add' },
      bg: 'bg-white dark:bg-card-dark text-gray-900 dark:text-white border border-gray-200 dark:border-white/5 hover:border-primary/30 dark:hover:border-primary/30',
      iconColor: 'text-primary'
    },
    { 
      id: 'sync',
      icon: isSyncing ? 'sync' : 'cloud_sync', 
      label: isSyncing ? 'Synchro...' : 'Synchroniser', 
      sub: 'Google Sheet',
      type: 'sync',
      bg: 'bg-white dark:bg-card-dark text-gray-900 dark:text-white border border-gray-200 dark:border-white/5 hover:border-blue-500/30 dark:hover:border-blue-400/30',
      iconColor: isSyncing ? 'text-blue-500 animate-spin' : 'text-blue-500'
    },
    { 
      id: 'export',
      icon: 'save_alt', 
      label: 'Sauvegarde', 
      sub: 'Export JSON',
      type: 'export',
      bg: 'bg-white dark:bg-card-dark text-gray-900 dark:text-white border border-gray-200 dark:border-white/5 hover:border-amber-500/30 dark:hover:border-amber-400/30',
      iconColor: 'text-amber-500'
    },
  ];

  return (
    <section className="px-4">
      <h3 className="text-lg font-bold tracking-tight mb-3 text-gray-900 dark:text-white">Accès rapide</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((item) => (
          <button 
            key={item.id}
            onClick={() => handleClick(item)}
            disabled={item.id === 'sync' && isSyncing}
            className={`relative flex flex-col items-start justify-center p-4 rounded-2xl shadow-sm transition-all active:scale-[0.98] ${item.bg} h-28 group overflow-hidden`}
          >
            <div className={`mb-3 p-2 rounded-xl ${item.id === 'visit' ? 'bg-white/20' : 'bg-gray-50 dark:bg-white/5'} ${item.iconColor}`}>
              <span className="material-symbols-outlined text-2xl">{item.icon}</span>
            </div>
            <div className="flex flex-col items-start z-10">
                <span className="text-sm font-bold leading-tight">
                {item.label}
                </span>
                <span className={`text-[10px] font-medium mt-0.5 ${item.id === 'visit' ? 'text-white/80' : 'text-gray-500 dark:text-text-secondary'}`}>
                    {item.sub}
                </span>
            </div>
            
            {/* Decoration circle */}
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10 ${item.id === 'visit' ? 'bg-white' : 'bg-current'} group-hover:scale-110 transition-transform duration-500 pointer-events-none`}></div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickAccess;
