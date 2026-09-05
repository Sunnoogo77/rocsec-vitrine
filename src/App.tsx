import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import Accueil from './routes/Accueil';
import Nehemie from './routes/Nehemie';
import GeneseLayout from './routes/Genese/GeneseLayout';
import Sommaire from './routes/Genese/Sommaire';
import Presentation from './routes/Genese/Presentation';
import Naissance from './routes/Genese/Naissance';
import Mission from './routes/Genese/Mission';
import Branham from './routes/Genese/Branham';
import Actes from './routes/Genese/Actes';
import Offices from './routes/Genese/Offices';
import Services from './routes/Genese/Services';
import Marseille from './routes/Genese/Marseille';
import ReunionJeunes2005 from './routes/Genese/ReunionJeunes2005';
import EgliseLayout from './routes/Eglise/EgliseLayout';
import CetteSemaine from './routes/Eglise/CetteSemaine';
import Cultes from './routes/Eglise/Cultes';
import CultesWatch from './routes/Eglise/CultesWatch';
import Cantiques from './routes/Eglise/Cantiques';
import CantiquesWatch from './routes/Eglise/CantiquesWatch';
import Annonces from './routes/Eglise/Annonces';
import AnnonceDetail from './routes/Eglise/AnnonceDetail';
import Temoignages from './routes/Eglise/Temoignages';
import NotFound from './routes/NotFound';
import DesignSystem from './routes/DesignSystem';

/**
 * basename : Vite expose le base path via import.meta.env.BASE_URL
 * (toujours terminé par '/'). React Router attend un basename SANS
 * trailing slash, sauf '/'. On gère les deux cas.
 */
const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search, hash]);

  return null;
}

/**
 * Conteneur racine — useLocation impossible directement dans App car
 * BrowserRouter doit être un parent. Cette indirection nous laisse
 * masquer Header/Footer pour la page dédiée de visualisation des
 * prédications (route /eglise/cultes/watch/:id).
 */
function Shell() {
  const { pathname } = useLocation();
  /* Pages "watch" dédiées (lecteur immersif sans header/footer global) :
     - /eglise/cultes/watch/:id
     - /eglise/cantiques/watch/:slug (mode cantique OU mode session) */
  const isWatchPage =
    pathname.startsWith('/eglise/cultes/watch/') ||
    pathname.startsWith('/eglise/cantiques/watch/');

  return (
    <>
      <ScrollToTop />
      {!isWatchPage && <Header />}
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/nehemie" element={<Nehemie />} />

        {/* Genèse — sommaire + 7 piliers + 2 événements marquants */}
        <Route path="/genese" element={<GeneseLayout />}>
          <Route index element={<Sommaire />} />
          <Route path="presentation" element={<Presentation />} />
          <Route path="naissance" element={<Naissance />} />
          <Route path="mission" element={<Mission />} />
          <Route path="branham" element={<Branham />} />
          <Route path="actes-du-saint-esprit" element={<Actes />} />
          <Route path="offices" element={<Offices />} />
          <Route path="services" element={<Services />} />
          <Route path="marseille" element={<Marseille />} />
          <Route path="reunion-jeunes-2005" element={<ReunionJeunes2005 />} />
        </Route>

        {/* Redirection legacy : /histoire → /genese */}
        <Route path="/histoire" element={<Navigate to="/genese" replace />} />

        <Route path="/eglise" element={<EgliseLayout />}>
          <Route index element={<CetteSemaine />} />
          <Route path="cultes" element={<Cultes />} />
          <Route path="cantiques" element={<Cantiques />} />
          <Route path="annonces" element={<Annonces />} />
          <Route path="annonces/:id" element={<AnnonceDetail />} />
          <Route path="temoignages" element={<Temoignages />} />
        </Route>

        {/* Page DÉDIÉE de visualisation des prédications, hors EgliseLayout
            pour ne pas hériter de la subnav. Header global est masqué via
            Shell. Topbar custom et footer absent : focus total sur la vidéo. */}
        <Route path="/eglise/cultes/watch/:id" element={<CultesWatch />} />

        {/* Pages DÉDIÉES de lecture/navigation des cantiques, hors
            EgliseLayout. Trois modes pris en charge par CantiquesWatch :
            - /hymnaire/:famille → mini-bibliothèque scopée (recueil,
              spéciaux ou service de chant) avec search + grille.
            - /:slug             → cantique seul (vidéo + paroles).
            - /:slug = "session-…" → session (vidéo + index + paroles). */}
        <Route path="/eglise/cantiques/watch/hymnaire/:famille" element={<CantiquesWatch />} />
        <Route path="/eglise/cantiques/watch/:slug" element={<CantiquesWatch />} />

        <Route path="/design-system" element={<DesignSystem />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isWatchPage && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <Shell />
    </BrowserRouter>
  );
}
