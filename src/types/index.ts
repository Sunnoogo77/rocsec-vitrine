/* ============================================================
   RST — Types métier partagés
   Ces interfaces sont le contrat futur des serializers Django.
   Ne pas modifier les noms de champs sans coordination back-end.
   ============================================================ */

/* ----------------------------------------------------------
   Rendez-vous (horaires de cultes)
---------------------------------------------------------- */
export type JourCulte = 'mercredi' | 'dimanche' | 'vendredi';

export interface RendezVous {
  id: string;
  jour: JourCulte;
  titre: string;        // "Culte du mercredi" | "Culte du dimanche" | "Réunion de prière"
  heureDebut: string;   // "19H00"
  heureFin: string;     // "21H00"
  description: string;
}

/* ----------------------------------------------------------
   Sermons / Prédications
---------------------------------------------------------- */
export interface PassageBiblique {
  reference: string;  // "Matthieu 7.24-25"
  texte: string;
}

export interface CitationBranham {
  source: string;  // "63-0728"
  texte: string;
}

export interface PlanItem {
  numero: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  titre: string;
  description: string;
}

/**
 * Catégorisation éditoriale d'un sermon. Sert aux filtres de la
 * bibliothèque des cultes. La liste est stable mais peut être
 * étendue plus tard sans casser : un sermon non typé tombe en
 * "culte-dimanche" par défaut côté UI.
 */
export type TypeCulte =
  | 'culte-dimanche'
  | 'culte-mercredi'
  | 'reunion-priere'
  | 'etude-doctrinale'
  | 'convention'
  | 'evenement-special'
  | 'bapteme'
  | 'sainte-cene'
  | 'q-et-r';

export interface Sermon {
  id: string;
  titre: string;
  titleEm?: string;    // partie italique en 2e ligne du h2 fiche : "ne tombe pas."
  serie: string;       // "L'Ordre de l'Église" | "Étude libre"
  numeroSerie?: number; // 14 — absent pour Étude libre
  date: string;        // ISO "2026-04-26"
  heure: string;       // "09H00"
  predicateur: string; // "Rev. Robert Ndaye M."
  duree?: string;      // "1H 28MIN"
  typeCulte?: TypeCulte; // catégorie éditoriale pour les filtres
  thumbnail?: string;    // override miniature, sinon dérivée auto de videoUrl
  description?: string;
  videoUrl?: string;
  audioUrl?: string;
  passages: PassageBiblique[];
  citationsBranham: CitationBranham[];
  plan: PlanItem[];
}

/* ----------------------------------------------------------
   Cantiques / Hymnaire
---------------------------------------------------------- */

/**
 * Trois grandes familles de cantiques :
 * - recueil   : cantiques du livre traditionnel de l'assemblée,
 *               numérotés, paroles complètes saisies à la main.
 * - special   : cantiques particuliers (solo, featured, composés
 *               ici), enregistrés en studio ou live.
 * - adoration : cantiques chantés DANS une session d'adoration et
 *               de louange (objet SessionAdoration ci-dessous).
 *               Le cantique est référencé via l'occurrence qui
 *               porte le startSec dans la session.
 */
export type CantiqueFamille = 'recueil' | 'special' | 'adoration';

export interface VerseBlock {
  type: 'verse' | 'refrain' | 'pont';
  label: string;   // '1', '2', '3', '℟', 'Pont'
  lines: string[];
}

/**
 * Une occurrence est UN passage où le cantique a été chanté dans
 * UNE vidéo donnée. Un même cantique peut avoir plusieurs occurrences
 * (chanté plusieurs fois, dans des cultes différents, par des
 * conducteurs différents). Le startSec permet à la page lecteur de
 * démarrer la vidéo YouTube pile au moment où le cantique commence.
 */
export interface CantiqueOccurrence {
  id: string;
  videoUrl: string;          // URL YouTube
  /** Démarrage du cantique dans la vidéo, en secondes. Si absent,
   *  on lance la vidéo depuis le début. */
  startSec?: number;
  /** Fin du cantique. Indicatif (le player s'arrête à endSec si
   *  défini). */
  endSec?: number;
  interpretes: string[];     // ["Fr. Jules Kayembe", "Past. Robert Ndaye"]
  contexte?: string;         // "Live au culte du 24 . 07 . 2022"
  dateEvenement?: string;    // ISO "2022-07-24"
  /** Si le cantique apparait dans une SessionAdoration, on référence
   *  son slug ici pour proposer la session complète à l'utilisateur. */
  sessionId?: string;
}

/** Événement liturgique regroupant plusieurs cantiques (Veillée, Pâques…). */
export interface EvenementCantique {
  id: string;
  nom: string;                 // localisé selon la langue de l'appel API
  date?: string;               // ISO date, optionnel
  close?: boolean;
}

/** Groupe de personnes interprète (« Chœurs »). Affichage simple côté vitrine. */
export interface GroupePersonnesLite {
  id: string;
  nom: string;
}

/** Sous-cantique d'un cantique medley : nom + bornes start/end (secondes). */
export interface CantiquePassage {
  ordre: number;
  titre: string;
  startSec: number;
  endSec?: number;
  interpretesLibelle?: string;
  /** Paroles propres à ce passage, affichées automatiquement quand la
   *  vidéo atteint sa borne temporelle (onglet « Paroles » du lecteur). */
  lyrics?: VerseBlock[];
}

export interface Cantique {
  id: string;
  slug?: string;               // pour URL /eglise/cantiques/watch/{slug}
  numero: string;              // "47", "309" — sans préfixe (recueil) ou ID interne
  /** Numéro dans le recueil traditionnel. Permet le tri et la
   *  recherche par numéro de page. Uniquement pour famille=recueil. */
  numeroRecueil?: number;
  titre: string;
  titleEm?: string;            // partie italique du titre en detail h2
  famille: CantiqueFamille;
  /** Événement liturgique auquel le cantique appartient (Veillée, Pâques…).
   *  Absent si le cantique n'est rattaché à aucun événement. */
  evenement?: EvenementCantique;
  /** Groupes interprètes (ex. « Chœurs »), distincts des Personne individuelles. */
  groupesInterpretes?: GroupePersonnesLite[];
  /** Lead vocal nommé (si renseigné, mis en valeur côté UI). */
  leadInterprete?: string;
  /** True si la vidéo enchaîne plusieurs sous-cantiques (medley). */
  estMedley?: boolean;
  /** Liste des passages d'un medley, dans l'ordre chronologique. */
  passages?: CantiquePassage[];
  /** Libellé d'auteur principal pour les cartes (override possible
   *  via detailBy). Conservé pour rétrocompatibilité. */
  solisteOuChoeur: string;
  detailBy?: string;           // surcharge du sous-titre en fiche détail
  dateEnregistrement?: string; // "2024" (année)
  recordedAt?: string;         // "13 . 04 . 2026" (date affichage)
  duration?: string;           // "5MIN 42"
  recordingType?: 'studio' | 'culte' | 'live';
  /** URL "officielle" du cantique. Conservée pour rétrocompatibilité
   *  avec la page Cantiques.tsx existante. La nouvelle page lecteur
   *  utilisera plutôt occurrences[0]. */
  videoUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  estVedette?: boolean;        // carte 2×2 dans la grille
  lyrics?: VerseBlock[];
  /** Liste des vidéos où ce cantique a été chanté. Vide pour les
   *  cantiques du recueil dont on n'a pas encore de captation.
   *  Plusieurs entrées si chanté dans plusieurs cultes ou sessions. */
  occurrences?: CantiqueOccurrence[];
}

/**
 * Une session d'Adoration & Louange : longue vidéo (30-40 min) qui
 * contient une suite de cantiques chantés. L'index cantiquesContenus
 * permet à l'utilisateur de cliquer un cantique et de partir au bon
 * moment dans la vidéo.
 */
export interface SessionAdoration {
  id: string;
  slug: string;
  titre: string;               // "Une heure dans Sa présence"
  date: string;                // ISO "2024-08-15"
  videoUrl: string;
  dureeMinutes?: number;
  evenement?: string;          // "Convention internationale 2024"
  thumbnail?: string;
  interpretes: string[];       // conducteurs / solistes principaux
  /** Index chronologique des cantiques contenus dans la session,
   *  avec leur start/end en secondes. Le cantiqueId pointe vers un
   *  Cantique de famille=recueil ou famille=special. Permet la
   *  navigation directe vers un cantique précis dans la session. */
  cantiquesContenus?: Array<{
    cantiqueId: string;
    titre: string;             // dénormalisé pour affichage rapide
    startSec: number;
    endSec?: number;
  }>;
}

/* ----------------------------------------------------------
   Annonces / Bulletin
---------------------------------------------------------- */
export type AnnonceStatut = 'a-venir' | 'aujourd-hui' | 'passee';
export type AnnonceType = 'reunion' | 'voyage' | 'sortie' | 'exceptionnelle';

export type AnnonceContentBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'image'; src: string; alt?: string; size?: 'small' | 'medium' | 'wide' }
  | { kind: 'video'; url: string; caption?: string };

export interface Annonce {
  id: string;
  titre: string;
  titreEm?: string;          // partie italique du titre featured : "à Marseille."
  statut: AnnonceStatut;
  type: AnnonceType;
  sousType?: string;          // sous-catégorie : "Jeunesse", "Famille", "Culte", "Prière", "Mission"
  sousTypeLabel?: string;     // surcharge du span ann-type complet : "Réunion · Exceptionnelle"
  date: string;               // ISO "2026-05-10"
  dateFin?: string;           // ISO "2026-05-25" — réunions sur plusieurs jours
  dl?: string;                // abréviation jour+mois : "SAM. MAI" (surcharge d'affichage)
  dateDisplay?: string;       // surcharge globale : "DATE À VENIR", "ÉTÉ 2026"
  lieu: string;
  description: string;
  image?: string;
  affiche?: string;           // URL de l'affiche officielle (poster)
  contentBlocks?: AnnonceContentBlock[]; // compte-rendu — paragraphes + images intercalées (annonces passées)
  estPhare?: boolean;
  featuredEyebrow?: string;   // "Annonce phare · Été 2026"
  featuredMeta?: Array<{ lbl: string; val: string }>;
  ctaUrl?: string;
}

/* ----------------------------------------------------------
   Témoignages
---------------------------------------------------------- */
export type TemoignageType = 'citation' | 'illustre' | 'recit';

export interface TemoignageParagraph {
  kind: 'lede' | 'p' | 'pull';
  text: string;
}

export interface TemoignageDetailData {
  tag: string;           // "Récit · 14 . 03 . 2026 · 7 min de lecture"
  byline: string;        // "Frère R. · 41 ans · baptisé le 28 . 09 . 2025 · publié avec son accord"
  readingMinutes: number;
  paragraphs: TemoignageParagraph[];
  versetRef: string;     // "Matthieu 7 . 24"
  versetText: string;    // "Quiconque entend ces paroles..."
}

/** Photo jointe par le témoin lors de la soumission publique. */
export interface TemoignagePhoto {
  id: string;
  url: string;
  legende: string;
}

export interface Temoignage {
  id: string;
  auteur: string;        // anonymisé : "— une sœur · Île-de-France"
  type: TemoignageType;
  accentRouge?: boolean; // applique le filet rouge + guillemet rouge (la classe "accent-blue" du wireframe)
  cite: string;          // attribution formatée pour <cite>
  quoteText?: string;    // texte du <q> pour les citations courtes
  eyebrow?: string;      // "Récit · 14 . 03 . 2026" pour story/illu
  titre?: string;        // <h3> pour story/illu
  corps?: string;        // corps de texte pour story/illu
  image?: string;        // image principale (éditoriale OU 1re photo soumise)
  photos?: TemoignagePhoto[]; // photos multiples soumises par le témoin (galerie)
  hasDetail?: boolean;   // affiche "Lire le récit complet →"
  detail?: TemoignageDetailData;
  date: string;
}

/* ----------------------------------------------------------
   Projet Néhémie
---------------------------------------------------------- */
export interface MontantContribution {
  id: string;
  valeur: number | null; // null = "Libre"
  label: string;         // "50 €" | "200 €" | "Libre"
  titre: string;
  description: string;
}

export interface ModeDon {
  id: string;
  icone: string;          // lettre unique dans un cercle
  titre: string;
  instructions: string;
}

export interface Batisseur {
  initiales: string;   // "R.N."
  engagement: string;  // "50 € / mois"
}

export interface ProjetNehemie {
  objectif: number;    // 50000
  collecte: number;    // 12500
  devise: string;      // "€"
  miseAJour: string;   // ISO date
  batisseurs: Batisseur[];
  montants: MontantContribution[];
  modesDon: ModeDon[];
}

/* ----------------------------------------------------------
   Genèse — archives intégrales du blog historique
   Bloc générique reproduisant fidèlement la mise en page d'origine.
---------------------------------------------------------- */
export type GeneseBlockKind =
  | 'paragraph'   // paragraphe ordinaire
  | 'heading'     // intertitre (level 2 ou 3)
  | 'quote'       // citation (Branham, prière, autre)
  | 'bibleRef'    // référence biblique avec texte
  | 'image'       // illustration insérée dans le flux
  | 'list'        // liste de témoignages historiques
  | 'pull'        // citation pull-quote forte
  | 'signature';  // signature de fin (« — Robert Ndaye »)

export interface GeneseTemoignageItem {
  auteur: string;  // « Naomi FRANCOIS »
  recit: string;   // « La puissance de la prière offerte par le révérend Ndaye… »
}

export interface GeneseBlock {
  kind: GeneseBlockKind;
  content?: string;          // texte principal (paragraph, heading, quote, signature)
  level?: 2 | 3;             // pour heading
  source?: string;           // attribution d'une citation
  reference?: string;        // pour bibleRef ou pull (référence)
  text?: string;             // pour bibleRef (corps du verset)
  src?: string;              // pour image (chemin /genese/...)
  alt?: string;              // pour image
  caption?: string;          // pour image
  items?: GeneseTemoignageItem[]; // pour list (Actes du Saint-Esprit)
}

export interface GenesePage {
  id: string;                // 'presentation', 'naissance', etc.
  slug: string;              // identique à id pour les routes
  titre: string;             // « Présentation »
  titreEm?: string;          // partie italique du titre éditorial
  eyebrow: string;           // « § II · Naissance », « Genèse · Mémoire »
  sousTitre?: string;        // sous-titre éditorial sous le H1
  publieLe: string;          // ISO « 2005-11-10 » — date archive d'origine
  blocs: GeneseBlock[];
}

/* ----------------------------------------------------------
   Images de la semaine (galerie)
---------------------------------------------------------- */
export interface ImageSemaine {
  id: string;
  src: string;
  caption: string;
  estGrande?: boolean; // prend 2× dans la grille asymétrique
}

/* ----------------------------------------------------------
   Vlog hebdomadaire (Cette semaine)
---------------------------------------------------------- */
export interface VlogSemaine {
  date: string;           // ISO "2026-04-26"
  titreMessage: string;
  titreSuffix?: string;   // dernier mot en italique : "pas."
  pitchMessage: string;
  serie: string;
  predicateur: string;    // "Rev. Robert Ndaye M."
  heureCulte: string;     // "09H00"
  verset: {
    reference: string;    // "MATTHIEU 7 · 24"
    texte: string;
  };
  poster?: string;
  replayUrl?: string;
  filDuMessage: {
    paragraphe1: string;
    paragraphe2: string;
    versets: string[];
  };
  cantiqueSemaine: {
    titre: string;
    soliste: string;
    audioUrl?: string;
    videoUrl?: string;
    vuesCount?: string;          // "12 480 vues"
    dateEnregistrement?: string; // "13.04.2026"
  };
  temoignageSemaine: {
    auteur: string;
    texte: string;
  };
}
