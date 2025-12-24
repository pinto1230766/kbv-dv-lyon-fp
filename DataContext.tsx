
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Visit, Speaker, Host, ActionItem, SyncConfig, AppSettings } from './types';
import { fetchSheetData, normalizeString } from './utils/sheetSync';
import { GoogleGenAI } from "@google/genai";
import { notificationManager } from './utils/notificationManager';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface DataContextType {
  visits: Visit[];
  speakers: Speaker[];
  hosts: Host[];
  actions: ActionItem[];
  appSettings: AppSettings;
  syncConfig: SyncConfig;
  isSyncing: boolean;
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  addVisit: (visit: Partial<Visit>) => void;
  updateVisit: (id: string, visit: Partial<Visit>) => void;
  deleteVisit: (id: string) => void;
  addSpeaker: (speaker: Partial<Speaker>) => void;
  updateSpeaker: (id: string, speaker: Partial<Speaker>) => void;
  deleteSpeaker: (id: string) => void;
  mergeSpeakers: (keepId: string, mergeId: string, data: Partial<Speaker>) => void;
  resetToDefaultHosts: () => void;
  addHost: (host: Partial<Host>) => void;
  updateHost: (id: string, host: Partial<Host>) => void;
  deleteHost: (id: string) => void;
  removeAction: (id: string) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  resetAllData: () => void;
  syncData: () => Promise<void>;
  updateSyncConfig: (config: Partial<SyncConfig>) => void;
  exportData: () => void;
  importData: (json: string) => void;
  restoreArchivedVisit: (visit: Visit) => void;
  generateAIMessage: (prompt: string) => Promise<string>;
  openGoogleSheet: () => void;
  seedOfficialSpeakers: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const OFFICIAL_HOSTS: Host[] = [
  { id: 'h1', name: 'Jean-Paul Batista', location: '182 Avenue Felix Faure, 69003 Lyon', capacity: 2, capacityIcon: 'bed', available: true, initials: 'JP', gradient: 'from-blue-600 to-cyan-500' },
  { id: 'h2', name: 'Suzy', location: '14 bis Montée des Roches, 69009 Lyon', capacity: 2, capacityIcon: 'bed', available: true, initials: 'S', gradient: 'from-pink-500 to-rose-400' },
  { id: 'h3', name: 'Alexis', location: '13 Avenue Debrousse, 69005 Lyon', capacity: 2, capacityIcon: 'bed', available: true, initials: 'A', gradient: 'from-indigo-600 to-purple-500' },
  { id: 'h4', name: 'Andréa', location: '25c Rue Georges Courteline, Villeurbanne', capacity: 2, capacityIcon: 'bed', available: true, initials: 'A', gradient: 'from-emerald-600 to-teal-500' },
  { id: 'h5', name: 'Dara & Lia', location: '16 Rue Imbert Colomes, 69001 Lyon', capacity: 2, capacityIcon: 'bed', available: true, initials: 'DL', gradient: 'from-orange-500 to-yellow-500' },
  { id: 'h6', name: 'José Freitas', location: '27 Av Maréchal Foch, 69110', capacity: 2, capacityIcon: 'bed', available: true, initials: 'JF', gradient: 'from-sky-500 to-blue-400' },
  { id: 'h7', name: 'Paulo Martins', location: '18 Rue des Soeurs Bouviers, 69005 Lyon', capacity: 2, capacityIcon: 'bed', available: true, initials: 'PM', gradient: 'from-amber-600 to-orange-500' },
  { id: 'h8', name: 'Fátima', location: '9 Chemin de la Vire, Caluire', capacity: 2, capacityIcon: 'bed', available: true, initials: 'F', gradient: 'from-red-600 to-pink-500' },
  { id: 'h9', name: 'Sanches', location: '132 Av. L\'Aqueduc de Beaunant, 69110 Ste Foy', capacity: 2, capacityIcon: 'bed', available: true, initials: 'S', gradient: 'from-violet-600 to-fuchsia-500' },
  { id: 'h10', name: 'Torres', location: '15 Cours Rouget de l\'Isle, Rillieux', capacity: 2, capacityIcon: 'bed', available: true, initials: 'T', gradient: 'from-lime-600 to-green-500' },
  { id: 'h11', name: 'Nathalie', location: '86 Rue Pierre Delore, 69008 Lyon', capacity: 2, capacityIcon: 'bed', available: true, initials: 'N', gradient: 'from-fuchsia-600 to-pink-500' },
  { id: 'h12', name: 'Francisco Pinto', location: '20 Rue Professeur Patel, 69009 Lyon', capacity: 2, capacityIcon: 'bed', available: true, initials: 'FP', gradient: 'from-cyan-600 to-blue-500' }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [dismissedActionIds, setDismissedActionIds] = useState<string[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [appSettings, setAppSettings] = useState<AppSettings>({
    congregationName: 'KBV Lyon',
    city: 'Lyon',
    userName: 'Responsable',
    notifications: {
      push: true,
      confirmations: true,
      cancellations: true,
      newAssignments: true,
      reminders: {
        enabled: true,
        sevenDays: true,
        threeDays: true,
        oneDay: true
      }
    }
  });

  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    sheetId: '1drIzPPi6AohCroSyUkF1UmMFxuEtMACBF4XATDjBOcg',
    visitsGid: '', 
    lastSync: null,
    autoSync: false
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  const generateAIMessage = async (prompt: string): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Assistant de rédaction fraternel pour responsable de congrégation.",
          temperature: 0.7
        }
      });
      return response.text || "Erreur de génération.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Désolé, l'IA n'est pas disponible pour le moment.";
    }
  };

  const syncData = async () => {
    setIsSyncing(true);
    showToast("Synchronisation en cours...", "info");
    try {
      const result = await fetchSheetData(syncConfig);
      if (result.success) {
        setVisits(prev => {
          const manual = prev.filter(v => !v.id.startsWith('sync-'));
          return [...manual, ...result.visits];
        });
        setSpeakers(prev => {
          const names = new Set(prev.map(s => normalizeString(s.name)));
          const filteredNew = result.newSpeakers.filter(s => !names.has(normalizeString(s.name)));
          return [...prev, ...filteredNew];
        });
        setSyncConfig(prev => ({ ...prev, lastSync: new Date().toISOString() }));
        showToast("✓ Synchronisation réussie", "success");
      } else {
        showToast("✗ Échec de la synchronisation", "error");
      }
    } catch (e) {
      showToast("✗ Erreur réseau", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const openGoogleSheet = () => {
    if (syncConfig.sheetId) {
      window.open(`https://docs.google.com/spreadsheets/d/${syncConfig.sheetId}`, '_blank');
    }
  };

  useEffect(() => {
    const load = () => {
      try {
        const v = localStorage.getItem('visits');
        if (v) setVisits(JSON.parse(v));
        
        const s = localStorage.getItem('speakers');
        if (s) setSpeakers(JSON.parse(s));
        
        const h = localStorage.getItem('hosts');
        const parsedHosts = h ? JSON.parse(h) : [];
        setHosts(parsedHosts.length > 0 ? parsedHosts : OFFICIAL_HOSTS);
        
        const st = localStorage.getItem('appSettings');
        if (st) setAppSettings(JSON.parse(st));
        
        const sc = localStorage.getItem('syncConfig');
        if (sc) setSyncConfig(JSON.parse(sc));
        
        const d = localStorage.getItem('dismissedActionIds');
        if (d) setDismissedActionIds(JSON.parse(d));
      } catch (e) {
        console.error("Storage Error", e);
        setHosts(OFFICIAL_HOSTS);
      } finally {
        setIsInitialized(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('visits', JSON.stringify(visits));
    localStorage.setItem('speakers', JSON.stringify(speakers));
    localStorage.setItem('hosts', JSON.stringify(hosts));
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
    localStorage.setItem('syncConfig', JSON.stringify(syncConfig));
    localStorage.setItem('dismissedActionIds', JSON.stringify(dismissedActionIds));
  }, [visits, speakers, hosts, appSettings, syncConfig, dismissedActionIds, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    const today = new Date();
    today.setHours(0,0,0,0);
    const newActions: ActionItem[] = [];

    visits.forEach(v => {
      if (v.status === 'Cancelled') return;
      const vDate = new Date(v.date);
      const diff = Math.ceil((vDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

      if (!v.hostId && diff >= 0) {
        newActions.push({
          id: `host-req-${v.id}`,
          title: `Assigner un hôte : ${v.speakerName}`,
          subtitle: `Le ${v.date} - Aucun hébergement`,
          icon: 'home_work',
          color: 'bg-blue-100 text-blue-600',
          visitId: v.id
        });
      }

      if (v.status !== 'Confirmed' && diff <= 7 && diff >= 0) {
        newActions.push({
          id: `conf-req-${v.id}`,
          title: `Confirmer ${v.speakerName}`,
          subtitle: `Dans ${diff} jours`,
          icon: diff <= 2 ? 'warning' : 'notifications_active',
          color: diff <= 2 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600',
          visitId: v.id
        });
      }
    });

    setActions(newActions.filter(a => !dismissedActionIds.includes(a.id)));
  }, [visits, dismissedActionIds, isInitialized]);

  // Programmer les notifications pour les visites futures
  useEffect(() => {
    if (!isInitialized || !appSettings.notifications.push) return;

    const futureVisits = visits.filter(v => {
      if (v.status === 'Cancelled') return false;
      const visitDate = new Date(v.date);
      const today = new Date();
      return visitDate > today;
    });

    if (futureVisits.length > 0) {
      console.log(`Programmation des notifications pour ${futureVisits.length} visites futures`);
      notificationManager.scheduleAllUpcomingVisits(futureVisits);
    }
  }, [visits, isInitialized, appSettings.notifications.push]);

  const addVisit = (v: Partial<Visit>) => setVisits(p => [...p, { ...v, id: `man-${Date.now()}` } as Visit]);
  const updateVisit = (id: string, v: Partial<Visit>) => setVisits(p => p.map(x => x.id === id ? { ...x, ...v } : x));
  const deleteVisit = (id: string) => setVisits(p => p.filter(x => x.id !== id));
  const addSpeaker = (s: Partial<Speaker>) => setSpeakers(p => [...p, { ...s, id: `sp-${Date.now()}` } as Speaker]);
  const updateSpeaker = (id: string, s: Partial<Speaker>) => setSpeakers(p => p.map(x => x.id === id ? { ...x, ...s } : x));
  const deleteSpeaker = (id: string) => setSpeakers(p => p.filter(x => x.id !== id));
  const mergeSpeakers = (keepId: string, mergeId: string, data: Partial<Speaker>) => {
    setSpeakers(p => p.filter(x => x.id !== mergeId).map(x => x.id === keepId ? { ...x, ...data } : x));
    setVisits(p => p.map(v => v.speakerId === mergeId ? { ...v, speakerId: keepId } : v));
  };
  const addHost = (h: Partial<Host>) => setHosts(p => [...p, { ...h, id: `h-${Date.now()}` } as Host]);
  const updateHost = (id: string, h: Partial<Host>) => setHosts(p => p.map(x => x.id === id ? { ...x, ...h } : x));
  const deleteHost = (id: string) => setHosts(p => p.filter(x => x.id !== id));
  const resetToDefaultHosts = () => setHosts(OFFICIAL_HOSTS);
  const removeAction = (id: string) => setDismissedActionIds(p => [...p, id]);
  const updateAppSettings = (s: Partial<AppSettings>) => setAppSettings(p => ({ ...p, ...s }));
  const resetAllData = () => { localStorage.clear(); window.location.reload(); };
  const updateSyncConfig = (c: Partial<SyncConfig>) => setSyncConfig(p => ({ ...p, ...c }));
  const exportData = () => {
    const data = JSON.stringify({ visits, speakers, hosts, appSettings, syncConfig }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup_kbv_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };
  const importData = (json: string) => {
    try {
      const d = JSON.parse(json);
      if (d.visits) setVisits(d.visits);
      if (d.speakers) setSpeakers(d.speakers);
      if (d.hosts) setHosts(d.hosts);
      showToast("Données importées", "success");
    } catch { showToast("Erreur d'importation", "error"); }
  };
  const restoreArchivedVisit = (v: Visit) => setVisits(p => [...p, { ...v, id: `rest-${Date.now()}`, status: 'Pending' }]);
  const seedOfficialSpeakers = () => {};

  return (
    <DataContext.Provider value={{
      visits, speakers, hosts, actions, appSettings, syncConfig, isSyncing, toast,
      showToast, hideToast, addVisit, updateVisit, deleteVisit, addSpeaker, updateSpeaker, deleteSpeaker, mergeSpeakers,
      resetToDefaultHosts, addHost, updateHost, deleteHost, removeAction, updateAppSettings, resetAllData,
      syncData, updateSyncConfig, exportData, importData, restoreArchivedVisit, generateAIMessage,
      openGoogleSheet, seedOfficialSpeakers
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};
