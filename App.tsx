import React, { useState, lazy, Suspense, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import { TabType, NavigationProps } from './types';
import { DataProvider, useData } from './DataContext';

// Lazy loading des composants pour améliorer les performances
const Dashboard = lazy(() => import('./components/Dashboard'));
const PlanningView = lazy(() => import('./components/PlanningView'));
const MessagesView = lazy(() => import('./components/MessagesView'));
const SpeakersView = lazy(() => import('./components/SpeakersView'));
const HostsView = lazy(() => import('./components/HostsView'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const GlobalSearch = lazy(() => import('./components/GlobalSearch'));
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal'));

// Composant de chargement
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-bold text-gray-500 dark:text-gray-400 animate-pulse">
        Chargement...
      </p>
    </div>
  </div>
);

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
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-300 animate-in slide-in-from-top-4 fade-in duration-300 w-[90%] max-w-sm">
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
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const { syncData } = useData();

  const handleNavigation = (tab: TabType, props?: NavigationProps) => {
    setActiveTab(tab);
    setInitialViewProps(props || null);
  };

  const clearInitialProps = () => setInitialViewProps(null);

  // Raccourcis clavier globaux
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si dans un input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Ctrl/Cmd + K : Recherche globale
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(true);
        return;
      }

      // Ctrl/Cmd + S : Synchroniser
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        syncData();
        return;
      }

      // Raccourcis simples
      switch (e.key.toLowerCase()) {
        case '?':
          setShowKeyboardHelp(true);
          break;
        case '1':
          handleNavigation('dashboard');
          break;
        case '2':
          handleNavigation('planning');
          break;
        case '3':
          handleNavigation('speakers');
          break;
        case '4':
          handleNavigation('hosts');
          break;
        case '5':
          handleNavigation('messages');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [syncData]);

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
          <Suspense fallback={<LoadingFallback />}>
            {renderContent()}
          </Suspense>
        </main>
        <div className="md:hidden">
          <BottomNav activeTab={activeTab} onTabChange={(tab) => handleNavigation(tab)} />
        </div>
      </div>

      {/* Recherche globale */}
      {showGlobalSearch && (
        <Suspense fallback={null}>
          <GlobalSearch
            onClose={() => setShowGlobalSearch(false)}
            onNavigate={(tab, props) => {
              handleNavigation(tab, props);
              setShowGlobalSearch(false);
            }}
          />
        </Suspense>
      )}

      {/* Modal d'aide raccourcis clavier */}
      {showKeyboardHelp && (
        <Suspense fallback={null}>
          <KeyboardShortcutsModal onClose={() => setShowKeyboardHelp(false)} />
        </Suspense>
      )}
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
