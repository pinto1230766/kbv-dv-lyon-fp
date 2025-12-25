import React from 'react';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ onClose }) => {
  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['Ctrl', 'K'], description: 'Recherche globale' },
        { keys: ['1'], description: 'Dashboard' },
        { keys: ['2'], description: 'Planning' },
        { keys: ['3'], description: 'Orateurs' },
        { keys: ['4'], description: 'Hôtes' },
        { keys: ['5'], description: 'Messages' }
      ]
    },
    {
      category: 'Actions',
      items: [
        { keys: ['Ctrl', 'S'], description: 'Synchroniser' },
        { keys: ['Esc'], description: 'Fermer modal' }
      ]
    },
    {
      category: 'Aide',
      items: [
        { keys: ['?'], description: 'Afficher cette aide' }
      ]
    }
  ];

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Raccourcis Clavier
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((section, index) => (
            <div key={index}>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <kbd className="px-2 py-1 bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/20 rounded text-xs font-mono font-bold shadow-sm">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-gray-400 text-xs">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
          <p className="text-xs text-gray-500 text-center">
            💡 Astuce : Appuyez sur <kbd className="px-1.5 py-0.5 bg-white dark:bg-surface-dark rounded border border-gray-300 dark:border-white/10 font-mono">?</kbd> à tout moment pour afficher cette aide
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
