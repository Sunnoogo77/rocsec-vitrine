/**
 * Fetcher ProjetNehemie. Le backend renvoie le singleton enrichi avec ses 3
 * sous-collections (`batisseurs`, `montants`, `modes_don`). La vitrine attend
 * `modesDon` (camelCase) et certains champs aplatis.
 */

import type { Batisseur, ModeDon, MontantContribution, ProjetNehemie } from '../types';
import { apiGet } from './client';

interface RawBatisseur {
  id: string;
  initiales: string;
  engagement: string;
  ordre: number;
  actif: boolean;
}

interface RawMontant {
  id: string;
  valeur: string | null; // decimal as string
  label_fr: string;
  label_en: string;
  titre_fr: string;
  titre_en: string;
  description_fr: string;
  description_en: string;
  ordre: number;
  actif: boolean;
}

interface RawModeDon {
  id: string;
  code: string;
  icone: string;
  titre_fr: string;
  titre_en: string;
  instructions_fr: string;
  instructions_en: string;
  ordre: number;
  actif: boolean;
}

interface RawProjetNehemie {
  id: number;
  objectif: string;
  collecte: string;
  devise: string;
  mise_a_jour: string;
  pourcentage: number;
  batisseurs: RawBatisseur[];
  montants: RawMontant[];
  modes_don: RawModeDon[];
}

function toBatisseur(raw: RawBatisseur): Batisseur {
  return { initiales: raw.initiales, engagement: raw.engagement };
}

function toMontant(raw: RawMontant, lang: 'fr' | 'en'): MontantContribution {
  return {
    id: raw.id,
    valeur: raw.valeur ? Number(raw.valeur) : null,
    label: lang === 'en' && raw.label_en ? raw.label_en : raw.label_fr,
    titre: lang === 'en' && raw.titre_en ? raw.titre_en : raw.titre_fr,
    description:
      lang === 'en' && raw.description_en ? raw.description_en : raw.description_fr,
  };
}

function toModeDon(raw: RawModeDon, lang: 'fr' | 'en'): ModeDon {
  return {
    id: raw.code || raw.id,
    icone: raw.icone,
    titre: lang === 'en' && raw.titre_en ? raw.titre_en : raw.titre_fr,
    instructions:
      lang === 'en' && raw.instructions_en
        ? raw.instructions_en
        : raw.instructions_fr,
  };
}

export async function fetchProjetNehemie(
  opts: { lang?: 'fr' | 'en'; signal?: AbortSignal } = {},
): Promise<ProjetNehemie> {
  const lang = opts.lang ?? 'fr';
  const raw = await apiGet<RawProjetNehemie>('/nehemie/', { signal: opts.signal });
  return {
    objectif: Number(raw.objectif),
    collecte: Number(raw.collecte),
    devise: raw.devise,
    miseAJour: raw.mise_a_jour,
    batisseurs: (raw.batisseurs ?? []).map(toBatisseur),
    montants: (raw.montants ?? []).map((m) => toMontant(m, lang)),
    modesDon: (raw.modes_don ?? []).map((m) => toModeDon(m, lang)),
  };
}
