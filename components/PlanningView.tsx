
import React, { useState, useEffect, useMemo } from 'react';
import VisitDetails from './VisitDetails';
import AddVisitView from './AddVisitView';
import { useData } from '../DataContext';
import { Visit, TabType, NavigationProps, Speaker, Host } from '../types';
import { normalizeString } from '../utils/sheetSync';

interface PlanningViewProps {
  onNavigate: (tab: TabType, props?: NavigationProps) => void;
  initialProps?: NavigationProps | null;
  onActionHandled?: () => void;
}

const PlanningView: React.FC<PlanningViewProps> = ({ onNavigate, initialProps, onActionHandled }) => {
  const { visits, addVisit, updateVisit } = useData();
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [isAddingVisit, setIsAddingVisit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Pending' | 'Cancelled'>('All');

  useEffect(() => {
    if (initialProps?.action === 'add') {
      setIsAddingVisit(true);
      onActionHandled?.();
    }
    if (initialProps?.visitId) {
      setSelectedVisitId(initialProps.visitId);
      onActionHandled?.();
    }
  }, [initialProps, onActionHandled]);

  const filteredVisits = useMemo(() => {
    const term = normalizeString(searchTerm);
    return (visits || []).filter(v => {
      if (statusFilter !== 'All' && v.status !== statusFilter) return false;
      return term === '' || 
        normalizeString(v.speakerName).includes(term) || 
        normalizeString(v.congregation).includes(term);
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [visits, searchTerm, statusFilter]);

  const selectedVisit = visits.find(v => v.id === selectedVisitId) || null;

  if (selectedVisit) return <VisitDetails visit={selectedVisit} onBack={() => setSelectedVisitId(null)} onEdit={setEditingVisit} onNavigate={onNavigate} />;
  if (isAddingVisit || editingVisit) return <AddVisitView onClose={() => {setIsAddingVisit(false); setEditingVisit(null);}} onSave={(v) => editingVisit ? updateVisit(editingVisit.id, v) : addVisit(v)} visitToEdit={editingVisit || undefined} />;

  return (
    <div className="flex flex-col min-h-full pb-24">
      <header className="pt-6 px-4 space-y-4 sticky top-0 bg-background-light dark:bg-background-dark z-20 pb-4 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Planning</h2>
          <button onClick={() => setIsAddingVisit(true)} className="size-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 flex items-center justify-center active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        </div>
        
        <div className="flex gap-2">
            <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input 
                  type="text"
                  placeholder="Rechercher une visite..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 h-12 rounded-xl bg-gray-100 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-primary text-sm shadow-inner"
                />
            </div>
            <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                {(['All', 'Confirmed', 'Pending'] as const).map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white dark:bg-surface-dark shadow text-primary' : 'text-gray-500'}`}>
                        {s === 'All' ? 'Tout' : s === 'Confirmed' ? 'V' : '?'}
                    </button>
                ))}
            </div>
        </div>
      </header>

      <main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {filteredVisits.map(v => (
          <div 
            key={v.id} 
            onClick={() => setSelectedVisitId(v.id)}
            className="bg-white dark:bg-surface-dark p-5 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">{v.dayName} {v.date.split('-').reverse().slice(0,2).join('/')}</p>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-primary transition-colors">{v.speakerName}</h4>
               </div>
               <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
                 v.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
               }`}>{v.status}</span>
            </div>

            <div className="flex items-center gap-4 py-3 border-t border-gray-50 dark:border-white/5">
                <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hébergement</p>
                    {v.hostName ? (
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-green-500">home</span>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{v.hostName}</span>
                        </div>
                    ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('hosts', { visitId: v.id });
                          }}
                          className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-500/20 animate-pulse hover:scale-105 transition-transform"
                        >
                            <span className="material-symbols-outlined text-[16px]">add_home</span>
                            <span className="text-[10px] font-black uppercase tracking-tighter">Assigner Requis</span>
                        </button>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Réunion</p>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{v.meetingType}</span>
                </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 italic truncate opacity-70 group-hover:opacity-100 transition-opacity">
                "{v.discoursTitle || 'Thème à venir...'}"
            </div>
          </div>
        ))}
        {filteredVisits.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-50">
                <span className="material-symbols-outlined text-5xl mb-2">event_busy</span>
                <p className="font-bold">Aucune visite trouvée</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default PlanningView;
