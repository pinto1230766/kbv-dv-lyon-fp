import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../DataContext';
import { Visit, Speaker, Host, TabType, NavigationProps } from '../types';
import { normalizeString } from '../utils/sheetSync';

interface GlobalSearchProps {
  onClose: () => void;
  onNavigate: (tab: TabType, props?: NavigationProps) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onClose, onNavigate }) => {
  const { visits, speakers, hosts } = useData();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useMemo(() => {
    if (!query.trim()) return { visits: [], speakers: [], hosts: [], total: 0 };

    const normalizedQuery = normalizeString(query);

    const matchedVisits = visits.filter(v =>
      normalizeString(v.speakerName).includes(normalizedQuery) ||
      normalizeString(v.congregation).includes(normalizedQuery) ||
      normalizeString(v.discoursTitle || '').includes(normalizedQuery)
    ).slice(0, 5);

    const matchedSpeakers = speakers.filter(s =>
      normalizeString(s.name).includes(normalizedQuery) ||
      normalizeString(s.congregation).includes(normalizedQuery)
    ).slice(0, 5);

    const matchedHosts = hosts.filter(h =>
      normalizeString(h.name).includes(normalizedQuery) ||
      normalizeString(h.location).includes(normalizedQuery)
    ).slice(0, 5);

    return {
      visits: matchedVisits,
      speakers: matchedSpeakers,
      hosts: matchedHosts,
      total: matchedVisits.length + matchedSpeakers.length + matchedHosts.length
    };
  }, [query, visits, speakers, hosts]);

  const allResults = [
    ...results.visits.map(v => ({ type: 'visit' as const, data: v })),
    ...results.speakers.map(s => ({ type: 'speaker' as const, data: s })),
    ...results.hosts.map(h => ({ type: 'host' as const, data: h }))
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && allResults[selectedIndex]) {
        handleSelect(allResults[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, allResults]);

  const handleSelect = (result: typeof allResults[0]) => {
    if (result.type === 'visit') {
      onNavigate('planning', { visitId: result.data.id });
    } else if (result.type === 'speaker') {
      onNavigate('speakers', { speakerId: result.data.id });
    } else if (result.type === 'host') {
      onNavigate('hosts', { hostId: result.data.id });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Barre de recherche */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-white/10">
          <span className="material-symbols-outlined text-gray-400">search</span>
          <input
            type="text"
            placeholder="Rechercher des visites, orateurs, hôtes..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-lg font-medium dark:text-white"
            autoFocus
          />
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded text-xs font-mono">
            ESC
          </kbd>
        </div>

        {/* Résultats */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-5xl mb-2 opacity-30">search</span>
              <p className="text-sm">Tapez pour rechercher...</p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <span className="text-xs bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">Visites</span>
                <span className="text-xs bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">Orateurs</span>
                <span className="text-xs bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">Hôtes</span>
              </div>
            </div>
          ) : results.total === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-5xl mb-2 opacity-30">search_off</span>
              <p className="text-sm">Aucun résultat pour "{query}"</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {/* Visites */}
              {results.visits.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">
                    Visites ({results.visits.length})
                  </p>
                  {results.visits.map((visit, index) => {
                    const globalIndex = allResults.findIndex(r => r.type === 'visit' && r.data.id === visit.id);
                    return (
                      <button
                        key={visit.id}
                        onClick={() => handleSelect({ type: 'visit', data: visit })}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          selectedIndex === globalIndex
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-xl">event</span>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">
                            {visit.speakerName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {visit.date} • {visit.congregation}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[9px] font-bold ${
                          visit.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {visit.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Orateurs */}
              {results.speakers.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">
                    Orateurs ({results.speakers.length})
                  </p>
                  {results.speakers.map((speaker, index) => {
                    const globalIndex = allResults.findIndex(r => r.type === 'speaker' && r.data.id === speaker.id);
                    return (
                      <button
                        key={speaker.id}
                        onClick={() => handleSelect({ type: 'speaker', data: speaker })}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          selectedIndex === globalIndex
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-bold">
                          {speaker.initials || speaker.name.charAt(0)}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">
                            {speaker.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {speaker.congregation}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Hôtes */}
              {results.hosts.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">
                    Hôtes ({results.hosts.length})
                  </p>
                  {results.hosts.map((host, index) => {
                    const globalIndex = allResults.findIndex(r => r.type === 'host' && r.data.id === host.id);
                    return (
                      <button
                        key={host.id}
                        onClick={() => handleSelect({ type: 'host', data: host })}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          selectedIndex === globalIndex
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${host.gradient || 'from-gray-400 to-gray-600'} text-white flex items-center justify-center shrink-0 font-bold`}>
                          {host.initials || host.name.charAt(0)}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">
                            {host.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {host.location}
                          </p>
                        </div>
                        <span className={`w-3 h-3 rounded-full ${host.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer avec raccourcis */}
        <div className="p-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-surface-dark rounded border border-gray-300 dark:border-white/10 font-mono">↑↓</kbd>
                Naviguer
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-surface-dark rounded border border-gray-300 dark:border-white/10 font-mono">↵</kbd>
                Sélectionner
              </span>
            </div>
            <span>{results.total} résultat{results.total > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
