import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../DataContext';
import { Speaker, Host, Visit, NavigationProps } from '../types';
import { normalizeString } from '../utils/sheetSync';
import { getFullTitle } from '../utils/assemblyTitles';

interface MessagesViewProps {
  initialProps?: NavigationProps | null;
  onActionHandled?: () => void;
}

// Templates with multi-language support
const templates = {
  speakers: {
    'Confirmation': {
      icon: 'check_circle',
      color: 'bg-green-100 text-green-600',
      fr: `Bonjour {firstName} 👋,\nC'est pour confirmer ta visite du {date} à {time} à {congregation}.\n📖 Thème : "{theme}"\nPeux-tu me confirmer que c'est toujours bon pour toi ?\nÀ bientôt !`,
      pt: `Olá {firstName} 👋,\nEspero que esteja tudo bem. Estou a contactar para confirmar o discurso do dia {date} às {time} na {congregation}.\n📖 Tema: "{theme}"\nPode confirmar se está tudo bem?\nAté breve!`,
      cv: `Bon dia {firstName} 👋,\nN ta manda-u es mensaji pa konfirma bu diskursu dia {date} ás {time} na {congregation}.\n📖 Tema: "{theme}"\nBu pode konfirma si sta dretu?\nTé logu!`
    },
    'Rappel': {
      icon: 'alarm',
      color: 'bg-amber-100 text-amber-600',
      fr: `Coucou {firstName},\nPetit rappel pour ton discours de demain ({date}) à {time}.\nL'hôte t'attend vers {arrivalTime}. À demain !`,
      pt: `Olá {firstName},\nPequeno lembrete para o teu discurso de amanhã ({date}) às {time}.\nO anfitrião espera por ti às {arrivalTime}. Até amanhã!`,
      cv: `Ola {firstName},\nSó pa lenbra-u di diskursu di manhã ({date}) ás {time}.\nAnfitrião sta spera-u la pa {arrivalTime}. Té manhã!`
    },
    'Merci': {
      icon: 'volunteer_activism',
      color: 'bg-red-100 text-red-600',
      fr: `Bonjour {firstName},\nJuste un petit mot pour te remercier pour ton excellent discours aujourd'hui. Nous avons beaucoup apprécié.\nBon retour !`,
      pt: `Olá {firstName},\nMuito obrigado pelo excelente discurso de hoje. Gostámos muito de te ouvir.\nBoa viagem de regresso!`,
      cv: `Bon dia {firstName},\nNu kre gradece-u pa bu diskursu exselenti di oji. Nu gosta txeu.\nBoa viagem di bolta!`
    }
  },
  hosts: {
    'Demande': {
      icon: 'hotel',
      color: 'bg-blue-100 text-blue-600',
      fr: `Bonjour {firstName} 👋,\nSeriez-vous disponibles pour accueillir l'orateur {speakerName} le {date} ?\nMerci d'avance pour votre hospitalité !`,
      pt: `Olá {firstName} 👋,\nEstariam disponíveis para receber o orador {speakerName} no dia {date}?\nObrigado pela vossa hospitalidade!`,
      cv: `Bon dia {firstName} 👋,\nNhos ta podeia resebe orador {speakerName} dia {date}?\nObrigadu pa nhos hospitalidadi!`
    },
    'Rappel': {
      icon: 'notifications_active',
      color: 'bg-amber-100 text-amber-600',
      fr: `Coucou {firstName},\nPetit rappel : {speakerName} arrive demain vers {time} pour la visite du {date}.\nMerci encore !`,
      pt: `Olá {firstName},\nLembrete: {speakerName} chega amanhã por volta das {time} para a visita de {date}.\nMuito obrigado!`,
      cv: `Ola {firstName},\nSó pa lenbra-u: {speakerName} ta txiga manhã pa {time} pa vizita di dia {date}.\nObrigadu!`
    }
  }
};

const MessagesView: React.FC<MessagesViewProps> = ({ initialProps, onActionHandled }) => {
  const { speakers, hosts, visits, showToast } = useData();
  const [activeTab, setActiveTab] = useState<'speakers' | 'hosts'>('speakers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [modalOptions, setModalOptions] = useState({ 
    template: 'Confirmation', 
    lang: 'fr' as 'fr' | 'pt' | 'cv' 
  });
  const [messageText, setMessageText] = useState('');
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  // Auto-select template based on tab
  useEffect(() => {
    const currentTemplates = activeTab === 'speakers' ? templates.speakers : templates.hosts;
    if (!(modalOptions.template in currentTemplates)) {
        setModalOptions(p => ({ ...p, template: Object.keys(currentTemplates)[0] }));
    }
  }, [activeTab]);

  // Handle Initial Props
  useEffect(() => {
      if (initialProps?.speakerId) {
          setActiveTab('speakers');
          setSelectedId(initialProps.speakerId);
          setIsModalOpen(true);
          onActionHandled?.();
      } else if (initialProps?.hostId) {
          setActiveTab('hosts');
          setSelectedId(initialProps.hostId);
          setIsModalOpen(true);
          onActionHandled?.();
      }
  }, [initialProps, onActionHandled]);

  const filteredList = useMemo(() => {
    const term = normalizeString(searchTerm);
    if (activeTab === 'speakers') {
        return speakers.filter(s => s.status === 'Actif' && (term === '' || normalizeString(s.name).includes(term) || normalizeString(s.congregation).includes(term)));
    } else {
        return hosts.filter(h => term === '' || normalizeString(h.name).includes(term) || normalizeString(h.location).includes(term));
    }
  }, [speakers, hosts, searchTerm, activeTab]);
  
  const selectedItem = useMemo(() => {
    return activeTab === 'speakers' 
      ? speakers.find(s => s.id === selectedId)
      : hosts.find(h => h.id === selectedId);
  }, [activeTab, speakers, hosts, selectedId]);

  // Find relevant visit
  const nextVisit = useMemo(() => {
    if (!selectedItem) return null;
    const today = new Date().toISOString().split('T')[0];
    
    if (activeTab === 'speakers') {
        return visits
        .filter(v => (v.speakerId === selectedItem.id || normalizeString(v.speakerName) === normalizeString(selectedItem.name)) && v.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))[0];
    } else {
        return visits
        .filter(v => (v.hostId === selectedItem.id) && v.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))[0];
    }
  }, [selectedItem, visits, activeTab]);

  // Generate Message Text
  useEffect(() => {
    if (!selectedItem) {
      setMessageText('');
      return;
    }
    
    const currentTemplates = activeTab === 'speakers' ? templates.speakers : templates.hosts;
    const templateData = (currentTemplates as any)[modalOptions.template];
    if (!templateData) return;

    const template = templateData[modalOptions.lang] || "Modèle non trouvé.";
    
    const replacements = {
      firstName: selectedItem.name.split(' ')[0],
      speakerName: nextVisit ? nextVisit.speakerName : 'l\'orateur',
      date: nextVisit ? new Date(nextVisit.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long'}) : '[Date]',
      time: nextVisit?.time || '14:30',
      congregation: nextVisit?.congregation || 'notre congrégation',
      theme: nextVisit?.discoursTitle ? getFullTitle(nextVisit.discoursTitle) : '[Sujet]',
      arrivalTime: '13h30'
    };
    
    let generated = template;
    Object.entries(replacements).forEach(([key, value]) => {
      generated = generated.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    setMessageText(generated);
  }, [selectedItem, nextVisit, modalOptions, activeTab]);

  const handleSendChannel = (channel: 'whatsapp' | 'sms' | 'email') => {
    const encodedText = encodeURIComponent(messageText);
    const phone = selectedItem?.phone ? selectedItem.phone.replace(/[^0-9+]/g, '') : '';
    const email = selectedItem?.email || '';

    if (channel === 'whatsapp') {
        window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank');
    } else if (channel === 'sms') {
        window.open(`sms:${phone}?body=${encodedText}`, '_blank');
    } else if (channel === 'email') {
        window.open(`mailto:${email}?subject=Visite à la congrégation&body=${encodedText}`, '_blank');
    }
    
    showToast("Message en cours d'envoi...", "info");
    setIsModalOpen(false);
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(messageText);
      setShowCopyFeedback(true);
      showToast("Message copié dans le presse-papier", "success");
      setTimeout(() => setShowCopyFeedback(false), 2000);
  };

  return (
    <div className="flex flex-col xl:flex-row h-full bg-background-light dark:bg-background-dark animate-in fade-in duration-300 overflow-hidden">
      
      {/* COLUMN 1: List (Left) */}
      <div className="flex flex-col w-full xl:w-[450px] xl:border-r border-gray-200 dark:border-white/5 h-full">
          {/* Page Header */}
          <header className="flex-none pt-8 px-6 bg-background-light dark:bg-background-dark">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter">Communication</h2>

            <div className="mb-6 space-y-4">
              <div className="relative flex items-center h-14 rounded-2xl bg-gray-100 dark:bg-white/5 overflow-hidden shadow-inner border-2 border-transparent focus-within:border-primary/50 transition-all">
                <span className="material-symbols-outlined absolute left-4 text-gray-400 text-2xl">search</span>
                <input 
                  className="w-full h-full pl-14 pr-4 outline-none text-lg bg-transparent placeholder-gray-400 font-bold" 
                  placeholder={activeTab === 'speakers' ? "Rechercher..." : "Hôte..."}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex bg-gray-200 dark:bg-black/20 p-1.5 rounded-2xl">
                  <TabButton active={activeTab === 'speakers'} onClick={() => { setActiveTab('speakers'); setSelectedId(''); }} icon="record_voice_over" label="Orateurs" />
                  <TabButton active={activeTab === 'hosts'} onClick={() => { setActiveTab('hosts'); setSelectedId(''); }} icon="home" label="Hôtes" />
              </div>
            </div>
          </header>

          {/* Main List */}
          <main className="flex-1 overflow-y-auto px-6 pb-24 space-y-3 pt-2 no-scrollbar">
              {filteredList.map((item: any) => (
                  <div 
                    key={item.id} 
                    onClick={() => { setSelectedId(item.id); setIsModalOpen(window.innerWidth < 1280); }} 
                    className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all cursor-pointer active:scale-[0.98] group ${selectedId === item.id ? 'bg-primary border-primary shadow-xl shadow-primary/20 text-white' : 'bg-white dark:bg-surface-dark border-transparent shadow-md hover:border-primary/30'}`}
                  >
                    <div className={`flex items-center justify-center h-14 w-14 rounded-full text-xl font-black transition-colors ${selectedId === item.id ? 'bg-white text-primary' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                      {item.initials || item.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-lg font-black truncate leading-tight ${selectedId === item.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{item.name}</p>
                        <p className={`text-[10px] truncate uppercase font-bold tracking-widest mt-1 ${selectedId === item.id ? 'text-white/60' : 'text-gray-400'}`}>
                            {activeTab === 'speakers' ? item.congregation : item.location}
                        </p>
                    </div>
                  </div>
              ))}
              {filteredList.length === 0 && (
                  <div className="py-20 text-center opacity-50 flex flex-col items-center">
                      <span className="material-symbols-outlined text-5xl mb-3">person_off</span>
                      <p className="text-base font-bold">Aucun contact trouvé.</p>
                  </div>
              )}
          </main>
      </div>

      {/* COLUMN 2: Message Editor (Right - Tablet/XL only) */}
      <div className="hidden xl:flex flex-col flex-1 bg-gray-50 dark:bg-black/20 h-full overflow-hidden">
          {selectedItem ? (
              <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-500">
                  <header className="px-8 py-8 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark flex items-center justify-between">
                      <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-primary/20">{selectedItem.initials || selectedItem.name.charAt(0)}</div>
                          <div>
                              <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-none">{selectedItem.name}</h2>
                              <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">{activeTab === 'speakers' ? selectedItem.congregation : selectedItem.location}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          {selectedItem.phone && <span className="bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border border-green-200 dark:border-green-500/20">{selectedItem.phone}</span>}
                      </div>
                  </header>

                  <main className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                      <MessageComposer 
                        activeTab={activeTab}
                        modalOptions={modalOptions}
                        setModalOptions={setModalOptions}
                        messageText={messageText}
                        setMessageText={setMessageText}
                        handleCopy={handleCopy}
                        showCopyFeedback={showCopyFeedback}
                        onSend={handleSendChannel}
                      />
                  </main>
              </div>
          ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 space-y-4">
                  <div className="size-24 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-white/10">
                    <span className="material-symbols-outlined text-5xl">forum</span>
                  </div>
                  <p className="text-xl font-bold uppercase tracking-widest">Sélectionnez un contact</p>
                  <p className="max-w-xs text-center text-sm font-medium opacity-60">Choisissez un orateur ou un hôte dans la liste pour préparer votre message.</p>
              </div>
          )}
      </div>

      {/* Message Modal (Mobile Only) */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <header className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">{selectedItem.initials || selectedItem.name.charAt(0)}</div>
                  <h2 className="text-base font-bold">{selectedItem.name}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"><span className="material-symbols-outlined">close</span></button>
            </header>
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                <MessageComposer 
                    activeTab={activeTab}
                    modalOptions={modalOptions}
                    setModalOptions={setModalOptions}
                    messageText={messageText}
                    setMessageText={setMessageText}
                    handleCopy={handleCopy}
                    showCopyFeedback={showCopyFeedback}
                    onSend={handleSendChannel}
                />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for Message Composition to avoid code duplication
const MessageComposer = ({ activeTab, modalOptions, setModalOptions, messageText, setMessageText, handleCopy, showCopyFeedback, onSend }: any) => (
    <div className="space-y-8">
        {/* Template Select */}
        <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Type de message</label>
            <div className="grid grid-cols-3 gap-3">
                {Object.entries(activeTab === 'speakers' ? templates.speakers : templates.hosts).map(([key, tmpl]: [string, any]) => (
                    <button 
                      key={key} 
                      onClick={() => setModalOptions((p: any) => ({...p, template: key}))} 
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all shadow-sm ${modalOptions.template === key ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-white dark:bg-white/5 text-gray-500 hover:border-gray-200'}`}
                    >
                        <span className="material-symbols-outlined text-3xl">{tmpl.icon}</span>
                        <span className="text-[10px] font-black text-center">{key.toUpperCase()}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Language Select */}
        <div className="space-y-4">
             <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Langue</label>
             <div className="flex bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200 dark:border-white/5">
                {(['fr', 'pt', 'cv'] as const).map(l => (
                    <button key={l} onClick={() => setModalOptions((p: any) => ({...p, lang: l}))} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${modalOptions.lang === l ? 'bg-white dark:bg-surface-dark shadow-md text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
                      {l === 'fr' ? 'FRANÇAIS' : l === 'pt' ? 'PORTUGUÊS' : 'KRIOLU'}
                    </button>
                ))}
             </div>
        </div>

        {/* Preview & Edit */}
        <div className="space-y-4">
           <div className="flex justify-between items-center px-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Contenu du message</label>
              <button onClick={handleCopy} className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                {showCopyFeedback ? 'Prêt !' : 'Copier'}
              </button>
           </div>
           <textarea 
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              className="w-full h-56 p-6 text-base font-medium bg-white dark:bg-black/20 border-2 border-gray-100 dark:border-white/5 rounded-3xl focus:border-primary/50 outline-none resize-none font-sans leading-relaxed text-gray-900 dark:text-white shadow-inner"
              placeholder="Rédigez votre message ici..."
           />
        </div>

        {/* Channels Footer */}
        <div className="grid grid-cols-3 gap-4 pt-4">
            <ChannelButton icon="chat" label="WhatsApp" color="bg-[#25D366]" onClick={() => onSend('whatsapp')} />
            <ChannelButton icon="sms" label="SMS" color="bg-blue-500" onClick={() => onSend('sms')} />
            <ChannelButton icon="alternate_email" label="Email" color="bg-amber-500" onClick={() => onSend('email')} />
        </div>
    </div>
);

const TabButton = ({ active, onClick, icon, label }: any) => (
    <button onClick={onClick} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${active ? 'bg-white dark:bg-surface-dark shadow-md text-gray-900 dark:text-white' : 'text-gray-500'}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
        {label.toUpperCase()}
    </button>
);

const ChannelButton = ({ icon, label, color, onClick }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-3xl ${color} text-white shadow-xl shadow-current/20 active:scale-95 transition-all h-24`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
);

export default MessagesView;
