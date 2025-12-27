
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Speaker } from '../types';
import { useData } from '../DataContext';

interface AddSpeakerViewProps {
  onClose: () => void;
  onSave: (speaker: Partial<Speaker>) => void;
  speakerToEdit?: Speaker;
}

const AddSpeakerView: React.FC<AddSpeakerViewProps> = ({ onClose, onSave, speakerToEdit }) => {
  const { speakers, deleteSpeaker } = useData();
  const [formData, setFormData] = useState<Partial<Speaker>>({
    status: 'Actif',
    name: '',
    congregation: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!speakerToEdit;

  const congregations = useMemo(() => {
      const all = speakers.map(s => s.congregation).filter(Boolean);
      return Array.from(new Set(all)).sort();
  }, [speakers]);

  useEffect(() => {
    if (isEditing) {
      setFormData(speakerToEdit);
    }
  }, [speakerToEdit, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const isValid = useMemo(() => {
      return (formData.firstName || formData.lastName || formData.name) && formData.congregation && formData.congregation !== '';
  }, [formData]);

  const handleSave = () => {
    if (!isValid) return;
    
    // Assurer que le champ name est rempli à partir du prénom/nom si nécessaire
    const finalData = { ...formData };
    if (!finalData.name && (finalData.firstName || finalData.lastName)) {
        finalData.name = `${finalData.firstName || ''} ${finalData.lastName || ''}`.trim();
    }

    onSave(finalData);
  };

  const handleDelete = () => {
    if (speakerToEdit) {
      deleteSpeaker(speakerToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:bg-black/50 md:backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full md:max-w-2xl md:h-[85vh] h-full flex flex-col bg-background-light dark:bg-background-dark md:rounded-3xl shadow-2xl overflow-hidden font-sans antialiased text-gray-900 dark:text-white animate-in slide-in-from-bottom duration-300">
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          className="hidden"
          accept="image/*"
        />

        <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
          <div className="flex items-center justify-between px-4 h-[70px]">
            <button onClick={onClose} className="size-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"><span className="material-symbols-outlined">close</span></button>
            <div className="flex-1 text-center min-w-0 px-4">
                <h1 className="text-lg font-black leading-tight tracking-tight truncate">
                    {isEditing ? `Modifier ${formData.firstName || formData.name || 'Orateur'}` : 'Nouveau Orateur'}
                </h1>
                {isEditing && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formData.congregation}</p>}
            </div>
            <button 
              onClick={handleSave}
              disabled={!isValid}
              className={`px-5 py-2 text-sm font-black text-white rounded-xl shadow-lg transition-all ${isValid ? 'bg-primary shadow-primary/30' : 'bg-gray-300 dark:bg-gray-700 opacity-50 cursor-not-allowed'}`}
            >
              OK
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-[140px] md:pb-10 w-full max-w-lg mx-auto px-6">
          <div className="flex flex-col items-center justify-center py-10">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-surface-dark border-3 border-dashed border-gray-300 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-inner transition-all group-hover:border-primary bg-cover bg-center" style={{backgroundImage: `url(${formData.avatar})`}}>
                 {!formData.avatar && <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-white/20">person_add</span>}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"><span className="material-symbols-outlined text-white text-3xl">edit</span></div>
              </div>
              <div className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-background-dark transform transition-transform group-hover:scale-110"><span className="material-symbols-outlined text-[20px]">photo_camera</span></div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Identité <span className="text-primary">*</span></h3>
              <div className="grid grid-cols-2 gap-4">
                 <input name="firstName" value={formData.firstName || ''} onChange={handleChange} className="w-full h-16 px-5 rounded-2xl bg-gray-100/50 dark:bg-white/5 border-2 border-transparent focus:bg-white dark:focus:bg-black/40 focus:border-primary/50 focus:ring-0 transition-all font-bold text-gray-900 dark:text-white placeholder-gray-400 text-lg" placeholder="Prénom" />
                 <input name="lastName" value={formData.lastName || ''} onChange={handleChange} className="w-full h-16 px-5 rounded-2xl bg-gray-100/50 dark:bg-white/5 border-2 border-transparent focus:bg-white dark:focus:bg-black/40 focus:border-primary/50 focus:ring-0 transition-all font-bold text-gray-900 dark:text-white placeholder-gray-400 text-lg" placeholder="Nom" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Contact</h3>
              <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-2xl">call</span>
                  <input name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full h-16 pl-14 pr-5 rounded-2xl bg-gray-100/50 dark:bg-white/5 border-2 border-transparent focus:bg-white dark:focus:bg-black/40 focus:border-primary/50 focus:ring-0 transition-all font-bold text-gray-900 dark:text-white placeholder-gray-400 text-lg" placeholder="Téléphone" type="tel" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Congrégation <span className="text-primary">*</span></h3>
              <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-2xl">groups</span>
                  <input name="congregation" value={formData.congregation || ''} onChange={handleChange} list="congregations-list" className="w-full h-16 pl-14 pr-12 rounded-2xl bg-gray-100/50 dark:bg-white/5 border-2 border-transparent focus:bg-white dark:focus:bg-black/40 focus:border-primary/50 focus:ring-0 transition-all font-bold text-gray-900 dark:text-white placeholder-gray-400 text-lg" placeholder="Choisir une congrégation..." type="text" />
                  <datalist id="congregations-list">{congregations.map((cong, idx) => <option key={idx} value={cong} />)}</datalist>
              </div>
                
              <div className="flex flex-col gap-3 p-5 rounded-3xl bg-white dark:bg-surface-dark border-2 border-gray-100 dark:border-white/5 shadow-inner">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Disponibilité</span>
                  <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl">
                      {['Actif', 'Inactif', 'En pause'].map(status => (
                          <button key={status} onClick={() => setFormData(p => ({...p, status: status as any}))} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${formData.status === status ? 'bg-primary shadow-lg text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>{status.toUpperCase()}</button>
                      ))}
                  </div>
              </div>
            </div>

            {isEditing && (
              <div className="pt-8 border-t border-gray-100 dark:border-white/5">
                {showDeleteConfirm ? (
                  <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-2xl border border-red-200 dark:border-red-500/20 text-center animate-in zoom-in-95">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-3">Supprimer définitivement cet orateur ?</p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 h-12 rounded-xl bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 font-bold border border-gray-200 dark:border-white/10">Annuler</button>
                      <button onClick={handleDelete} className="flex-1 h-12 rounded-xl bg-red-600 text-white font-bold shadow-lg shadow-red-600/30">Oui, supprimer</button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full h-16 flex items-center justify-center gap-2 rounded-2xl border-2 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-500/5 transition-all"
                  >
                    <span className="material-symbols-outlined">delete_forever</span>
                    Supprimer l'orateur
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddSpeakerView;
