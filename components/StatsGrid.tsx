
import React from 'react';
import { StatItem, TabType, NavigationProps } from '../types';
import { useData } from '../DataContext';

interface StatsGridProps {
  onNavigate: (tab: TabType, props?: NavigationProps) => void;
}

const StatsGrid: React.FC<StatsGridProps> = ({ onNavigate }) => {
  const { visits, speakers, hosts } = useData();

  // 1. Orateurs actifs
  const activeSpeakersCount = speakers.filter(s => s.status === 'Actif').length;
  
  // 2. Contacts d'accueil (Hôtes)
  const availableHostsCount = hosts.filter(h => h.available).length;
  
  // 3. Visites ce mois
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const visitsThisMonth = visits.filter(v => {
    const d = new Date(v.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;
  
  // 4. En attente (statut 'Pending' ou 'New')
  const pendingVisits = visits.filter(v => v.status === 'Pending' || v.status === 'New').length;

  // Calcul du premier et dernier jour du mois pour le filtre
  const firstDay = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const lastDay = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

  const stats: (StatItem & { tab: TabType; props?: NavigationProps; bgGradient: string })[] = [
    { 
      id: '1', 
      label: 'Orateurs actifs', 
      value: activeSpeakersCount, 
      icon: 'record_voice_over', 
      trend: 'Total', 
      trendType: 'stable', 
      color: 'text-primary',
      tab: 'speakers',
      props: { filter: { status: 'Actif' } },
      bgGradient: 'from-primary/5 to-transparent'
    },
    { 
      id: '2', 
      label: "Hôtes dispos", 
      value: availableHostsCount, 
      icon: 'home_work', 
      trend: `${hosts.length} Total`, 
      trendType: 'stable', 
      color: 'text-blue-500',
      tab: 'hosts',
      props: { filter: { status: 'Available' } },
      bgGradient: 'from-blue-500/5 to-transparent'
    },
    { 
      id: '3', 
      label: 'Visites ce mois', 
      value: visitsThisMonth, 
      icon: 'calendar_month', 
      trend: 'En cours', 
      trendType: 'positive', 
      color: 'text-amber-500',
      tab: 'planning',
      props: { filter: { dateRange: { start: firstDay, end: lastDay } } },
      bgGradient: 'from-amber-500/5 to-transparent'
    },
    { 
      id: '4', 
      label: 'En attente', 
      value: pendingVisits, 
      icon: 'pending_actions', 
      trend: pendingVisits > 0 ? 'Action' : 'Ok', 
      trendType: pendingVisits > 0 ? 'urgent' : 'positive', 
      color: 'text-red-500',
      tab: 'planning',
      props: { filter: { status: 'Pending' } },
      bgGradient: 'from-red-500/5 to-transparent'
    },
  ];

  return (
    <section className="px-0">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.id} 
            className={`relative bg-white dark:bg-card-dark p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg flex flex-col justify-between overflow-hidden cursor-pointer hover:border-primary/30 dark:hover:border-white/20 transition-all active:scale-[0.98] group min-h-[140px]`}
            onClick={() => onNavigate(stat.tab, stat.props)}
          >
            {/* Background Gradient Decoration */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}></div>
            
            {/* Icon Background Decoration - Large */}
            <div className={`absolute -right-4 -top-4 opacity-[0.04] dark:opacity-[0.06] group-hover:scale-110 transition-transform duration-700`}>
                 <span className="material-symbols-outlined text-8xl">{stat.icon}</span>
            </div>

            <div className="flex justify-between items-start relative z-10">
              <div className={`p-2 rounded-xl bg-white dark:bg-white/5 shadow-md border border-gray-100 dark:border-white/5 ${stat.color}`}>
                <span className="material-symbols-outlined text-xl block">{stat.icon}</span>
              </div>
              
              {stat.trendType === 'urgent' && (
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
              )}
            </div>
            
            <div className="relative z-10 mt-4">
              <p className="text-5xl font-black text-gray-900 dark:text-white leading-none tracking-tighter">{stat.value}</p>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-2">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsGrid;
