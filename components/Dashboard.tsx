
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

      {/* SECTION HÉBERGEMENT - Compact pour tablette */}
      <section className="px-3">
        <div className="bg-white dark:bg-card-dark rounded-[20px] p-3 border border-gray-200 dark:border-white/5 shadow-lg shadow-primary/5 relative overflow-hidden group">
          {/* Décoration d'arrière-plan */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-700"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <span className="material-symbols-outlined text-2xl">home</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Hébergement</h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{availableCount} hôtes prêts à accueillir</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-100 dark:border-white/5">
                <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Occupation</p>
                    <p className="text-lg font-black text-gray-900 dark:text-white leading-none mt-1">{occupancyRate}%</p>
                </div>
                <div className="w-20 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-primary shadow-[0_0_10px_rgba(230,76,25,0.5)] transition-all duration-1000 ease-out"
                      style={{ width: `${occupancyRate}%` }}
                    ></div>
                </div>
                <button
                  onClick={() => onNavigate('hosts')}
                  className="size-10 rounded-xl bg-white dark:bg-white/5 shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
            </div>
          </div>

          <div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar py-2">
            {(hosts || []).slice(0, 6).map((host) => (
              <div
                key={host.id}
                onClick={() => onNavigate('hosts', { hostId: host.id })}
                className="flex flex-col items-center gap-2 min-w-[70px] group/item cursor-pointer"
              >
                <div className={`size-12 rounded-full bg-gradient-to-br ${host.gradient || 'from-gray-400 to-gray-600'} text-white flex items-center justify-center font-black text-lg shadow-md border-2 border-white dark:border-card-dark relative group-hover/item:scale-110 transition-transform`}>
                  {host.initials || host.name.charAt(0)}
                  <span className={`absolute bottom-0 right-0 size-3 rounded-full border-1.5 border-white dark:border-card-dark ${host.available ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                </div>
                <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 text-center uppercase tracking-tight truncate w-full">{host.name.split(' ')[0]}</p>
              </div>
            ))}
            <button
              onClick={() => onNavigate('hosts')}
              className="flex flex-col items-center justify-center gap-1 min-w-[70px] size-12 rounded-full border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-primary/50 text-gray-400 hover:text-primary transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
          </div>
        </div>
      </section>

      <StatsGrid onNavigate={onNavigate} />

      {/* Layout adapté pour tablette Samsung S10 Ultra - tout sur une page */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3">
        {/* Graphiques en haut - taille réduite pour tablette */}
        <div className="xl:col-span-2 md:col-span-1 order-1">
          <EvolutionChart />
        </div>
        <div className="xl:col-span-1 md:col-span-1 order-2">
          <DistributionChart />
        </div>

        {/* Contenu principal en bas */}
        <div className="xl:col-span-2 md:col-span-2 order-3">
          <VisitsList onNavigate={onNavigate} onViewAll={() => onNavigate('planning')} />
        </div>
        <div className="xl:col-span-1 md:col-span-2 order-4 flex flex-col gap-4 md:gap-6">
          <QuickAccess onAction={onNavigate} />
          <ActionsList onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
