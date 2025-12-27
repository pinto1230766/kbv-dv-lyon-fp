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

// Fonction pour normaliser les titres pour la comparaison
function normalize(str: string): string {
  if (!str) return '';
  return str.toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9]/g, ''); // Garde uniquement les lettres et chiffres
}

// Fonction pour obtenir le titre court (pour les bulles)
export function getShortTitle(title: string): string {
  if (!title) return '';
  const normTitle = normalize(title);
  
  // Vérifier si c'est un code d'assemblée
  const codeEntry = Object.entries(ASSEMBLY_TITLES).find(
    ([code]) => normalize(code) === normTitle
  );
  if (codeEntry) return codeEntry[1].short;
  
  // Vérifier si c'est un titre complet
  const fullEntry = Object.values(ASSEMBLY_TITLES).find(
    a => normalize(a.full) === normTitle
  );
  if (fullEntry) return fullEntry.short;
  
  // Détection par mots-clés si le titre est long ou contient des mots spécifiques
  const lowerTitle = title.toLowerCase();
  const keywords = ['asenbleia', 'assembleia', 'superintendente', 'circuito', 'betel', 'filial', 'visita', 'circulo'];
  
  if (keywords.some(k => lowerTitle.includes(k))) {
    return 'AS';
  }

  // Détection de codes d'assemblée (4+ majuscules suivies d'espace)
  if (/^[A-Z]{4,}/.test(title)) {
    return 'AS';
  }

  // Si c'est un titre long sans être un discours (pas de n° ou thème classique)
  if (title.length > 20) {
    return 'AS';
  }
  
  return title;
}

// Fonction pour obtenir le titre complet (pour les cartes)
export function getFullTitle(title: string): string {
  if (!title) return '';
  const normTitle = normalize(title);

  // Vérifier si c'est un code d'assemblée
  const codeEntry = Object.entries(ASSEMBLY_TITLES).find(
    ([code]) => normalize(code) === normTitle
  );
  if (codeEntry) return codeEntry[1].full;
  
  // Si c'est un code mais pas dans notre liste, essayer de nettoyer
  if (/^[A-Z]{4,}\s/.test(title)) {
    return title.replace(/^[A-Z]{4,}\s/, '').trim();
  }

  // Sinon retourner le titre tel quel
  return title;
}

// Fonction pour vérifier si c'est une assemblée spéciale
export function isAssembly(title: string): boolean {
  if (!title) return false;
  const normTitle = normalize(title);
  
  // Match exact ou partiel sur les titres connus
  const isMatch = !!ASSEMBLY_TITLES[title as keyof typeof ASSEMBLY_TITLES] || 
         Object.values(ASSEMBLY_TITLES).some(a => normalize(a.full) === normTitle);
  
  if (isMatch) return true;

  // Détection intelligente large
  const lowerTitle = title.toLowerCase();
  const keywords = ['asenbleia', 'assembleia', 'superintendente', 'circuito', 'betel', 'filial', 'visita', 'circulo'];
  const hasKeyword = keywords.some(k => lowerTitle.includes(k));
  const isLong = title.length > 20;
  const hasMultipleCaps = /^[A-Z]{3,}/.test(title);

  const result = hasKeyword || (isLong && !title.includes('n°')) || hasMultipleCaps;
  
  if (result) {
    console.log(`🔍 Détection AS pour: "${title}"`);
  }
  
  return result;
}
