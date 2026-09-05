# Roc Séculaire — Vitrine publique

Application React/Vite indépendante. Node 22, npm et `package-lock.json` pour des installations reproductibles.

```sh
npm ci
npm run dev
```

Ouvrir `http://127.0.0.1:5173`. Le proxy local `/api` cible le backend sur `127.0.0.1:8765`. Copier `.env.example` si une configuration différente est nécessaire. Les variables `VITE_*` sont publiques dans le bundle ; aucun secret ne doit y figurer.

```sh
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=low
npx playwright install chromium
npm run test:e2e
python3 security/check-inventory.py
```

La CI exécute ces contrôles et Gitleaks sur l’historique. Les tests navigateur couvrent ordinateur et mobile avec des réponses API simulées ; la sécurité des permissions est testée par le backend sur PostgreSQL.

`render.yaml` prépare deux Static Sites : `develop` pour la recette, `main` pour la production. Le déploiement attend la réussite des checks. Les rewrites SPA et les en-têtes de sécurité sont fournis. `VITE_API_BASE_URL` doit être l’URL HTTPS de l’API se terminant par `/api/v1`.

La vitrine requiert également une vraie `VITE_HCAPTCHA_SITEKEY`. Sans clé le formulaire de témoignage reste désactivé.

Les instructions complètes Render, comptes, domaines, sauvegardes et retour arrière sont dans `rocsec-back/docs/DEPLOIEMENT.md` (dépôt privé). Les changements passent par une branche puis une PR vers `develop`, et une promotion vers `main` après recette. Le propriétaire effectue les fusions.
