
import React from 'react';
import { useData } from '../DataContext';
import { Visit, TabType, NavigationProps } from '../types';

interface VisitsListProps {
  onViewAll?: () => void;
  onNavigate?: (tab: TabType, props?: NavigationProps) => void;
}

const VisitsList: React.FC<VisitsListProps> = ({ onViewAll, onNavigate }) => {
  const { visits } = useData();

  // Robust comparison using String YYYY-MM-DD
  // Utilise le format local 'fr-CA' (AAAA-MM-JJ) pour obtenir la date d'aujourd'hui sans décalage UTC
  const todayISO = new Date().toLocaleDateString('fr-CA'); 

  const upcomingVisits = [...visits]
    .filter(v => v.date >= todayISO) // Comparaison lexicographique de chaînes (ISO) sûre
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // Helper to extract day number from ISO date safely without timezone shift
  const getDayNumber = (dateStr: string) => {
    if (!dateStr) return '--';
    const parts = dateStr.split('-');
    if (parts.length === 3) return parseInt(parts[2]);
    
    // Fallback
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '--' : d.getDate();
  };
  
  const handleVisitClick = (visit: Visit) => {
    if (onNavigate) {
      onNavigate('planning', { visitId: visit.id });
    } else if (onViewAll) {
      onViewAll();
    }
  };

  return (
    <section className="px-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">Prochaines visites</h3>
        <button
          onClick={onViewAll}
          className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 bg-primary/5 px-1.5 py-0.5 rounded-md"
        >
          Voir tout <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>
      </div>
      
      {upcomingVisits.length === 0 ? (
        <div className="bg-white dark:bg-card-dark rounded-2xl p-8 border border-gray-200 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
             <span className="material-symbols-outlined text-gray-300 dark:text-white/20 text-3xl">event_upcoming</span>
          </div>
          <p className="text-gray-900 dark:text-white font-bold text-sm">Rien de prévu</p>
          <p className="text-gray-500 dark:text-text-secondary text-xs mt-1">Aucune visite programmée prochainement.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {upcomingVisits.map((visit) => (
            <div
               key={visit.id}
               onClick={() => handleVisitClick(visit)}
               className="bg-white dark:bg-card-dark rounded-xl p-2 pr-3 border border-transparent dark:border-white/5 flex gap-3 items-center shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99] group"
            >
              <div className={`flex flex-col items-center justify-center rounded-xl w-16 h-16 shrink-0 transition-colors ${visit.status === 'Confirmed' ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'}`}>
                <span className="text-[10px] uppercase font-bold tracking-wider">{visit.month}</span>
                <span className="text-2xl font-black leading-none">{getDayNumber(visit.date)}</span>
              </div>
              
              <div className="flex-1 min-w-0 py-1">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="font-bold text-gray-900 dark:text-white truncate text-base leading-tight">{visit.speakerName}</h4>
                  {visit.status !== 'Confirmed' && (
                      <span className={`w-2 h-2 rounded-full mt-1.5 ${visit.status === 'Cancelled' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-text-secondary truncate mb-1">{visit.congregation}</p>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 px-1.5 py-0.5 rounded">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {visit.time}
                    </span>
                    {visit.meetingType && visit.meetingType !== 'Physique' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[12px]">{visit.meetingType === 'Zoom' ? 'videocam' : 'present_to_all'}</span>
                            {visit.meetingType}
                        </span>
                    )}
                </div>
              </div>
              
              <div className="text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default VisitsList;
