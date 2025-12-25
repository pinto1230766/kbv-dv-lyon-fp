import React from 'react';
import { Visit, TabType, NavigationProps } from '../types';
import { useData } from '../DataContext';
import { shortenCongregationName } from '../utils/sheetSync';
import { getFullTitle } from '../utils/assemblyTitles';

interface VisitDetailsProps {
  visit: Visit;
  onBack: () => void;
  onEdit: (visit: Visit) => void;
  onNavigate: (tab: TabType, props?: NavigationProps) => void;
}

const VisitDetails: React.FC<VisitDetailsProps> = ({ visit, onBack, onEdit, onNavigate }) => {
  const { updateVisit, deleteVisit, appSettings, showToast, hosts } = useData();

  const handleUpdateStatus = (status: Visit['status']) => {
      updateVisit(visit.id, { status });
  };

  const handleDelete = () => {
    if (confirm("Voulez-vous vraiment supprimer cette visite ?")) {
        deleteVisit(visit.id);
        onBack();
    }
  };

  const handleQuickMessage = () => {
      onNavigate('messages', { speakerId: visit.speakerId, visitId: visit.id });
  };

  const handleGetDirections = () => {
    const host = hosts.find(h => h.id === visit.hostId || h.name === visit.hostName);
    const address = host?.location || visit.hostName;
    if (address) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
        showToast("Calcul de l'itinéraire...", "info");
    } else {
        showToast("Pas d'adresse disponible", "error");
    }
  };

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="flex flex-col min-h-full bg-background-light dark:bg-background-dark animate-in slide-in-from-right duration-300 pb-24">
      
      {/* SECTION IMPRIMABLE (Fiche Hôte) */}
      <div className="print-only bg-white p-8 rounded-none border-none text-black">
          <div className="text-center border-b-4 border-primary pb-6 mb-8 report-header">
              <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">Fiche d'accueil Orateur</h1>
              <p className="text-xl font-bold uppercase tracking-widest">{appSettings.congregationName}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-12 mb-10">
              <div className="space-y-6">
                  <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">Informations Orateur</label>
                      <p className="text-2xl font-black leading-tight">{visit.speakerName}</p>
                      <p className="text-lg font-medium text-gray-600">{shortenCongregationName(visit.congregation)}</p>
                  </div>
                  <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">Date & Heure</label>
                      <p className="text-xl font-bold">{visit.dayName} {visit.date}</p>
                      <p className="text-lg text-primary font-bold">Heure du discours : {visit.time}</p>
                  </div>
              </div>
              <div className="space-y-6">
                  <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">Thème du discours Public</label>
                      <p className="text-xl font-bold italic leading-tight">"{visit.discoursTitle ? getFullTitle(visit.discoursTitle) : 'À définir'}"</p>
                      {visit.discoursNumber && <p className="text-lg font-black text-primary mt-1">Sujet n°{visit.discoursNumber}</p>}
                  </div>
                  <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">Hébergement assigné</label>
                      <p className="text-xl font-bold bg-gray-50 p-2 border border-gray-200 rounded">{visit.hostName || 'Hôte non défini'}</p>
                  </div>
              </div>
          </div>
          
          <div className="border-2 border-gray-100 p-8 rounded-3xl bg-gray-50/50 mb-12">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Notes & Instructions pour l'Hôte</h3>
              <p className="text-lg text-gray-800 leading-relaxed italic">
                {visit.notes || "Aucune consigne spécifique. Merci pour votre hospitalité !"}
              </p>
          </div>
          
          <div className="mt-20 pt-8 border-t-2 border-gray-100 text-center">
              <p className="text-sm text-gray-400 font-medium">Document généré par Gestion de Congrégation v1.2</p>
          </div>
      </div>

      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 h-16 flex items-center justify-between px-4 no-print">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"><span className="material-symbols-outlined">arrow_back</span></button>
        <h1 className="text-lg font-bold">Détails</h1>
        <div className="flex gap-1">
            <button onClick={handlePrint} className="p-2 text-gray-500 hover:text-primary transition-colors" title="Imprimer Fiche Hôte"><span className="material-symbols-outlined">print</span></button>
            <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"><span className="material-symbols-outlined">delete</span></button>
            <button onClick={() => onEdit(visit)} className="text-primary font-bold px-2 py-1 rounded hover:bg-primary/10 transition-colors">Modifier</button>
        </div>
      </header>

      <main className="p-4 space-y-6 no-print">
        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 border border-gray-200 dark:border-white/5 shadow-xl text-center relative overflow-hidden">
            <div className="mb-4">
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     visit.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                     visit.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                     'bg-amber-100 text-amber-700'
                 }`}>{visit.status.toUpperCase()}</span>
                 <h2 className="text-3xl font-black mt-4 text-gray-900 dark:text-white capitalize">{visit.dayName} {visit.date}</h2>
                 <p className="text-gray-400 font-bold uppercase tracking-widest mt-1">{visit.time}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-4 border-t border-gray-50 dark:border-white/5 mt-6">
                <ActionButton icon="check_circle" label="Confirmer" active={visit.status === 'Confirmed'} onClick={() => handleUpdateStatus('Confirmed')} color="text-green-500" />
                <ActionButton icon="schedule" label="Attente" active={visit.status === 'Pending' || visit.status === 'New'} onClick={() => handleUpdateStatus('Pending')} color="text-amber-500" />
                <ActionButton icon="cancel" label="Annuler" active={visit.status === 'Cancelled'} onClick={() => handleUpdateStatus('Cancelled')} color="text-red-500" />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={handleQuickMessage}
                className="bg-primary text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
                <span className="material-symbols-outlined">chat</span>
                <span className="text-[10px] uppercase tracking-widest">Message</span>
            </button>
            <button 
                onClick={handleGetDirections}
                disabled={!visit.hostName}
                className="bg-blue-600 disabled:bg-gray-400 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
                <span className="material-symbols-outlined">directions</span>
                <span className="text-[10px] uppercase tracking-widest">Itinéraire</span>
            </button>
        </div>

        <div className="space-y-4">
            <InfoCard icon="record_voice_over" label="Orateur" title={visit.speakerName} sub={shortenCongregationName(visit.congregation)} onClick={() => visit.speakerId && onNavigate('speakers', { speakerId: visit.speakerId })} />
            <InfoCard icon="home" label="Hébergement" title={visit.hostName || 'Non assigné'} sub={visit.hostId ? 'Détails de l\'hôte' : 'Assigner un hôte'} onClick={() => visit.hostId ? onNavigate('hosts', { hostId: visit.hostId }) : onEdit(visit)} />
            
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Discours</p>
                <h4 className="font-bold text-xl dark:text-white leading-tight">
                    {visit.discoursNumber && <span className="text-primary mr-2">#{visit.discoursNumber}</span>}
                    {visit.discoursTitle ? getFullTitle(visit.discoursTitle) : 'Titre non défini'}
                </h4>
            </div>
            
            {visit.notes && (
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase mb-1 tracking-widest">Notes</p>
                    <p className="text-sm text-amber-900 dark:text-amber-200 italic">"{visit.notes}"</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

const ActionButton = ({ icon, label, active, onClick, color }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${active ? 'bg-primary/5 ring-1 ring-primary/20' : 'opacity-40 hover:opacity-100'}`}>
        <span className={`material-symbols-outlined ${active ? color : 'text-gray-400'} text-2xl`}>{icon}</span>
        <span className={`text-[10px] font-bold ${active ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{label}</span>
    </button>
);

const InfoCard = ({ icon, label, title, sub, onClick }: any) => (
    <div onClick={onClick} className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-all group">
        <div className="size-12 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors"><span className="material-symbols-outlined">{icon}</span></div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="font-bold text-gray-900 dark:text-white truncate text-lg leading-tight">{title}</p>
            <p className="text-xs text-gray-500 truncate">{sub}</p>
        </div>
        <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors">chevron_right</span>
    </div>
);

export default VisitDetails;
