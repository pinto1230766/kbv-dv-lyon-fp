
import React, { useState } from 'react';
import { useData } from '../DataContext';
import { ActionItem, TabType, NavigationProps } from '../types';

interface ActionsListProps {
  onNavigate: (tab: TabType, props?: NavigationProps) => void;
}

const ActionsList: React.FC<ActionsListProps> = ({ onNavigate }) => {
  const { actions, removeAction } = useData();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(actions.length / itemsPerPage);
  const paginatedActions = actions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNavigate = (item: ActionItem) => {
    // Navigue vers le contexte approprié sans supprimer l'action
    if (item.visitId) {
      onNavigate('planning', { visitId: item.visitId });
    } else if (item.speakerId) {
      onNavigate('speakers', { speakerId: item.speakerId });
    } else {
      onNavigate('dashboard');
    }
  };

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeAction(id);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (actions.length === 0) {
    return (
        <section className="px-4 pb-4">
             <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Actions requises</h3>
            </div>
            <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 p-8 text-center shadow-sm">
                <div className="w-14 h-14 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                   <span className="material-symbols-outlined text-3xl">check</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Tout est en ordre !</p>
                <p className="text-xs text-gray-500 dark:text-text-secondary mt-1">Aucune action en attente pour le moment.</p>
            </div>
        </section>
    );
  }
  
  return (
    <section className="px-0 pb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Actions requises</h3>
          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md shadow-red-500/30">{actions.length}</span>
        </div>
        {totalPages > 1 && (
            <div className="flex gap-2">
                <button onClick={handlePrevPage} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-200 transition-colors">
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button onClick={handleNextPage} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-200 transition-colors">
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
            </div>
        )}
      </div>
      
      <div className="flex flex-col gap-3">
        {paginatedActions.map((item) => (
          <div 
            key={item.id} 
            className="group bg-white dark:bg-card-dark p-3 rounded-2xl border border-transparent dark:border-white/5 shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center gap-4 cursor-pointer h-20"
            onClick={() => handleNavigate(item)}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.color} shadow-sm`}>
              <span className="material-symbols-outlined text-2xl">{item.icon}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gray-900 dark:text-white truncate leading-tight">{item.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1 font-medium">{item.subtitle}</p>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => handleDismiss(e, item.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors shadow-sm"
                  title="Marquer comme fait"
                >
                  <span className="material-symbols-outlined text-xl">check</span>
                </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ActionsList;
