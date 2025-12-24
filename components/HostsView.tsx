import React, { useState, useMemo, useEffect } from 'react';
import HostProfile from './HostProfile';
import AddHostView from './AddHostView';
import { useData } from '../DataContext';
import { Host, TabType, NavigationProps } from '../types';
import { normalizeString } from '../utils/sheetSync';

interface HostsViewProps {
  onNavigate: (tab: TabType, props?: any) => void;
  initialProps?: NavigationProps | null;
  onActionHandled?: () => void;
}

const HostsView: React.FC<HostsViewProps> = ({ onNavigate, initialProps, onActionHandled }) => {
  const { hosts, addHost, updateHost, showToast, resetToDefaultHosts } = useData();
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  const [isAddingHost, setIsAddingHost] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filteredHosts = useMemo(() => {
    const normalizedSearch = normalizeString(searchTerm);
    return (hosts || []).filter(host => {
        const matchesSearch = normalizedSearch === '' || 
            normalizeString(host.name).includes(normalizedSearch) ||
            normalizeString(host.location).includes(normalizedSearch);
        const matchesAvailability = onlyAvailable ? host.available : true;
        return matchesSearch && matchesAvailability;
    });
  }, [hosts, searchTerm, onlyAvailable]);

  useEffect(() => {
    if (initialProps?.hostId) {
        const host = hosts.find(h => h.id === initialProps.hostId);
        if (host) setSelectedHost(host);
        onActionHandled?.();
    }
  }, [initialProps, hosts, onActionHandled]);

  const handleSaveHost = (hostData: Partial<Host>) => {
    if (editingHost) {
      updateHost(editingHost.id, hostData);
      setEditingHost(null);
    } else {
      addHost(hostData);
      setIsAddingHost(false);
    }
  };

  const openInMaps = (address: string) => {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
      showToast("Localisation de l'hôte...", "info");
  };

  if (selectedHost) return <HostProfile host={selectedHost} onBack={() => setSelectedHost(null)} onNavigate={onNavigate} onEditRequest={setEditingHost} />;
  if (isAddingHost || editingHost) return <AddHostView onClose={() => {setIsAddingHost(false); setEditingHost(null)}} onSave={handleSaveHost} hostToEdit={editingHost || undefined} />;

  return (
    <div className="flex flex-col min-h-full bg-background-light dark:bg-background-dark animate-in fade-in duration-300">
      <header className="flex-none pt-6 px-4 bg-background-light dark:bg-background-dark sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Hôtes</h2>
          <button onClick={() => setIsAddingHost(true)} className="w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center transition-all active:scale-95"><span className="material-symbols-outlined text-3xl">add</span></button>
        </div>
        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
             <div className="relative flex-1 flex items-center h-12 rounded-xl bg-gray-100 dark:bg-surface-highlight overflow-hidden shadow-sm border border-transparent focus-within:border-primary/50 transition-all">
                <span className="material-symbols-outlined absolute left-3 text-gray-500">search</span>
                <input className="w-full h-full pl-10 pr-2 outline-none text-sm bg-transparent placeholder-gray-400" placeholder="Rechercher hôte ou quartier..." type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="bg-gray-100 dark:bg-surface-highlight p-1 rounded-xl flex shadow-inner">
                <button onClick={() => setViewMode('list')} className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-surface-dark shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}><span className="material-symbols-outlined">list</span></button>
                <button onClick={() => setViewMode('map')} className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all ${viewMode === 'map' ? 'bg-white dark:bg-surface-dark shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}><span className="material-symbols-outlined">map</span></button>
            </div>
          </div>
          <button onClick={() => setOnlyAvailable(!onlyAvailable)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${onlyAvailable ? 'bg-green-100 text-green-700 border-green-200' : 'text-gray-500 border-gray-200 dark:border-white/10'}`}>
            <span className={`w-2 h-2 rounded-full ${onlyAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></span>Disponibles uniquement
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-24">
        {hosts.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-center px-6">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl text-gray-300">home_off</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Liste vide</h3>
                <p className="text-sm text-gray-500 mb-6">La liste des hôtes semble avoir été effacée. Vous pouvez restaurer la liste par défaut.</p>
                <button 
                  onClick={resetToDefaultHosts}
                  className="bg-primary text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">restore</span>
                    Restaurer les hôtes par défaut
                </button>
            </div>
        ) : (
            viewMode === 'map' ? (
                <div className="space-y-4 animate-in zoom-in-95 duration-500">
                    <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 border border-gray-200 dark:border-white/5 shadow-sm text-center">
                        <span className="material-symbols-outlined text-5xl text-primary mb-4">location_on</span>
                        <h3 className="text-xl font-bold dark:text-white mb-2">Carte des Hébergements</h3>
                        <p className="text-sm text-gray-500 dark:text-text-secondary mb-6">Localisez tous vos hôtes d'accueil sur la carte.</p>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {filteredHosts.map(h => (
                                <div key={h.id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-3 text-left overflow-hidden">
                                        <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">{h.initials || h.name.charAt(0)}</div>
                                        <div className="truncate">
                                            <p className="font-bold text-sm dark:text-white truncate">{h.name}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{h.location}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => openInMaps(h.location)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/10 text-blue-500 shadow-sm"><span className="material-symbols-outlined">directions</span></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                filteredHosts.length === 0 ? <p className="py-20 text-center opacity-50">Aucun hôte trouvé.</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredHosts.map(h => (
                            <div key={h.id} className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-transparent hover:border-primary/50 transition-all cursor-pointer flex items-center gap-4 active:scale-95 group relative">
                                <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg group-hover:bg-primary group-hover:text-white transition-colors">{h.initials || h.name.charAt(0)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-white truncate">{h.name}</p>
                                    <p className="text-xs text-gray-500 truncate font-medium">{h.location}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${h.available ? 'bg-green-500' : 'bg-red-500 shadow-sm shadow-red-500/50'}`}></span>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setEditingHost(h); }}
                                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all"
                                      title="Modifier"
                                    >
                                      <span className="material-symbols-outlined text-lg text-gray-500">edit</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )
        )}
      </main>
    </div>
  );
};

export default HostsView;
