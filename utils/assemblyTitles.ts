// Utilitaire pour raccourcir les titres d'assemblées spéciales

export const ASSEMBLY_TITLES = {
  'VDSDC': {
    short: 'AS',
    full: 'Visita Do Superintendente De Circuito'
  },
  'KEDGDK': {
    short: 'AS',
    full: 'Asenbleia Ku Enkaregadu Di Grupu Di Kongregason'
  },
  'AKRDB': {
    short: 'AS',
    full: 'Asenbleia Ku Reprizentanti Di Betel'
  },
  'ADCCOSDC': {
    short: 'AS',
    full: 'Assembleia De Circuito Com O Superintendente De Circuito'
  },
  'ADCCRDF': {
    short: 'AS',
    full: 'Assembleia De Circuito Com Representante Da Filial'
  }
};

// Fonction pour obtenir le titre court (pour les bulles)
export function getShortTitle(title: string): string {
  // Vérifier si c'est un code d'assemblée
  if (ASSEMBLY_TITLES[title as keyof typeof ASSEMBLY_TITLES]) {
    return ASSEMBLY_TITLES[title as keyof typeof ASSEMBLY_TITLES].short;
  }
  
  // Vérifier si c'est un titre complet
  const entry = Object.values(ASSEMBLY_TITLES).find(a => a.full === title);
  if (entry) {
    return entry.short;
  }
  
  // Si ce n'est pas une assemblée spéciale, retourner le titre tel quel
  // mais limiter à 3 caractères pour les bulles
  if (title.length > 10) {
    return 'AS'; // Par défaut pour les assemblées
  }
  
  return title;
}

// Fonction pour obtenir le titre complet (pour les cartes)
export function getFullTitle(title: string): string {
  // Vérifier si c'est un code d'assemblée
  if (ASSEMBLY_TITLES[title as keyof typeof ASSEMBLY_TITLES]) {
    return ASSEMBLY_TITLES[title as keyof typeof ASSEMBLY_TITLES].full;
  }
  
  // Sinon retourner le titre tel quel
  return title;
}

// Fonction pour vérifier si c'est une assemblée spéciale
export function isAssembly(title: string): boolean {
  return !!ASSEMBLY_TITLES[title as keyof typeof ASSEMBLY_TITLES] || 
         Object.values(ASSEMBLY_TITLES).some(a => a.full === title);
}
