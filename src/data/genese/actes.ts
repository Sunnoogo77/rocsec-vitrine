import type { GenesePage } from '../../types';

/* ============================================================
   GENÈSE — § Actes du Saint-Esprit
   Sources :
     - RST_archives/Actes-du-Saint-Esprit.txt (publié le 2 novembre 2005 par Pasteur)
     - RST_archives/Témoignages-suite.txt (publié le 8 novembre 2005 par Pasteur)
   Retranscription intégrale — aucun changement de texte.
   ============================================================ */
export const actes: GenesePage = {
  id: 'actes',
  slug: 'actes-du-saint-esprit',
  titre: 'Actes du Saint-Esprit',
  eyebrow: 'Genèse · § V',
  sousTitre: "Signes, prodiges et guérisons au sein de l'assemblée.",
  publieLe: '2005-11-02',
  blocs: [
    {
      kind: 'pull',
      content:
        "Louez l'Eternel, invoquez Son saint Nom ! Faites connaître parmi les peuples Ses haut faits !",
      reference: 'Ps 105.1',
    },
    {
      kind: 'bibleRef',
      reference: 'Ps. 103.3',
      text: "C'est Lui qui pardonne toutes tes iniquités, qui guérit toutes tes maladies.",
    },
    {
      kind: 'bibleRef',
      reference: 'Marc 16.20',
      text: "Ils s’en allèrent prêcher partout. Le Seigneur travaillait avec eux, et confirmait la parole par les miracles qui l’accompagnaient.",
    },
    {
      kind: 'quote',
      content:
        "Mais il y a aussi un autre fait : C'est que le prophète du dernier âge doit apporter un message de Dieu, un message qui précédera la seconde venue du Seigneur, car c'est son message qui ramenèra les coeurs des enfants aux pères de la pentecôte, et la Restauration de la Parole sera accompagnée du retablissement de la puissance.",
      source: "William M. Branham · Exposé de 7 âges de l'Eglise p. 354",
    },
    {
      kind: 'quote',
      content:
        "Je pensais qu'étant ici deux fois aujourd'hui, il faudrait que nous consacrions un service à la prière pour les malades. je crois dans la guérison des malades. Je crois que c'est un commandement de la Bible. Nous ne pouvons pas prêcher le plein évangile sans inclure cela.",
      source: "William M. Branham · La foi parfaite, 25 . 08 . 1965",
    },
    {
      kind: 'heading',
      level: 2,
      content: "Quelques exploits accomplis au sein de l'assemblée",
    },
    {
      kind: 'paragraph',
      content:
        "Cette page est consacrée à quelques exploits que Jésus-Christ a accomplis par la main de son serviteur, le pasteur Robert NDAYE. Notre Seigneur a réalisé beaucoup de signes, de prodiges et de guérisons au sein de l’église Roc Séculaire Tabernacle. Ils se comptent par centaines et nous ne saurons pas tous les énumérer. Nous avons néanmoins le plaisir de vous proposer quelques uns qui, nous espérons, vous confirmeront que Jésus-Christ vit et \"qu’Il est le même hier, aujourd’hui et éternellement\". C’est aussi une main tendue à tous les malades, affligés et désespérés pour la guérison de leur âme et de leur corps. Si notre Dieu l’a fait pour l’un, il peut aussi le faire pour toi !",
    },
    {
      kind: 'list',
      items: [
        { auteur: 'Naomi FRANCOIS', recit: "La puissance de la prière offerte par le révérend Ndaye a pris le contre-pied d'une amniocentèse désastreuse" },
        { auteur: 'Marie-G. CINEUS', recit: "Délivrée de l’allergie par la prière" },
        { auteur: 'Sorel FRANCHETTE', recit: "Délivrée d’une malade dite « mouche volante »" },
        { auteur: 'Marie VICTOIRE', recit: "Guérie de douleurs dentaires." },
        { auteur: 'Rachel MBUYI', recit: "Une proche parente de la sœur Mbuyi Rachel guérie de l’esprit de folie…" },
        { auteur: 'Mirlène FRANCOIS', recit: "Arrachée des affres de la mort" },
        { auteur: 'Rachèle OMBA', recit: "Délivrée des hémorroïdes" },
        { auteur: 'Moïse MPUTU', recit: "Guéri des troubles de respiration sur base de la foi de son père Pascal Mputu" },
        { auteur: 'Soeur GEREOU', recit: "Une femme guérie du sida après s’être fait appliquer un linge" },
        { auteur: 'Nelly YANGALA', recit: "Guérie de l'hémiplégie faciale au moyen de la prière avec onction d'huile" },
        { auteur: "Delphine N'DOSETA", recit: "Son couple sauvé, sa maternité retablie" },
        { auteur: 'Miracia DUROSIER', recit: "Guérie d'une douleur au bras et jouissant du plein salut" },
        { auteur: 'Josiane SOUIBKI', recit: "En Jésus-Christ il n'y a que des solutions" },
        { auteur: 'Marie DIKOBO', recit: "Débarrassée d’un souffle au cœur lors d’une ligne de prière avec onction d'huile" },
        { auteur: 'Liliane LOMINGO', recit: "Liberée de troubles de comportements" },
        { auteur: 'Liliane JUDOR', recit: "Un fibrome miraculeusement vaincu disparaît après la prière" },
        { auteur: 'Laïty GUBLIN', recit: "L’eczéma aussi s’est incliné devant la prière faite au nom du Seigneur Jésus-Christ" },
        { auteur: 'Vertueuse JASMIN', recit: "Délivrée d'horribles démangeaisons d'origine mystérieuse" },
        { auteur: 'Isabelle NSINGI', recit: "Un baptême surnaturel" },
        { auteur: 'Espérence SALDANHA', recit: "La force de la prière" },
        { auteur: 'Danielle EL GHALLAOUI', recit: "La sœur El Ghallaoui guérie d’un problème encéphalique et de la tension." },
        { auteur: 'Piervi MITCHOUMANOU', recit: "Puis bébé Piervi vint… Après plus de 10 ans d'attente" },
        { auteur: 'Florence AKAMBO', recit: "Rafraîchie par l'onction du Saint-Esprit, la sœur Florence Akambo fut guidée …" },
        { auteur: 'Sylvie BEMBA', recit: "Les palpitations cardiaques causées par l'hypertension…" },
        { auteur: 'GUEREOU née Mélie DJIBRIL', recit: "Liberée d'un cancer de l'utérus" },
        { auteur: 'Sorel FRANCHETTE', recit: "Guérie d'un mal de dos" },
        { auteur: 'FAMILLE SUPREME', recit: "La prière change les situations" },
        { auteur: 'FAMILLE MBO', recit: "Guérison d'un couple déclaré stérile" },
        { auteur: 'Nestor BODY', recit: "Le pronostic d'un dentiste battu en brêche par la guérison divine" },
        { auteur: 'KAKESA Patience', recit: "Guérie pour adorer le Seigneur" },
        { auteur: 'Miracia DUROSIER', recit: "Un homme guéri du cancer à la jambe sur base de la foi de sa parente" },
        { auteur: 'Guérie du Sida', recit: "Une femme guérie du sida après s’être fait appliquer un linge" },
        { auteur: "Delphine N'DOSETA", recit: "La stérilité aggravée par le diabète a été vaincue chez les Ndoseta" },
        { auteur: 'Claudy CINEUS', recit: "Enveloppé par l'ombre du Saint-Esprit qui rempli le sanctuaire" },
        { auteur: 'Sylvie BEMBA', recit: "La prière contre la tumeur" },
        { auteur: 'Mirlène FRANCOIS', recit: "Une Embolie pulmonaire vaincue par la prière" },
        { auteur: 'Par Rachel MBUYI', recit: "Guérison d'une folle" },
        { auteur: 'Esther FALAYRAS', recit: "Son couple sauvé" },
        { auteur: 'Virginie MITSOUMANOU', recit: "Les démons devoilés…" },
        { auteur: 'Pierre Gilbert LEONARD', recit: "Délivrée des esprits de suicide" },
      ],
    },
  ],
};
