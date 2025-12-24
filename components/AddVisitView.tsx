
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../DataContext';
import { Visit, Host, Speaker } from '../types';
import { normalizeString } from '../utils/sheetSync';

interface AddVisitViewProps {
  onClose: () => void;
  onSave: (visit: Partial<Visit>) => void;
  initialHost?: Host;
  initialSpeaker?: Speaker;
  visitToEdit?: Visit;
  visitToDuplicate?: Visit;
}

const AddVisitView: React.FC<AddVisitViewProps> = ({ onClose, onSave, initialHost, initialSpeaker, visitToEdit, visitToDuplicate }) => {
  const { speakers, hosts, visits, showToast } = useData();
  
  const getTodayLocalISO = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState<Partial<Visit>>({
    date: getTodayLocalISO(),
    time: '14:30',
    status: 'New',
    meetingType: 'Physique'
  });
  
  const [selectionMode, setSelectionMode] = useState<'speaker' | 'host' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const isEditing = !!visitToEdit;

  useEffect(() => {
    if (isEditing && visitToEdit) {
      setFormData({ ...visitToEdit });
    } else if (visitToDuplicate) {
      const { id, ...rest } = visitToDuplicate;
      setFormData({ ...rest, date: getTodayLocalISO(), status: 'New' });
    } else {
      setFormData(prev => ({
        ...prev,
        hostId: initialHost?.id || prev.hostId,
        hostName: initialHost?.name || prev.hostName,
        speakerId: initialSpeaker?.id || prev.speakerId,
        speakerName: initialSpeaker?.name || prev.speakerName,
        congregation: initialSpeaker?.congregation || prev.congregation,
      }));
    }
  }, [visitToEdit, visitToDuplicate, initialHost, initialSpeaker, isEditing]);

  const conflicts = useMemo(() => {
      if (!formData.date) return [];
      const errs = [];
      if (formData.speakerId) {
          const conflict = visits.find(v => v.date === formData.date && v.speakerId === formData.speakerId && v.id !== formData.id && v.status !== 'Cancelled');
          if (conflict) errs.push(`⚠️ Cet orateur est déjà prévu ce jour.`);
      }
      return errs;
  }, [formData.date, formData.speakerId, formData.id, visits]);

  const canSave = formData.date && formData.speakerName && formData.speakerName !== '' && formData.speakerName !== 'À définir';

  const handleSave = () => {
    if (!canSave) {
        showToast("Veuillez remplir les champs obligatoires (*)", "error");
        return;
    }
    if (conflicts.length > 0 && !confirm("Conflit détecté. Enregistrer quand même ?")) return;

    const parts = formData.date!.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'short' });
    
    onSave({
      ...formData,
      dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1) + '.',
      month: dateObj.toLocaleDateString('fr-FR', { month: 'short' }),
      year: parts[0]
    });
  };

  if (selectionMode) {
    const term = normalizeString(searchTerm);
    return (
      <div className="fixed inset-0 z-[110] flex flex-col bg-background-light dark:bg-background-dark animate-in fade-in duration-200">
         <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 h-[60px] flex items-center px-4 gap-2">
            <button onClick={() => setSelectionMode(null)} className="p-2 -ml-2 rounded-full text-gray-500"><span className="material-symbols-outlined">arrow_back</span></button>
            <input type="text" placeholder={`Rechercher...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 h-full bg-transparent text-lg font-bold outline-none" autoFocus />
         </header>
         <main className="flex-1 overflow-y-auto p-4 space-y-3">
           {(selectionMode === 'speaker' ? speakers : hosts)
             .filter(item => {
                 const nameNorm = normalizeString(item.name);
                 const congNorm = selectionMode === 'speaker' ? normalizeString((item as Speaker).congregation) : normalizeString((item as Host).location);
                 return nameNorm.includes(term) || congNorm.includes(term);
             })
             .map(item => (
             <button key={item.id} onClick={() => {
                 if (selectionMode === 'speaker') setFormData(p => ({...p, speakerId: item.id, speakerName: item.name, congregation: (item as Speaker).congregation }));
                 else setFormData(p => ({...p, hostId: item.id, hostName: item.name}));
                 setSelectionMode(null);
                 setSearchTerm('');
             }} className="w-full flex items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm active:scale-95 transition-all">
               <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                   {item.initials || item.name.charAt(0)}
               </div>
               <div className="text-left flex-1 min-w-0">
                   <p className="font-bold dark:text-white truncate">{item.name}</p>
                   <p className="text-xs text-gray-500 truncate">{selectionMode === 'speaker' ? (item as Speaker).congregation : (item as Host).location}</p>
               </div>
             </button>
           ))}
         </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:bg-black/50 md:backdrop-blur-sm">
      <div className="w-full md:max-w-2xl h-[90vh] flex flex-col bg-background-light dark:bg-background-dark md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <header className="h-[60px] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 bg-white dark:bg-surface-dark/50">
          <button onClick={onClose} className="p-2"><span className="material-symbols-outlined">close</span></button>
          <h1 className="font-bold">{isEditing ? 'Modifier la Visite' : 'Nouvelle Visite'}</h1>
          <button onClick={handleSave} disabled={!canSave} className={`px-4 py-2 rounded-xl font-bold text-white shadow-lg transition-all ${canSave ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700 grayscale cursor-not-allowed opacity-50'}`}>Enregistrer</button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-8 pb-20 no-scrollbar">
          {conflicts.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl animate-in shake duration-500">
                  {conflicts.map((err, i) => <p key={i} className="text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">warning</span> {err}</p>)}
              </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Date <span className="text-primary">*</span></label>
              <input type="date" name="date" value={formData.date} onChange={e => setFormData(p => ({...p, date: e.target.value}))} className="w-full h-14 px-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 font-bold focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Heure <span className="text-primary">*</span></label>
              <input type="time" name="time" value={formData.time} onChange={e => setFormData(p => ({...p, time: e.target.value}))} className="w-full h-14 px-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 font-bold focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>

          <div className="space-y-3">
              <button onClick={() => setSelectionMode('speaker')} className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${formData.speakerId ? 'border-primary bg-primary/5' : 'border-dashed border-gray-300 dark:border-white/10 hover:border-primary/50'}`}>
                  <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">{formData.speakerName?.charAt(0) || '?'}</div>
                  <div className="text-left flex-1 truncate">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Orateur <span className="text-primary">*</span></p>
                      <p className="font-bold dark:text-white truncate text-lg">{formData.speakerName || 'Choisir un orateur...'}</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-400">chevron_right</span>
              </button>

              <button onClick={() => setSelectionMode('host')} className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${formData.hostId ? 'border-blue-500 bg-blue-500/5' : 'border-dashed border-gray-300 dark:border-white/10 hover:border-blue-500/50'}`}>
                  <div className="size-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-lg">{formData.hostName?.charAt(0) || '?'}</div>
                  <div className="text-left flex-1 truncate">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Hôte d'accueil</p>
                      <p className="font-bold dark:text-white truncate text-lg">{formData.hostName || 'Non assigné'}</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-400">chevron_right</span>
              </button>
          </div>

          <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Discours public</label>
              <div className="flex gap-2">
                <input type="number" placeholder="N°" name="discoursNumber" value={formData.discoursNumber || ''} onChange={e => setFormData(p => ({...p, discoursNumber: parseInt(e.target.value)}))} className="w-20 h-14 px-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 font-bold focus:ring-2 focus:ring-primary outline-none" />
                <input type="text" placeholder="Thème du discours..." name="discoursTitle" value={formData.discoursTitle || ''} onChange={e => setFormData(p => ({...p, discoursTitle: e.target.value}))} className="flex-1 h-14 px-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 font-bold focus:ring-2 focus:ring-primary outline-none" />
              </div>
          </div>

          <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Type de réunion</label>
              <div className="grid grid-cols-3 gap-2">
                  {(['Physique', 'Zoom', 'Hybride'] as const).map(type => (
                      <button 
                        key={type} 
                        onClick={() => setFormData(p => ({...p, meetingType: type}))}
                        className={`py-3 rounded-xl font-bold text-xs transition-all border ${formData.meetingType === type ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-surface-dark text-gray-500 border-gray-100 dark:border-white/10'}`}
                      >
                          {type}
                      </button>
                  ))}
              </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddVisitView;
