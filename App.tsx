import React, { useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PlanningView from './components/PlanningView';
import MessagesView from './components/MessagesView';
import SpeakersView from './components/SpeakersView';
import HostsView from './components/HostsView';
import SettingsView from './components/SettingsView';
import { TabType, NavigationProps } from './types';
import { DataProvider, useData } from './DataContext';

const Toast: React.FC = () => {
  const data = useData();
  if (!data || !data.toast) return null;
  const { toast, hideToast } = data;

  const config = {
    success: { bg: 'bg-green-600', icon: 'check_circle', label: 'SUCCÈS' },
    error: { bg: 'bg-red-600', icon: 'cancel', label: 'ERREUR' },
    info: { bg: 'bg-primary', icon: 'info', label: 'INFO' }
  };

  const currentConfig = config[toast.type] || config.info;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-4 fade-in duration-300 w-[90%] max-w-sm">
      <div className={`${currentConfig.bg} text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20`}>
        <div className="bg-white/20 rounded-full p-1.5 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">{currentConfig.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black tracking-widest opacity-70 leading-none mb-1">{currentConfig.label}</p>
            <p className="text-sm font-bold leading-tight">{toast.message}</p>
        </div>
        <button onClick={hideToast} className="p-1 hover:bg-white/10 rounded-full transition-colors">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [initialViewProps, setInitialViewProps] = useState<NavigationProps | null>(null);

  const handleNavigation = (tab: TabType, props?: NavigationProps) => {
    setActiveTab(tab);
    setInitialViewProps(props || null);
  };

  const clearInitialProps = () => setInitialViewProps(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={handleNavigation} />;
      case 'planning': return <PlanningView onNavigate={handleNavigation} initialProps={initialViewProps} onActionHandled={clearInitialProps} />;
      case 'messages': return <MessagesView initialProps={initialViewProps} onActionHandled={clearInitialProps} />;
      case 'speakers': return <SpeakersView onNavigate={handleNavigation} initialProps={initialViewProps} onActionHandled={clearInitialProps} />;
      case 'hosts': return <HostsView onNavigate={handleNavigation} initialProps={initialViewProps} onActionHandled={clearInitialProps} />;
      case 'settings': return <SettingsView onBack={() => setActiveTab('dashboard')} />;
      default: return <Dashboard onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-background-light dark:bg-background-dark text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
      <Toast />
      <Sidebar activeTab={activeTab} onTabChange={(tab) => handleNavigation(tab)} />
      <div className="flex-1 flex flex-col relative overflow-hidden h-full">
        {activeTab === 'dashboard' && <Header onProfileClick={() => setActiveTab('settings')} onNavigate={handleNavigation} />}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-0 md:p-6 w-full">
          {renderContent()}
        </main>
        <div className="md:hidden">
          <BottomNav activeTab={activeTab} onTabChange={(tab) => handleNavigation(tab)} />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
