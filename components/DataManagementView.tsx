
import React, { useState, useRef } from 'react';
import { useData } from '../DataContext';
import { Speaker } from '../types';

interface DataManagementViewProps {
  onBack: () => void;
}

interface DuplicateGroup {
  id: string;
  type: 'speaker' | 'host' | 'visit';
  score: number;
  detectedBy: string[];
  itemA: any;
  itemB: any;
}

const DataManagementView: React.FC<DataManagementViewProps> = ({ onBack }) => {
  const { syncConfig, updateSyncConfig, syncData, isSyncing, exportData, openGoogleSheet, speakers, hosts, visits, mergeSpeakers, importData, seedOfficialSpeakers } = useData();
  const [activeTab, setActiveTab] = useState<'sync' | 'backup' | 'duplicates'>('sync');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'results'>('idle');
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  const levenshtein = (a: string, b: string): number => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const getSimilarity = (str1: string, str2: string) => {
    if (!str1 || !str2) return 0;
    const longer = str1.length > str2.length ? str1 : str2;
    if (longer.length === 0) return 1.0;
    return (longer.length - levenshtein(str1, str2)) / longer.length;
  };

  const startScan = () => {
    setScanStatus('scanning');
    setResolvedIds([]);
    setTimeout(() => {
        const found: DuplicateGroup[] = [];

        // Scan des orateurs
        const processedSpeakers = new Set<string>();
        for(let i=0; i<speakers.length; i++) {
            if(processedSpeakers.has(speakers[i].id)) continue;
            for(let j=i+1; j<speakers.length; j++) {
                if(processedSpeakers.has(speakers[j].id)) continue;
                const sA = speakers[i];
                const sB = speakers[j];
                const nameSim = getSimilarity(sA.name.toLowerCase(), sB.name.toLowerCase());
                const phoneA = sA.phone?.replace(/\D/g, '');
                const phoneB = sB.phone?.replace(/\D/g, '');
                const phoneMatch = phoneA && phoneB && phoneA === phoneB && phoneA.length > 5;
                if (nameSim > 0.8 || phoneMatch) {
                   const reasons = [];
                   if (nameSim > 0.8) reasons.push(`Noms similaires`);
                   if (phoneMatch) reasons.push('Même téléphone');
                   found.push({
                       id: `dup-speaker-${sA.id}-${sB.id}`,
                       type: 'speaker',
                       score: Math.round(Math.max(nameSim * 100, phoneMatch ? 100 : 0)),
                       detectedBy: reasons,
                       itemA: sA,
                       itemB: sB
                   });
                   processedSpeakers.add(sB.id);
                }
            }
        }

        // Scan des hôtes
        const processedHosts = new Set<string>();
        for(let i=0; i<hosts.length; i++) {
            if(processedHosts.has(hosts[i].id)) continue;
            for(let j=i+1; j<hosts.length; j++) {
                if(processedHosts.has(hosts[j].id)) continue;
                const hA = hosts[i];
                const hB = hosts[j];
                const nameSim = getSimilarity(hA.name.toLowerCase(), hB.name.toLowerCase());
                const locationSim = getSimilarity(hA.location.toLowerCase(), hB.location.toLowerCase());
                const phoneA = hA.phone?.replace(/\D/g, '');
                const phoneB = hB.phone?.replace(/\D/g, '');
                const phoneMatch = phoneA && phoneB && phoneA === phoneB && phoneA.length > 5;
                if (nameSim > 0.8 || locationSim > 0.8 || phoneMatch) {
                   const reasons = [];
                   if (nameSim > 0.8) reasons.push(`Noms similaires`);
                   if (locationSim > 0.8) reasons.push(`Adresses similaires`);
                   if (phoneMatch) reasons.push('Même téléphone');
                   found.push({
                       id: `dup-host-${hA.id}-${hB.id}`,
                       type: 'host',
                       score: Math.round(Math.max(nameSim * 100, locationSim * 100, phoneMatch ? 100 : 0)),
                       detectedBy: reasons,
                       itemA: hA,
                       itemB: hB
                   });
                   processedHosts.add(hB.id);
                }
            }
        }

        // Scan des visites (même orateur + même date)
        const processedVisits = new Set<string>();
        for(let i=0; i<visits.length; i++) {
            if(processedVisits.has(visits[i].id)) continue;
            for(let j=i+1; j<visits.length; j++) {
                if(processedVisits.has(visits[j].id)) continue;
                const vA = visits[i];
                const vB = visits[j];
                if (vA.speakerName === vB.speakerName && vA.date === vB.date) {
                   found.push({
                       id: `dup-visit-${vA.id}-${vB.id}`,
                       type: 'visit',
                       score: 100,
                       detectedBy: ['Même orateur et même date'],
                       itemA: vA,
                       itemB: vB
                   });
                   processedVisits.add(vB.id);
                }
            }
        }

        // Scan des discours (même numéro ou même titre)
        const processedSpeeches = new Set<string>();
        for(let i=0; i<visits.length; i++) {
            if(processedSpeeches.has(visits[i].id)) continue;
            for(let j=i+1; j<visits.length; j++) {
                if(processedSpeeches.has(visits[j].id)) continue;
                const vA = visits[i];
                const vB = visits[j];
                const numberMatch = vA.discoursNumber && vB.discoursNumber && vA.discoursNumber === vB.discoursNumber;
                const titleSim = vA.discoursTitle && vB.discoursTitle ?
                    getSimilarity(vA.discoursTitle.toLowerCase(), vB.discoursTitle.toLowerCase()) : 0;
                if (numberMatch || titleSim > 0.8) {
                   const reasons = [];
                   if (numberMatch) reasons.push('Même numéro de discours');
                   if (titleSim > 0.8) reasons.push('Titres similaires');
                   found.push({
                       id: `dup-speech-${vA.id}-${vB.id}`,
                       type: 'visit',
                       score: numberMatch ? 100 : Math.round(titleSim * 100),
                       detectedBy: reasons,
                       itemA: vA,
                       itemB: vB
                   });
                   processedSpeeches.add(vB.id);
                }
            }
        }

        setDuplicates(found);
        setScanStatus('results');
    }, 1500); // Increased timeout for more comprehensive scan
  };
  
  const handleResolve = (duplicateId: string, action: 'keepA' | 'keepB' | 'merge') => {
    const duplicate = duplicates.find(d => d.id === duplicateId);
    if (!duplicate) return;
    const sA = duplicate.itemA as Speaker;
    const sB = duplicate.itemB as Speaker;
    if (action === 'keepA') mergeSpeakers(sA.id, sB.id, {});
    else if (action === 'keepB') mergeSpeakers(sB.id, sA.id, {});
    else if (action === 'merge') {
        const merged: Partial<Speaker> = {
            ...sA,
            phone: sA.phone || sB.phone,
            email: sA.email || sB.email,
            congregation: sA.congregation || sB.congregation,
            avatar: sA.avatar || sB.avatar,
            status: sA.status === 'Actif' ? 'Actif' : sB.status
        };
        mergeSpeakers(sA.id, sB.id, merged);
    }
    setResolvedIds(prev => [...prev, duplicateId]);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) importData(event.target.result as string);
      };
      reader.readAsText(file);
      if(e.target) e.target.value = ''; 
    }
  };

  const TabButton = ({ active, onClick, label, icon }: any) => (
    <button 
    onClick={onClick}
    className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
        active 
        ? 'bg-white dark:bg-surface-highlight text-primary shadow-sm' 
        : 'text-gray-500 dark:text-text-secondary hover:bg-white/50 dark:hover:bg-white/5'
    }`}
    >
    <span className="material-symbols-outlined text-[18px]">{icon}</span>
    {label}
    </button>
  );

  return (
    <div className="flex flex-col min-h-full bg-background-light dark:bg-background-dark animate-in slide-in-from-right duration-300">
       <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".json" />
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={onBack} className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Gestion des Données</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6 pb-24">
        
        <div className="bg-gray-200 dark:bg-black/20 p-1 rounded-xl flex gap-1">
          <TabButton active={activeTab === 'sync'} onClick={() => setActiveTab('sync')} label="Synchro" icon="sync" />
          <TabButton active={activeTab === 'backup'} onClick={() => setActiveTab('backup')} label="Sauvegarde" icon="shield" />
          <TabButton active={activeTab === 'duplicates'} onClick={() => setActiveTab('duplicates')} label="Doublons" icon="content_copy" />
        </div>

        {activeTab === 'sync' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSyncing ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'} dark:bg-white/5`}>
                  <span className={`material-symbols-outlined text-2xl ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sync Multi-Onglets</h3>
                  <p className="text-xs text-gray-500 font-mono truncate max-w-[200px]">{syncConfig.sheetId}</p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                   onClick={syncData}
                   disabled={isSyncing}
                   className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                   {isSyncing ? 'Analyse des onglets...' : 'Synchroniser tout le document'}
                </button>
                
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full text-xs font-bold text-gray-400 py-2"
                >
                  {showAdvanced ? 'Masquer réglages techniques' : 'Afficher réglages techniques'}
                </button>

                {showAdvanced && (
                  <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-white/5 animate-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase px-1">ID Document Google</label>
                      <input 
                        value={syncConfig.sheetId}
                        onChange={(e) => updateSyncConfig({ sheetId: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-mono dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={openGoogleSheet} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-white/5 group">
                 <span className="material-symbols-outlined text-2xl text-green-600 mb-2">table_view</span>
                 <span className="text-xs font-bold text-gray-900 dark:text-white">Ouvrir Sheet</span>
              </button>
              <button onClick={() => seedOfficialSpeakers()} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-white/5 group">
                 <span className="material-symbols-outlined text-2xl text-purple-500 mb-2">person_check</span>
                 <span className="text-xs font-bold text-gray-900 dark:text-white">Réinitialiser</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-4 animate-in fade-in duration-300">
             <button 
               onClick={() => exportData()}
               className="w-full flex items-center gap-4 p-5 bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm text-left"
             >
               <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                 <span className="material-symbols-outlined">download</span>
               </div>
               <div>
                 <p className="font-bold text-gray-900 dark:text-white">Exporter les données</p>
                 <p className="text-xs text-gray-500">Télécharger une sauvegarde JSON</p>
               </div>
             </button>

             <button 
               onClick={() => fileInputRef.current?.click()}
               className="w-full flex items-center gap-4 p-5 bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm text-left"
             >
               <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                 <span className="material-symbols-outlined">upload_file</span>
               </div>
               <div>
                 <p className="font-bold text-gray-900 dark:text-white">Importer une sauvegarde</p>
                 <p className="text-xs text-gray-500">Restaurer un fichier .json</p>
               </div>
             </button>
          </div>
        )}

        {activeTab === 'duplicates' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-white/5 shadow-sm text-center">
               {scanStatus === 'idle' && (
                   <>
                       <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">content_copy</span>
                       <h3 className="font-bold dark:text-white">Nettoyage des doublons</h3>
                       <p className="text-xs text-gray-500 mb-4">Analyse complète de toutes les données (orateurs, hôtes, visites, discours).</p>
                       <button onClick={startScan} className="w-full bg-primary/10 text-primary py-3 rounded-xl font-bold">Lancer l'analyse</button>
                   </>
               )}
               {scanStatus === 'scanning' && <span className="flex items-center justify-center gap-2"><span className="material-symbols-outlined animate-spin">sync</span> Analyse...</span>}
               {scanStatus === 'results' && duplicates.length === 0 && <p className="text-green-500 font-bold">Aucun doublon trouvé !</p>}
               {scanStatus === 'results' && duplicates.length > 0 && (
                   <div className="space-y-4 text-left">
                       {duplicates.map(dup => {
                           if (resolvedIds.includes(dup.id)) return null;
                           return (
                               <div key={dup.id} className="border border-gray-100 dark:border-white/5 rounded-xl p-3 space-y-3">
                                   <div className="flex justify-between text-[10px] font-bold text-red-500">
                                       <span>SIMILITUDE: {dup.score}%</span>
                                       <span>{dup.detectedBy[0]}</span>
                                   </div>
                                   <div className="grid grid-cols-2 gap-2 text-xs">
                                       <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                           <p className="font-bold dark:text-white">{dup.itemA.name}</p>
                                           <button onClick={() => handleResolve(dup.id, 'keepA')} className="mt-2 text-blue-500 font-bold">Garder</button>
                                       </div>
                                       <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                           <p className="font-bold dark:text-white">{dup.itemB.name}</p>
                                           <button onClick={() => handleResolve(dup.id, 'keepB')} className="mt-2 text-orange-500 font-bold">Garder</button>
                                       </div>
                                   </div>
                               </div>
                           );
                       })}
                   </div>
               )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DataManagementView;
