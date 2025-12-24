
import React, { useState, useRef, useEffect } from 'react';
import { Host } from '../types';

interface AddHostViewProps {
  onClose: () => void;
  onSave: (host: Partial<Host>) => void;
  hostToEdit?: Host;
}

const AddHostView: React.FC<AddHostViewProps> = ({ onClose, onSave, hostToEdit }) => {
  const [formData, setFormData] = useState<Partial<Host>>({
    available: true,
    capacity: 1,
    capacityIcon: 'bed'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!hostToEdit;
  
  useEffect(() => {
    if (isEditing) {
      setFormData(hostToEdit);
    }
  }, [hostToEdit, isEditing]);

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

  const handleSave = () => {
    if (!formData.name) {
        alert("Le nom de l'hôte est obligatoire.");
        return;
    }
    onSave(formData);
  };

  const isValid = !!formData.name;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:bg-black/50 md:backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full md:max-w-2xl md:h-[85vh] h-full flex flex-col bg-background-light dark:bg-background-dark md:rounded-2xl shadow-2xl overflow-hidden font-display antialiased text-gray-900 dark:text-white animate-in slide-in-from-bottom duration-300">
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          className="hidden"
          accept="image/*"
        />

        {/* Top App Bar */}
        <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
          <div className="flex items-center justify-between px-4 h-[60px]">
            <button 
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-gray-500 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h1 className="text-base font-bold leading-tight tracking-tight text-center flex-1">
              {isEditing ? 'Modifier Hôte' : 'Ajouter un Hôte'}
            </h1>
            <button 
              onClick={handleSave}
              disabled={!isValid}
              className="px-3 py-1.5 text-sm font-bold text-white bg-primary rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              Enregistrer
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-[120px] md:pb-6 w-full max-w-md mx-auto">
          
          {/* Photo Upload Section */}
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div 
                className="w-28 h-28 rounded-full bg-gray-100 dark:bg-surface-dark border-2 border-dashed border-gray-300 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-sm transition-all group-hover:border-primary bg-cover bg-center"
                style={{backgroundImage: `url(${formData.avatar})`}}
              >
                 {!formData.avatar && <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-white/20">groups</span>}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="material-symbols-outlined text-white">edit</span>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-background-dark transform transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              </div>
            </div>
          </div>

          {/* Form Sections */}
          <div className="px-4 space-y-6">
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 dark:text-text-muted uppercase tracking-wider ml-1">Informations</h3>
              <input 
                name="name" 
                value={formData.name || ''} 
                onChange={handleChange} 
                className="w-full h-14 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-black/40 focus:border-primary focus:ring-0 transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400" 
                placeholder="Nom de famille / Hôte" 
              />
              <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">location_on</span>
                  <input 
                    name="location" 
                    value={formData.location || ''} 
                    onChange={handleChange} 
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-black/40 focus:border-primary focus:ring-0 transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400" 
                    placeholder="Quartier / Ville" 
                  />
              </div>
            </section>
            
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 dark:text-text-muted uppercase tracking-wider ml-1">Contact</h3>
               <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">call</span>
                  <input 
                    name="phone" 
                    value={formData.phone || ''} 
                    onChange={handleChange} 
                    type="tel" 
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-black/40 focus:border-primary focus:ring-0 transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400" 
                    placeholder="Téléphone" 
                  />
                </div>
                 <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
                  <input 
                    name="email" 
                    value={formData.email || ''} 
                    onChange={handleChange} 
                    type="email" 
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-black/40 focus:border-primary focus:ring-0 transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400" 
                    placeholder="Email" 
                  />
                </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 dark:text-text-muted uppercase tracking-wider ml-1">Capacité & Disponibilité</h3>
              
              {/* Capacity Selector */}
              <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 ml-1">Couchages</label>
                  <div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
                      {[1, 2, 3, 4].map(num => (
                          <button 
                            key={num}
                            onClick={() => setFormData(p => ({...p, capacity: num}))}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                formData.capacity === num 
                                ? 'bg-white dark:bg-surface-highlight text-primary shadow-sm' 
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                              {num === 4 ? '4+' : num}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Availability Toggle */}
              <div 
                onClick={() => setFormData(p => ({...p, available: !p.available}))}
                className="flex items-center justify-between p-4 h-16 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
              >
                   <div className="flex flex-col">
                       <span className="font-bold text-gray-900 dark:text-white">Hôte Disponible</span>
                       <span className="text-xs text-gray-500">Accepte les hébergements</span>
                   </div>
                   <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${formData.available ? 'bg-green-500' : 'bg-gray-200 dark:bg-white/10'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${formData.available ? 'translate-x-5' : ''}`}></div>
                   </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AddHostView;
