import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';
import DataManagementView from './DataManagementView';

interface SettingsViewProps {
  onBack?: () => void;
}

const Toggle: React.FC<{ 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  size?: 'small' | 'default'; 
  variant?: 'primary' | 'success';
}> = ({ 
  checked,
  onChange,
  size = 'default',
  variant = 'primary'
}) => {
  const width = size === 'small' ? 'w-10' : 'w-[51px]';
  const height = size === 'small' ? 'h-[24px]' : 'h-[31px]';
  const knob = size === 'small' ? 'w-[20px]' : 'w-[27px]';
  
  const activeColorClass = variant === 'success' ? 'bg-green-500' : 'bg-primary';

  return (
    <label className={`relative flex ${height} ${width} cursor-pointer items-center rounded-full border-none p-0.5 transition-colors duration-200 ${checked ? activeColorClass : 'bg-gray-300 dark:bg-surface-highlight'}`}>
      <input type="checkbox" className="sr-only" checked={checked} onChange={() => onChange(!checked)} />
      <div className={`${knob} h-full rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-full' : 'translate-x-0'}`}></div>
    </label>
  );
};

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const { theme, setTheme } = useTheme();
  const { appSettings, updateAppSettings, resetAllData, syncData, isSyncing, syncConfig } = useData();
  const [currentView, setCurrentView] = useState<'main' | 'data'>('main');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateAppSettings({ [name]: value });
    if (!isEditingProfile) {
        setIsEditingProfile(true);
    }
  };

  const handleProfileSave = () => {
      setIsEditingProfile(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
  }
  
  const handleLogout = () => {
      if(confirm("Voulez-vous vraiment vous déconnecter ?")) {
          window.location.reload();
      }
  };

  const handleResetData = () => {
      if(confirm("ATTENTION : Cette action va effacer TOUTES les données (Orateurs, Visites, Hôtes, Paramètres) et restaurer l'application à son état initial.\n\nÊtes-vous sûr de vouloir continuer ?")) {
          if (confirm("Dernière confirmation : Tout sera supprimé définitivement.")) {
              resetAllData();
          }
      }
  };
  
  const handleNotificationChange = (key: string, value: any) => {
    const keys = key.split('.');
    if (keys.length > 1) {
        updateAppSettings({
            notifications: {
                ...appSettings.notifications,
                reminders: {
                    ...appSettings.notifications.reminders,
                    [keys[1]]: value
                }
            }
        });
    } else {
        updateAppSettings({
            notifications: {
                ...appSettings.notifications,
                [key]: value
            }
        });
    }
  };

  if (currentView === 'data') {
    return <DataManagementView onBack={() => setCurrentView('main')} />;
  }

  return (
    <>
      {showHelpModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={() => setShowHelpModal(false)}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-card-dark rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                 <span className="material-symbols-outlined text-3xl">support_agent</span>
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Aide et Support</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Pour toute question ou problème technique, veuillez contacter le support à l'adresse suivante :
              </p>
              <a href="mailto:support@example.com" className="font-semibold text-primary bg-primary/10 px-4 py-2 rounded-lg">
                support@example.com
              </a>
              <button 
                onClick={() => setShowHelpModal(false)} 
                className="mt-6 w-full py-3 bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white rounded-lg font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-full bg-background-light dark:bg-background-dark animate-in fade-in duration-300">
        <div className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
          <div className="flex flex-col gap-2 p-4 pb-2 w-full">
            <div className="flex items-center h-12 justify-between">
              <button 
                onClick={onBack}
                className="text-gray-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors md:hidden"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
              </button>
              <div className="flex gap-4 ml-auto">
                <button 
                  onClick={() => setShowHelpModal(true)}
                  className="text-gray-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[24px]">help</span>
                </button>
              </div>
            </div>
            <h1 className="text-gray-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight px-2">Paramètres</h1>
          </div>
        </div>

        <div className="w-full p-4 pb-24 space-y-6">
          
          {/* Section Synchronisation Simplifiée */}
          <section className="flex flex-col">
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider px-4 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">sync</span>
              Synchronisation Google Sheet
            </h3>
            <div className="bg-card-light dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSyncing ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'} dark:bg-white/5`}>
                    <span className={`material-symbols-outlined text-xl ${isSyncing ? 'animate-spin' : ''}`}>cloud_sync</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Planning en ligne</p>
                    <p className="text-[10px] text-gray-500 dark:text-text-secondary uppercase font-bold tracking-tight">
                      {syncConfig.lastSync 
                        ? `Dernière MAJ: ${new Date(syncConfig.lastSync).toLocaleDateString()} à ${new Date(syncConfig.lastSync).toLocaleTimeString()}` 
                        : 'Jamais synchronisé'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={syncData}
                  disabled={isSyncing}
                  className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSyncing ? 'En cours...' : 'Mettre à jour'}
                </button>
              </div>
              <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                 <button 
                   onClick={() => setCurrentView('data')}
                   className="text-[11px] font-bold text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
                 >
                   Paramètres de synchronisation avancés <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                 </button>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Section: Apparence */}
            <section className="flex flex-col">
              <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider px-4 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">palette</span>
                Apparence
              </h3>
              <div className="bg-card-light dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-white/5 p-4 space-y-4 h-full">
                <div className="bg-gray-100 dark:bg-black/20 rounded-xl p-1 flex">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${theme === 'light' ? 'bg-white dark:bg-surface-highlight text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'}`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${theme === 'light' ? 'filled' : ''}`}>light_mode</span>
                    Clair
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${theme === 'dark' ? 'bg-white dark:bg-surface-highlight text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'}`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${theme === 'dark' ? 'filled' : ''}`}>dark_mode</span>
                    Sombre
                  </button>
                  <button 
                    onClick={() => setTheme('system')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${theme === 'system' ? 'bg-white dark:bg-surface-highlight text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">brightness_auto</span>
                    Auto
                  </button>
                </div>
              </div>
            </section>

            {/* Section: Profil de la Congrégation */}
            <section className="flex flex-col">
              <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider px-4 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">groups</span>
                Profil
              </h3>
              <div className="bg-card-light dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-white/5 space-y-4 flex-1 relative overflow-hidden">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Congrég.</label>
                  <input 
                    name="congregationName"
                    className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm" 
                    type="text" 
                    value={appSettings.congregationName}
                    onChange={handleProfileChange}
                  />
                </div>
                 {isEditingProfile && (
                  <button 
                    onClick={handleProfileSave}
                    className="w-full mt-2 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-dark transition-colors animate-in fade-in duration-300"
                  >
                    Enregistrer
                  </button>
                )}
                {saveSuccess && (
                    <div className="absolute inset-0 bg-green-500/10 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-surface-dark px-4 py-2 rounded-xl shadow-lg border border-green-500/20 flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">Enregistré !</span>
                        </div>
                    </div>
                )}
              </div>
            </section>

            {/* Section: Notifications */}
            <section className="flex flex-col lg:col-span-2 xl:col-span-1">
              <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider px-4 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">notifications</span>
                Notifications
              </h3>
              <div className="bg-card-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-200 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5 h-full">
                <div className="flex items-center justify-between p-4">
                  <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-white font-medium">Notifications Push</span>
                    <span className="text-xs text-gray-500">Alertes temps réel</span>
                  </div>
                  <Toggle 
                    checked={appSettings.notifications.push}
                    onChange={(value) => handleNotificationChange('push', value)}
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="pt-4 max-w-sm mx-auto space-y-4">
            <button 
              onClick={() => setCurrentView('data')}
              className="w-full bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-300 font-bold py-3.5 rounded-2xl shadow-sm border border-gray-200 dark:border-white/5 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">settings_suggest</span>
              Gestion des données & Sauvegardes
            </button>
            
            <div className="border-t border-gray-200 dark:border-white/10 pt-4 mt-6">
                <button 
                onClick={handleResetData}
                className="w-full bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-bold py-3.5 rounded-2xl border border-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                <span className="material-symbols-outlined">delete_forever</span>
                Réinitialiser l'application
                </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsView;
