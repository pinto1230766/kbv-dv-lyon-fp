
import React, { useMemo } from 'react';
import { Host, TabType, NavigationProps } from '../types';
import { useData } from '../DataContext';

interface HostProfileProps {
  host: Host;
  onBack: () => void;
  onNavigate: (tab: TabType, props?: NavigationProps) => void;
  onEditRequest: (host: Host) => void;
}

const HostProfile: React.FC<HostProfileProps> = ({ host, onBack, onNavigate, onEditRequest }) => {
  const { deleteHost, visits } = useData();

  // Get visits assigned to this host
  const hostVisits = useMemo(() => 
    visits.filter(v => v.hostId === host.id)
          .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  , [visits, host.id]);

  const handleDelete = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'hôte ${host.name} ?\nCette action est irréversible.`)) {
        deleteHost(host.id);
        onBack();
    }
  };

  const handleGenerateMessage = () => {
      onNavigate('messages', { hostId: host.id });
  };

  const nextAssignment = useMemo(() => {
      const now = new Date();
      // Find the first future visit
      const future = hostVisits
        .filter(v => new Date(v.date) >= now)
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return future.length > 0 ? future[0] : null;
  }, [hostVisits]);

  return (
    <div className="relative flex min-h-full w-full flex-col bg-background-light dark:bg-background-dark animate-in slide-in-from-right duration-300 z-30 pb-24 md:pb-6">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center p-4 pb-2 justify-between w-full">
          <button 
            onClick={onBack}
            className="text-gray-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors -ml-2"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Profil de l'Hôte</h2>
          <div className="flex gap-2">
             <button 
                onClick={handleDelete}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"
                title="Supprimer"
             >
                <span className="material-symbols-outlined text-[20px]">delete</span>
             </button>
             <button 
                onClick={() => onEditRequest(host)}
                className="flex items-center justify-end px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
             >
                <p className="text-primary text-base font-bold leading-normal tracking-[0.015em] shrink-0">Modifier</p>
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full overflow-x-hidden pt-4 px-4">
        
        {/* Responsive Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Info & Contact */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Header */}
            <section className="flex p-4 flex-col items-center gap-4 relative bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
              <div className="relative group">
                <div 
                  className="bg-center bg-no-repeat bg-cover rounded-full h-32 w-32 border-4 border-white dark:border-primary/20 shadow-xl" 
                  style={{ backgroundImage: `url("${host.avatar || 'https://picsum.photos/seed/host/200'}")` }}
                ></div>
                <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-4 border-background-light dark:border-background-dark flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <h1 className="text-[26px] font-bold leading-tight tracking-[-0.015em] text-center mb-1 text-gray-900 dark:text-white">{host.name}</h1>
                <p className="text-gray-500 dark:text-[#c8a093] text-base font-normal leading-normal text-center mb-2">Hôte Régulier • {host.location}</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  host.available 
                  ? 'bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 opacity-80'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${host.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {host.available ? 'Actif' : 'Occupé'}
                </span>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-4 w-full pt-2">
                <QuickActionButton icon="call" label="Appeler" onClick={() => window.location.href = `tel:${host.phone || ''}`} />
                <QuickActionButton icon="chat_bubble" label="SMS" onClick={() => window.location.href = `sms:${host.phone || ''}`} />
                <QuickActionButton icon="mail" label="Message" onClick={handleGenerateMessage} />
                <QuickActionButton icon="map" label="Carte" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(host.location)}`, '_blank')} />
              </div>
            </section>

            {/* Contact Info */}
            <section className="space-y-4">
              <div className="flex justify-between items-center px-2 pb-0">
                <h3 className="text-lg font-bold leading-tight text-gray-900 dark:text-white">Coordonnées</h3>
                <span className="material-symbols-outlined text-gray-400 dark:text-[#c8a093]">lock</span>
              </div>
              <div className="flex flex-col gap-4">
                <ContactCard icon="smartphone" label="Mobile" value={host.phone || 'Non renseigné'} hasCopy />
                <ContactCard icon="mail" label="Email" value={host.email || 'Non renseigné'} />
              </div>
            </section>
          </div>

          {/* Right Column: Preferences, History & Availability */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Preferences & Capabilities */}
            <section className="bg-white dark:bg-surface-dark/50 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
              <div className="flex justify-between items-center pb-4">
                <h3 className="text-lg font-bold leading-tight text-gray-900 dark:text-white">Préférences & Capacité</h3>
                <button 
                  onClick={() => onEditRequest(host)}
                  className="text-primary text-sm font-medium"
                >
                  Modifier
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <PreferenceCard icon="bed" label="Hébergement" value={`${host.capacity} Personne(s)`} sub="Capacité d'accueil" />
                <PreferenceCard icon="restaurant" label="Repas" value="Préférences" sub="À définir avec l'hôte" />
              </div>
            </section>

            {/* Availability */}
            <section>
              <h3 className="text-lg font-bold leading-tight pb-4 text-gray-900 dark:text-white px-2">Disponibilité</h3>
              <div className="bg-white dark:bg-[#2d1e1a] rounded-xl p-6 border border-gray-200 dark:border-[#3a251e] flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full text-primary">
                    <span className="material-symbols-outlined text-2xl">calendar_month</span>
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium text-lg">Prochaine occupation</p>
                    <p className="text-gray-500 dark:text-[#c8a093] text-sm">
                        {nextAssignment ? `${new Date(nextAssignment.date).getDate()} ${nextAssignment.month} (${nextAssignment.speakerName})` : 'Disponible'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('planning', { action: 'add', host })}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-primary/20 transition-colors"
                >
                  Planifier
                </button>
              </div>
            </section>

            {/* History Timeline */}
            <section className="pb-8">
              <div className="flex justify-between items-center pb-4 px-2">
                <h3 className="text-lg font-bold leading-tight text-gray-900 dark:text-white">Historique récent</h3>
                <button 
                  onClick={() => onNavigate('planning', { filter: { hostId: host.id } })}
                  className="text-primary text-sm font-medium"
                >
                  Tout voir
                </button>
              </div>
              <div className="relative pl-2">
                {hostVisits.length > 0 ? (
                    <>
                        <div className="absolute left-[28px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-[#3a251e]"></div>
                        <div className="flex flex-col gap-6">
                        {hostVisits.slice(0, 3).map(visit => (
                            <HistoryItem 
                                key={visit.id}
                                date={`${new Date(visit.date).getDate()} ${visit.month}`} 
                                title={visit.speakerName} 
                                sub={visit.congregation} 
                                active={visit.status === 'Confirmed' && new Date(visit.date) >= new Date()} 
                            />
                        ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-text-secondary text-sm">
                        Aucun historique d'hébergement.
                    </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

const QuickActionButton: React.FC<{ icon: string; label: string; onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 group active:scale-95 transition-transform w-full">
    <div className="w-full aspect-square rounded-2xl bg-white dark:bg-[#472d24] group-hover:bg-primary transition-colors shadow-md dark:shadow-lg flex items-center justify-center border border-gray-100 dark:border-transparent">
      <span className="material-symbols-outlined text-gray-700 dark:text-white group-hover:text-white text-xl">{icon}</span>
    </div>
    <span className="text-xs font-medium text-gray-600 dark:text-[#c8a093] group-hover:text-primary transition-colors">{label}</span>
  </button>
);

const ContactCard: React.FC<{ icon: string; label: string; value: string; hasCopy?: boolean }> = ({ icon, label, value, hasCopy }) => (
  <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-[#3a251e] shadow-sm">
    <div className="bg-gray-100 dark:bg-[#472d24] p-2 rounded-lg text-gray-700 dark:text-white">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div className="flex-1">
      <p className="text-gray-500 dark:text-[#c8a093] text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="text-gray-900 dark:text-white text-base truncate">{value}</p>
    </div>
    {hasCopy && (
      <button onClick={() => navigator.clipboard.writeText(value)} className="text-gray-400 dark:text-[#c8a093] hover:text-gray-900 dark:hover:text-white transition-colors">
        <span className="material-symbols-outlined">content_copy</span>
      </button>
    )}
  </div>
);

const PreferenceCard: React.FC<{ icon: string; label: string; value: string; sub: string }> = ({ icon, label, value, sub }) => (
  <div className="bg-white dark:bg-[#2d1e1a] p-4 rounded-xl border border-gray-200 dark:border-[#3a251e] flex flex-col gap-2 shadow-sm">
    <div className="flex items-center gap-2 text-gray-500 dark:text-[#c8a093]">
      <span className="material-symbols-outlined">{icon}</span>
      <span className="text-xs font-bold uppercase">{label}</span>
    </div>
    <p className="text-gray-900 dark:text-white font-semibold text-lg">{value}</p>
    <p className="text-gray-500 dark:text-white/60 text-xs">{sub}</p>
  </div>
);

const HistoryItem: React.FC<{ date: string; title: string; sub: string; active?: boolean }> = ({ date, title, sub, active }) => (
  <div className="flex gap-4 relative">
    <div className="z-10 bg-background-light dark:bg-background-dark p-1 ml-2">
      <div className={`w-3 h-3 rounded-full ring-4 ring-background-light dark:ring-background-dark ${active ? 'bg-primary' : 'bg-gray-300 dark:bg-[#472d24]'}`}></div>
    </div>
    <div className={`flex-1 rounded-lg p-4 -mt-2 transition-colors border shadow-sm ${active ? 'bg-primary/5 dark:bg-primary/10 border-primary/20' : 'bg-white dark:bg-[#2d1e1a]/50 border-gray-200 dark:border-transparent hover:border-gray-300 dark:hover:border-[#3a251e]'}`}>
      <div className="flex justify-between items-start">
        <p className="text-gray-900 dark:text-white font-medium text-base">{title}</p>
        <span className="text-xs text-gray-500 dark:text-[#c8a093]">{date}</span>
      </div>
      <p className="text-gray-500 dark:text-white/60 text-sm mt-1">{sub}</p>
    </div>
  </div>
);

export default HostProfile;
