
import React, { useState, useMemo } from 'react';
import { useData } from '../DataContext';
import { Visit } from '../types';
import { normalizeString } from '../utils/sheetSync';
import { getShortTitle, getFullTitle, isAssembly } from '../utils/assemblyTitles';

interface ArchivesViewProps {
  onBack: () => void;
}

const ArchivesView: React.FC<ArchivesViewProps> = ({ onBack }) => {
  const { visits, restoreArchivedVisit } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const archivedVisits = useMemo(() => {
    const todayISO = new Date().toLocaleDateString('fr-CA');
    return visits
      .filter(v => v.date < todayISO)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [visits]);

  const filteredVisits = useMemo(() => {
    const normalizedSearch = normalizeString(searchTerm);
    if (!normalizedSearch) return archivedVisits;
    return archivedVisits.filter(visit => 
      normalizeString(visit.speakerName).includes(normalizedSearch) ||
      normalizeString(visit.congregation).includes(normalizedSearch) ||
      normalizeString(visit.discoursTitle || '').includes(normalizedSearch)
    );
  }, [archivedVisits, searchTerm]);

  const handleRestore = (visit: Visit) => {
    if (confirm(`Voulez-vous restaurer cette visite et la reprogrammer à la date d'aujourd'hui ?`)) {
      restoreArchivedVisit(visit);
      alert(`Visite de ${visit.speakerName} restaurée.`);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-background-light dark:bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 h-16 flex items-center justify-between px-4">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-900 dark:text-white"><span className="material-symbols-outlined">arrow_back</span></button>
        <h1 className="text-lg font-bold">Archives des Visites</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 p-4 space-y-6 pb-24">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input type="text" placeholder="Rechercher orateur, thème, congrégation..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        {filteredVisits.length > 0 ? (
          <div className="space-y-3">
            {filteredVisits.map(v => (
              <div key={v.id} className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm flex items-center gap-4">
                <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-black/20 w-14 h-14 rounded-lg shrink-0">
                  <span className="text-xl font-bold">{v.date.split('-')[2]}</span>
                  <span className="text-[10px] font-bold uppercase">{v.month}</span>
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="font-bold truncate">{v.speakerName}</h4>
                   <div className="flex items-center gap-2">
                      {v.discoursTitle && isAssembly(v.discoursTitle) && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {getShortTitle(v.discoursTitle)}
                        </span>
                      )}
                      <p className="text-sm text-gray-500 truncate flex-1">
                        {v.discoursTitle ? getFullTitle(v.discoursTitle) : `Discours #${v.discoursNumber}`}
                      </p>
                   </div>
                </div>
                <button onClick={() => handleRestore(v)} className="size-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-primary"><span className="material-symbols-outlined">restore</span></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-50">Aucun historique trouvé.</div>
        )}
      </main>
    </div>
  );
};

export default ArchivesView;
