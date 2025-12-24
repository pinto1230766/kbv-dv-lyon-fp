
import { Visit, Speaker, SyncConfig } from '../types';

const API_KEY = (import.meta as any).env.VITE_GOOGLE_SHEETS_API_KEY;

/**
 * Normalise une chaîne pour la recherche : minuscule, sans espaces superflus, sans accents.
 */
export const normalizeString = (str: string) =>
  str ? str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

/**
 * Raccourcit les noms de congrégation spécifiques pour un affichage plus court.
 */
export const shortenCongregationName = (congregation: string): string => {
  if (!congregation) return congregation;

  const normalized = congregation.toLowerCase().trim();

  // Si c'est "asenbleia" ou "assembleia" (avec ou sans accents), afficher "AS"
  if (normalized.includes('asenbleia') || normalized.includes('assembleia') ||
      normalized.includes('asenbléia') || normalized.includes('assembléia')) {
    return 'AS';
  }

  return congregation;
};

const cleanValue = (val: string) => {
    if (!val) return '';
    const v = val.trim();
    // Élimine les erreurs classiques de calcul Sheet et les mentions temporaires
    if (v.match(/^(#N\/A|#REF!|#VALUE!|#NAME\?|TBA|À DÉFINIR|A DEFINIR|NULL|UNDEFINED|#|--|NON RENSEIGNE|NON RENSEIGNÉ)$/i)) return '';
    return v;
};

const toTitleCase = (str: string) => {
  const clean = cleanValue(str);
  if (!clean) return '';
  return clean.replace(/[\r\n]+/g, ' ').toLowerCase().replace(/(?:^|\s|-|'|’)\S/g, (m) => m.toUpperCase());
};

const processRows = (rows: string[][], sheetName: string): { visits: Visit[], newSpeakers: Speaker[] } => {
    if (!rows || rows.length < 2) return { visits: [], newSpeakers: [] };

    let headers: string[] = [];
    let headerRowIndex = -1;
    const REGEX_DATE = /(date|datum|data|dia|jour|day|le)/i;

    for (let i = 0; i < Math.min(rows.length, 30); i++) {
      const cols = rows[i].map(h => normalizeString(h || ''));
      if (cols.some(h => h.match(REGEX_DATE))) {
        headers = cols;
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) return { visits: [], newSpeakers: [] };

    const findIdx = (regexes: RegExp[]) => {
      for (const regex of regexes) {
        const idx = headers.findIndex(h => h && h.match(regex));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const dateIdx = findIdx([REGEX_DATE]);
    const speakerIdx = findIdx([/(orateur|orador|speaker|intervenant|publicateur|nom.*complet|nom)/i]);
    const themeIdx = findIdx([/(theme|thème|sujet|titre|title|discours|talk|tema|téma|assunto)/i]);
    const numIdx = findIdx([/(n°|no\.|num|numero|number)/i]);
    const congIdx = findIdx([/(provenance|origine|origin|kongregason|assembleia|congregation|cong|kong|ass)/i]);
    const timeIdx = findIdx([/(heure|time|hora|h)/i]);
    const phoneIdx = findIdx([/(tel|téléphone|phone|celular|mobile)/i]);

    if (dateIdx === -1) return { visits: [], newSpeakers: [] };

    const visits: Visit[] = [];
    const speakersMap = new Map<string, Speaker>();

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const cols = rows[i];
      if (!cols || cols.length < 2) continue;
      const getVal = (idx: number) => (idx !== -1 && cols[idx]) ? cleanValue(cols[idx]) : '';

      const rawDate = getVal(dateIdx);
      if (!rawDate || rawDate.length < 5) continue;

      let dateObj: Date | null = null;
      const cleanD = rawDate.replace(/\//g, '-').replace(/\./g, '-');
      const parts = cleanD.split('-');
      
      if (parts.length === 3) {
          const p0 = parseInt(parts[0]);
          const p1 = parseInt(parts[1]);
          const p2 = parseInt(parts[2]);
          if (p2 > 1000) dateObj = new Date(p2, p1 - 1, p0);
          else if (p0 > 1000) dateObj = new Date(p0, p1 - 1, p2);
      }
      if (!dateObj || isNaN(dateObj.getTime())) dateObj = new Date(rawDate);
      if (isNaN(dateObj.getTime())) continue;

      let rawTime = getVal(timeIdx);
      let formattedTime = '14:30'; 
      if (rawTime) {
          const cleanT = rawTime.replace(/[hH]/g, ':').replace(/\s/g, '');
          if (cleanT.includes(':')) {
              formattedTime = cleanT;
          } else if (cleanT.match(/^\d{3,4}$/)) {
              formattedTime = cleanT.length === 3 ? `0${cleanT.substring(0,1)}:${cleanT.substring(1)}` : `${cleanT.substring(0,2)}:${cleanT.substring(2)}`;
          }
      }

      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      const isoDate = `${y}-${m}-${d}`;

      const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'short' });
      const monthStr = dateObj.toLocaleDateString('fr-FR', { month: 'short' });

      let speakerName = getVal(speakerIdx);
      if (!speakerName) continue;
      
      speakerName = toTitleCase(speakerName.replace(/^(ir\.|irmon|irm\.|irmão|fr\.|mr\.|frère|brother|sr\.)\s+/i, '').trim());
      if (!speakerName) continue;
      
      let congregation = toTitleCase(getVal(congIdx)) || 'Inconnue';
      const theme = getVal(themeIdx);
      const numRaw = getVal(numIdx);
      const numVal = numRaw ? parseInt(numRaw.match(/\d+/)?.[0] || '0') : undefined;
      const phone = getVal(phoneIdx);

      const visit: Visit = {
        id: `sync-${isoDate}-${normalizeString(speakerName)}`,
        date: isoDate,
        dayName: toTitleCase(dayName) + '.',
        month: toTitleCase(monthStr),
        year: y.toString(),
        time: formattedTime,
        congregation,
        speakerName,
        speakerId: normalizeString(speakerName),
        discoursNumber: numVal,
        discoursTitle: theme.replace(/[\r\n]+/g, ' ').trim(),
        status: dateObj < new Date() ? 'Confirmed' : 'Pending',
        meetingType: 'Physique'
      };
      visits.push(visit);

      if (!speakersMap.has(visit.speakerId!)) {
        speakersMap.set(visit.speakerId!, {
          id: visit.speakerId!,
          name: speakerName,
          congregation,
          phone: phone || undefined,
          status: 'Actif',
          initials: speakerName.split(' ').map(n => n[0]).join('').toUpperCase()
        });
      }
    }
    return { visits, newSpeakers: Array.from(speakersMap.values()) };
};

export const fetchSheetData = async (config: SyncConfig): Promise<{ visits: Visit[], newSpeakers: Speaker[], logs: string[], success: boolean }> => {
  if (!config.sheetId) return { visits: [], newSpeakers: [], logs: ["ID Document manquant"], success: false };
  if (!API_KEY) return { visits: [], newSpeakers: [], logs: ["Clé API Google Sheets manquante. Vérifiez votre configuration .env"], success: false };
  try {
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${config.sheetId}?key=${API_KEY}`;
    const metaRes = await fetch(metaUrl);
    if (!metaRes.ok) throw new Error(`Erreur API: ${metaRes.status}`);
    const metaData = await metaRes.json();
    const sheetTitles = metaData.sheets.map((s: any) => s.properties.title);
    
    let allVisits: Visit[] = [];
    let allSpeakersMap = new Map<string, Speaker>();
    const ranges = sheetTitles.map((title: string) => `'${title.replace(/'/g, "''")}'!A1:Z1000`);
    const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${config.sheetId}/values:batchGet?ranges=${ranges.map(encodeURIComponent).join('&ranges=')}&key=${API_KEY}&valueRenderOption=FORMATTED_VALUE`;
    
    const valuesRes = await fetch(valuesUrl);
    if (!valuesRes.ok) throw new Error("Erreur lecture données");
    const valuesData = await valuesRes.json();
    
    valuesData.valueRanges.forEach((range: any, index: number) => {
        if (range.values) {
            const { visits, newSpeakers } = processRows(range.values, sheetTitles[index]);
            allVisits = [...allVisits, ...visits];
            newSpeakers.forEach(s => allSpeakersMap.set(s.id, s));
        }
    });

    const uniqueVisitsMap = new Map<string, Visit>();
    allVisits.forEach(v => uniqueVisitsMap.set(v.id, v));
    const finalVisits = Array.from(uniqueVisitsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return {
      visits: finalVisits,
      newSpeakers: Array.from(allSpeakersMap.values()),
      logs: [`Synchro réussie: ${finalVisits.length} visites.`],
      success: true
    };
  } catch (e: any) {
    return { visits: [], newSpeakers: [], logs: [e.message], success: false };
  }
};
