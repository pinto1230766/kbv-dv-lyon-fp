
import React from 'react';
import StatsGrid from './StatsGrid';
import EvolutionChart from './EvolutionChart';
import VisitsList from './VisitsList';
import DistributionChart from './DistributionChart';
import QuickAccess from './QuickAccess';
import ActionsList from './ActionsList';
import { TabType, NavigationProps } from '../types';
import { useData } from '../DataContext';

interface DashboardProps {
  onNavigate: (tab: TabType, props?: NavigationProps) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { hosts, visits } = useData();
  
  // Analyse des hôtes
  const availableCount = (hosts || []).filter(h => h.available).length;
  const todayISO = new Date().toISOString().split('T')[0];
  
  // Calcul de l'occupation réelle
  const occupiedIds = new Set(
    (visits || [])
      .filter(v => v.date >= todayISO && v.status === 'Confirmed' && v.hostId)
      .map(v => v.hostId)
  );
  
  const occupiedCount = Array.from(occupiedIds).length;
  const occupancyRate = (hosts || []).length > 0 
    ? Math.round((occupiedCount / hosts.length) * 100) 
    : 0;

  return (
    <div className="flex flex-col gap-4 pt-4 pb-24 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* SECTION HÉBERGEMENT - Plus généreuse pour tablette S10 Ultra */}
      <section className="px-4">
        <div className="bg-white dark:bg-card-dark rounded-2xl p-4 border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 rotate-2 group-hover:rotate-0 transition-transform">
                <span className="material-symbols-outlined text-3xl">home</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Hébergement</h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{availableCount} hôtes disponibles</p>
              </div>
            </div>

            <div className="flex-1 max-w-md flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-100 dark:border-white/5">
                <div className="text-right shrink-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Occupation</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white mt-1 leading-none">{occupancyRate}%</p>
                </div>
                <div className="flex-1 h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-primary shadow-[0_0_15px_rgba(230,76,25,0.4)] transition-all duration-1000 ease-out"
                      style={{ width: `${occupancyRate}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {(hosts || []).slice(0, 6).map((host) => (
                <div
                  key={host.id}
                  onClick={() => onNavigate('hosts', { hostId: host.id })}
                  className={`size-12 rounded-full bg-linear-to-br ${host.gradient || 'from-gray-400 to-gray-600'} text-white flex items-center justify-center font-black text-lg border-2 border-white dark:border-card-dark shrink-0 cursor-pointer hover:scale-110 transition-transform relative group/avatar shadow-md`}
                >
                  {host.initials || host.name.charAt(0)}
                  <span className={`absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white dark:border-card-dark ${host.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </div>
              ))}
              <button
                onClick={() => onNavigate('hosts')}
                className="size-12 rounded-full border-2 border-dashed border-gray-300 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-xl">add</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grille Principale 3 Colonnes - Format Premium S10 Ultra */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4">
        
        {/* COLONNE 1 : Stats & Accès Rapide */}
        <div className="flex flex-col gap-6">
          <StatsGrid onNavigate={onNavigate} />
          <QuickAccess onAction={onNavigate} />
        </div>

        {/* COLONNE 2 : Graphiques */}
        <div className="flex flex-col gap-6">
          <EvolutionChart />
          <DistributionChart />
        </div>

        {/* COLONNE 3 : Listes (Visites & Actions) */}
        <div className="flex flex-col gap-6">
          <VisitsList onNavigate={onNavigate} onViewAll={() => onNavigate('planning')} />
          <ActionsList onNavigate={onNavigate} />
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
