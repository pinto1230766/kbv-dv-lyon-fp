
import React, { useState, useEffect, useMemo, useRef } from 'react';
import SpeakerProfile from './SpeakerProfile';
import AddSpeakerView from './AddSpeakerView';
import { useData } from '../DataContext';
import { Speaker, TabType, NavigationProps } from '../types';
import { normalizeString } from '../utils/sheetSync';

interface SpeakersViewProps {
  onNavigate: (tab: TabType, props?: NavigationProps) => void;
  initialProps?: NavigationProps | null;
  onActionHandled?: () => void;
}

const SpeakersView: React.FC<SpeakersViewProps> = ({ onNavigate, initialProps, onActionHandled }) => {
  const { speakers, addSpeaker, updateSpeaker, visits } = useData();
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [isAddingSpeaker, setIsAddingSpeaker] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'Actif' | 'Inactif' | 'En pause'>('Tous');
  const [viewMode, setViewMode] = useState<'list' | 'group'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'congregation' | 'last-visit'>('name');

  useEffect(() => {
    if (initialProps?.action === 'add') {
      setIsAddingSpeaker(true);
      onActionHandled?.();
    }
    if (initialProps?.speakerId) {
        const speaker = speakers.find(s => s.id === initialProps.speakerId);
        if (speaker) setSelectedSpeaker(speaker);
        onActionHandled?.();
    }
  }, [initialProps, onActionHandled, speakers]);

  const getLastVisitDate = useMemo(() => {
    const map = new Map<string, number>();
    visits.forEach(v => {
        const d = new Date(v.date).getTime();
        if (v.speakerId) {
            const current = map.get(v.speakerId) || 0;
            if (d > current) map.set(v.speakerId, d);
        }
    });
    return map;
  }, [visits]);

  const filteredSpeakers = useMemo(() => {
    const normalizedSearch = normalizeString(searchTerm);
    let result = speakers.filter(speaker => {
      const matchesSearch = normalizedSearch === '' || 
        normalizeString(speaker.name).includes(normalizedSearch) ||
        normalizeString(speaker.congregation).includes(normalizedSearch);
      
      const matchesStatus = statusFilter === 'Tous' || speaker.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return result.sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'congregation') return a.congregation.localeCompare(b.congregation) || a.name.localeCompare(b.name);
        if (sortBy === 'last-visit') {
            const dateA = getLastVisitDate.get(a.id) || 0;
            const dateB = getLastVisitDate.get(b.id) || 0;
            return dateB - dateA;
        }
        return 0;
    });
  }, [speakers, searchTerm, statusFilter, sortBy, getLastVisitDate]);

  const groupedSpeakers = useMemo(() => {
      if (viewMode !== 'group') return null;
      const groups: Record<string, Speaker[]> = {};
      filteredSpeakers.forEach(s => {
          const key = s.congregation.charAt(0).toUpperCase() + s.congregation.slice(1);
          if (!groups[key]) groups[key] = [];
          groups[key].push(s);
      });
      return groups;
  }, [filteredSpeakers, viewMode]);

  const handleSaveSpeaker = (speakerData: Partial<Speaker>) => {
    if (editingSpeaker) {
      updateSpeaker(editingSpeaker.id, speakerData);
      setEditingSpeaker(null);
    } else {
      addSpeaker(speakerData);
      setIsAddingSpeaker(false);
    }
  };

  if (selectedSpeaker) {
    return <SpeakerProfile speaker={selectedSpeaker} onBack={() => setSelectedSpeaker(null)} onEditRequest={(s) => {setSelectedSpeaker(null); setEditingSpeaker(s)}} onNavigate={onNavigate} />;
  }
  if (isAddingSpeaker || editingSpeaker) {
    return <AddSpeakerView onClose={() => {setIsAddingSpeaker(false); setEditingSpeaker(null)}} onSave={handleSaveSpeaker} speakerToEdit={editingSpeaker || undefined} />;
  }

  return (
    <div className="flex flex-col min-h-full bg-background-light dark:bg-background-dark animate-in fade-in duration-300">
      <header className="flex-none pt-6 px-4 bg-background-light dark:bg-background-dark sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Orateurs</h2>
          <button onClick={() => setIsAddingSpeaker(true)} className="w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center transition-all active:scale-95"><span className="material-symbols-outlined text-3xl">add</span></button>
        </div>
        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
             <div className="relative flex-1 flex items-center h-12 rounded-xl bg-gray-100 dark:bg-surface-highlight overflow-hidden shadow-sm border border-transparent focus-within:border-primary/50 transition-all">
                <span className="material-symbols-outlined absolute left-3 text-gray-500">search</span>
                <input className="w-full h-full pl-10 pr-2 outline-none text-sm bg-transparent placeholder-gray-400" placeholder="Rechercher orateur ou congrégation..." type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="bg-gray-200 dark:bg-surface-highlight p-1 rounded-xl flex shrink-0">
                <button onClick={() => setViewMode('list')} className={`h-10 px-3 flex items-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-surface-dark shadow text-gray-900 dark:text-white font-bold' : 'text-gray-500'}`}><span className="material-symbols-outlined">list</span></button>
                <button onClick={() => setViewMode('group')} className={`h-10 px-3 flex items-center rounded-lg transition-all ${viewMode === 'group' ? 'bg-white dark:bg-surface-dark shadow text-gray-900 dark:text-white font-bold' : 'text-gray-500'}`}><span className="material-symbols-outlined">groups</span></button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {(['Tous', 'Actif', 'Inactif', 'En pause'] as const).map((status) => (
                <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${statusFilter === status ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-md' : 'text-gray-500 border-gray-200 dark:border-white/10'}`}>{status}</button>
            ))}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
        {viewMode === 'group' && groupedSpeakers ? (
            /* FIX: Casting Object.entries to ensure 'group' is inferred as Speaker[] instead of unknown */
            (Object.entries(groupedSpeakers) as [string, Speaker[]][]).map(([cong, group]) => (
                <div key={cong} className="space-y-2">
                    <div className="sticky top-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm py-2 z-[5] border-b border-gray-100 dark:border-white/5 flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white uppercase">{cong}</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{group.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {group.map(s => <SpeakerCard key={s.id} speaker={s} onClick={() => setSelectedSpeaker(s)} />)}
                    </div>
                </div>
            ))
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredSpeakers.length === 0 ? <p className="col-span-full py-20 text-center opacity-50">Aucun orateur trouvé.</p> : filteredSpeakers.map(s => <SpeakerCard key={s.id} speaker={s} onClick={() => setSelectedSpeaker(s)} />)}
            </div>
        )}
      </main>
    </div>
  );
};

const SpeakerCard = ({ speaker, onClick }: any) => (
    <div onClick={onClick} className="flex items-center gap-4 bg-white dark:bg-surface-dark p-3 rounded-xl shadow-sm border border-gray-200 dark:border-transparent hover:border-primary/50 transition-all cursor-pointer active:scale-[0.98]">
        <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">{speaker.initials || speaker.name.charAt(0)}</div>
        <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white truncate">{speaker.name}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 truncate"><span className="material-symbols-outlined text-[14px]">groups</span>{speaker.congregation}</p>
        </div>
        {speaker.status !== 'Actif' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{speaker.status}</span>}
    </div>
);

export default SpeakersView;
