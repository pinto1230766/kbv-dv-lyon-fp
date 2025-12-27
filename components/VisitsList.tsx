
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
    <section className="px-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Prochaines visites</h3>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-sm"
        >
          Voir tout <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
      
      {upcomingVisits.length === 0 ? (
        <div className="bg-white dark:bg-card-dark rounded-2xl p-8 border border-gray-200 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-lg h-40">
           <div className="size-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
             <span className="material-symbols-outlined text-gray-300 text-2xl">event_upcoming</span>
           </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Aucune visite programmée.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {upcomingVisits.map((visit) => (
            <div
               key={visit.id}
               onClick={() => handleVisitClick(visit)}
               className="bg-white dark:bg-card-dark rounded-2xl p-3 pr-4 border border-transparent dark:border-white/5 flex gap-4 items-center shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.99] group h-20"
            >
              <div className={`flex flex-col items-center justify-center rounded-xl w-14 h-14 shrink-0 transition-colors shadow-inner ${visit.status === 'Confirmed' ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'}`}>
                <span className="text-[10px] uppercase font-black tracking-widest">{visit.month}</span>
                <span className="text-2xl font-black leading-none mt-0.5">{getDayNumber(visit.date)}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-gray-900 dark:text-white truncate text-base leading-tight">{visit.speakerName}</h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">{visit.congregation}</p>
                <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                        {visit.time}
                    </span>
                    {visit.meetingType && visit.meetingType !== 'Physique' && (
                        <span className="text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                            {visit.meetingType}
                        </span>
                    )}
                </div>
              </div>
              
              <div className="text-gray-200 dark:text-gray-700 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default VisitsList;
