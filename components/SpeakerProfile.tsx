
import React, { useState, useMemo } from 'react';
import { useData } from '../DataContext';
import { Speaker, Visit, TabType, NavigationProps } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell } from 'recharts';

interface SpeakerProfileProps {
  speaker: Speaker;
  onBack: () => void;
  onEditRequest: (speaker: Speaker) => void;
  onNavigate: (tab: TabType, props?: NavigationProps) => void;
}

const SpeakerProfile: React.FC<SpeakerProfileProps> = ({ speaker, onBack, onEditRequest, onNavigate }) => {
  const { visits, deleteSpeaker } = useData();
  const [activeTab, setActiveTab] = useState<'infos' | 'historique' | 'planning'>('infos');

  const speakerVisits = useMemo(() => {
    return visits.filter(v => 
        (v.speakerId && v.speakerId === speaker.id) || 
        (normalizeName(v.speakerName) === normalizeName(speaker.name))
    );
  }, [visits, speaker]);

  function normalizeName(name: string) {
    return name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  const todayISO = new Date().toLocaleDateString('fr-CA'); 

  const pastVisits = useMemo(() => speakerVisits
    .filter(v => v.date < todayISO && v.status !== 'Cancelled')
    .sort((a, b) => b.date.localeCompare(a.date))
  , [speakerVisits, todayISO]);

  const futureVisits = useMemo(() => speakerVisits
    .filter(v => v.date >= todayISO && v.status !== 'Cancelled')
    .sort((a, b) => a.date.localeCompare(b.date))
  , [speakerVisits, todayISO]);

  const visitsByYear = useMemo(() => {
    const stats: Record<string, number> = {};
    speakerVisits.forEach(v => {
        const y = v.year || v.date.substring(0, 4);
        stats[y] = (stats[y] || 0) + 1;
    });
    return Object.entries(stats)
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [speakerVisits]);

  const handleEdit = () => {
    onEditRequest(speaker);
  };

  const handleAssign = () => {
    onNavigate('planning', { action: 'add', speaker: speaker });
  };
  
  const handleVisitClick = (visitId: string) => {
    onNavigate('planning', { visitId });
  };

  const handleMessage = () => {
      onNavigate('messages', { speakerId: speaker.id });
  };

  const handleDelete = () => {
    if (confirm(`Supprimer ${speaker.name} ? Cette action est irréversible.`)) {
        deleteSpeaker(speaker.id);
        onBack(); 
    }
  };

  const availabilityInfo = useMemo(() => {
      if (speaker.status !== 'Actif') return { status: speaker.status, type: 'busy', date: 'Indisponible' };
      if (futureVisits.length > 0) {
          const next = futureVisits[0];
          return { status: 'Programmé', type: 'busy', date: `${next.date.split('-')[2]} ${next.month}`, sub: next.congregation };
      }
      return { status: 'Disponible', type: 'available', date: 'Maintenant' };
  }, [speaker, futureVisits]);

  return (
    <div className="relative flex min-h-full w-full flex-col bg-background-light dark:bg-background-dark animate-in slide-in-from-right duration-300 z-30 pb-32 md:pb-6">
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between px-4 h-14 w-full">
          <button onClick={onBack} className="flex items-center justify-center size-10 -ml-2 text-primary hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          </button>
          <h1 className="text-base font-semibold text-center truncate text-gray-900 dark:text-white">Profil de l'Orateur</h1>
          <div className="flex gap-2">
             <button onClick={handleDelete} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"><span className="material-symbols-outlined text-[20px]">delete</span></button>
             <button onClick={handleEdit} className="text-primary font-semibold text-sm px-2 py-1 rounded hover:bg-primary/10 transition-colors">Modifier</button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full overflow-x-hidden pt-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <section className="flex flex-col items-center gap-4 bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
              <div className="size-28 rounded-full bg-primary/5 border-4 border-white dark:border-surface-highlight overflow-hidden shadow-xl">
                {speaker.avatar ? (
                <img alt={speaker.name} className="w-full h-full object-cover" src={speaker.avatar} />
                ) : (
                <div className="w-full h-full flex items-center justify-center text-primary text-4xl font-bold">
                    {speaker.initials || speaker.name.charAt(0)}
                </div>
                )}
              </div>
              <div className="text-center space-y-1 w-full">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{speaker.name}</h2>
                <p className="text-sm font-bold text-primary">{speaker.congregation}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${speaker.status === 'Actif' ? 'bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-500 border-green-200 dark:border-green-500/20' : 'bg-gray-100 dark:bg-gray-500/15 text-gray-600 dark:text-gray-500'}`}>
                    {speaker.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 w-full mt-2">
                <QuickActionButton icon="call" label="Tel" onClick={() => speaker.phone && (window.location.href=`tel:${speaker.phone}`)} disabled={!speaker.phone} />
                <QuickActionButton icon="mail" label="Mail" onClick={() => speaker.email && (window.location.href=`mailto:${speaker.email}`)} disabled={!speaker.email} />
                <QuickActionButton icon="chat" label="Msg" onClick={handleMessage} />
                <QuickActionButton icon="map" label="Carte" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(speaker.congregation)}`, '_blank')} />
              </div>
            </section>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-200 dark:bg-black/20 p-1 rounded-xl flex text-sm font-medium">
              <button onClick={() => setActiveTab('infos')} className={`flex-1 py-1.5 rounded-lg transition-all text-center ${activeTab === 'infos' ? 'bg-white dark:bg-surface-highlight text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-text-secondary'}`}>Aperçu</button>
              <button onClick={() => setActiveTab('historique')} className={`flex-1 py-1.5 rounded-lg transition-all text-center ${activeTab === 'historique' ? 'bg-white dark:bg-surface-highlight text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>Historique ({pastVisits.length})</button>
              <button onClick={() => setActiveTab('planning')} className={`flex-1 py-1.5 rounded-lg transition-all text-center ${activeTab === 'planning' ? 'bg-white dark:bg-surface-highlight text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>Planning ({futureVisits.length})</button>
            </div>

            <div className="min-h-[400px]">
              {activeTab === 'infos' && (
                <div className="space-y-6">
                  <section className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Derniers Discours</h3>
                    {pastVisits.length > 0 ? (
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-200 dark:border-white/5">
                        {pastVisits.slice(0, 3).map((visit) => (
                          <div className="flex gap-4 py-3 border-b border-gray-100 dark:border-white/5 last:border-0 cursor-pointer" key={visit.id} onClick={() => handleVisitClick(visit.id)}>
                             <div className="flex flex-col items-center justify-center min-w-[50px] bg-gray-50 dark:bg-white/5 rounded-lg">
                                <span className="text-sm font-bold">{visit.date.split('-')[2]}</span>
                                <span className="text-[10px] uppercase text-text-secondary">{visit.month}</span>
                             </div>
                             <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold truncate">{visit.discoursTitle || `Discours #${visit.discoursNumber}`}</h4>
                                <p className="text-xs text-text-secondary">{visit.congregation}</p>
                             </div>
                          </div>
                        ))}
                    </div>
                    ) : (
                      <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 border border-gray-200 dark:border-white/5 text-center text-gray-500">Aucun historique disponible.</div>
                    )}
                  </section>

                  {visitsByYear.length > 0 && (
                      <section className="space-y-3">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white px-1">Fréquence annuelle</h3>
                          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-200 dark:border-white/5 shadow-sm h-[200px]">
                              <ResponsiveContainer width="100%" height={160}>
                                  <BarChart data={visitsByYear}>
                                      <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} dy={10} />
                                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} allowDecimals={false} />
                                      <Tooltip cursor={{fill: 'transparent'}} />
                                      <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32} fill="#e64c19" />
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </section>
                  )}
                </div>
              )}

              {activeTab === 'historique' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pastVisits.map(v => (
                        <div key={v.id} onClick={() => handleVisitClick(v.id)} className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-white/5 cursor-pointer">
                            <span className="text-[10px] font-bold text-gray-400">{v.date}</span>
                            <h4 className="font-bold text-sm truncate">{v.discoursTitle || `Discours #${v.discoursNumber}`}</h4>
                            <p className="text-xs text-text-secondary">{v.congregation}</p>
                        </div>
                    ))}
                </div>
              )}

              {activeTab === 'planning' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {futureVisits.map(v => (
                        <div key={v.id} onClick={() => handleVisitClick(v.id)} className="bg-primary/5 border border-primary/20 p-4 rounded-xl cursor-pointer">
                            <span className="text-[10px] font-bold text-primary">{v.date}</span>
                            <h4 className="font-bold text-sm truncate">{v.discoursTitle || `Discours #${v.discoursNumber}`}</h4>
                            <p className="text-xs text-text-secondary">{v.congregation}</p>
                        </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const QuickActionButton: React.FC<{ icon: string; label: string; onClick: () => void; disabled?: boolean }> = ({ icon, label, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className="flex flex-col items-center gap-1 group disabled:opacity-30">
        <div className="size-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/5 shadow-sm group-active:scale-95 transition-all">
            <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
        </div>
        <span className="text-[10px] font-medium text-gray-500">{label}</span>
    </button>
);

export default SpeakerProfile;
