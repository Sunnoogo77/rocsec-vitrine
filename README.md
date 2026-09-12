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

Les rewrites SPA et les en-têtes de sécurité sont fournis dans `render.yaml`. `VITE_API_BASE_URL` doit être l’URL HTTPS de l’API se terminant par `/api/v1`.

La vitrine requiert également une vraie `VITE_HCAPTCHA_SITEKEY`. Sans clé le formulaire de témoignage reste désactivé.

Les instructions complètes Render, comptes, domaines, sauvegardes et retour arrière sont dans `rocsec-back/docs/DEPLOIEMENT.md` (dépôt privé). Le cycle habituel est une PR vers `develop`, puis une promotion vers `main` après recette. Pour cette mise en ligne, le propriétaire a autorisé la promotion directe de `main` pendant le blocage CI.

## Mise en ligne de rs-tab.org — 12 septembre 2026

Le fichier `render.yaml` crée uniquement le Static Site de production depuis `main`, avec déploiements manuels (`autoDeployTrigger: off`) pendant le blocage GitHub Actions. Build : `node scripts/render-build.mjs` ; publication : `dist` ; aucune Start Command. Définir `SKIP_INSTALL_DEPS=true` : le script installe lui-même les dépendances de build verrouillées.

Les instructions actuelles pour les trois services, les DNS OVH, Neon, R2 et le premier administrateur sont dans le dépôt backend privé : [guide de déploiement](https://github.com/Sunnoogo77/rocsec-back/blob/main/docs/DEPLOIEMENT.md) et [budget](https://github.com/Sunnoogo77/rocsec-back/blob/main/docs/BUDGET-HEBERGEMENT.md).

## Correction du lecteur YouTube

Pour le Static Site déjà configuré manuellement dans Render :

1. Ouvrir **rocsec-vitrine → Headers → Content-Security-Policy** (Request Path `/*`).
2. Remplacer sa valeur par l’unique ligne de [security/render-csp.txt](security/render-csp.txt), puis **Save Changes**. Cette valeur correspond à `render.yaml` et autorise les scripts officiels du lecteur YouTube.
3. **Manual Deploy → Deploy latest commit** depuis `main`, puis recharger la prédication.

Les autres en-têtes et la règle de réécriture restent ceux de `render.yaml`. Modifier ce fichier dans Git ne met pas à jour un service Render créé manuellement.

Le lecteur conserve les commandes natives YouTube, accessibles aussi pendant les annonces. Une iframe reste disponible si l’API JavaScript échoue ; les timecodes de début/fin restent dans son URL, mais la synchronisation des paroles et l’enchaînement automatique nécessitent le chargement de cette API. En cas d’erreur, utiliser **Réessayer** ou **Ouvrir sur YouTube**. YouTube gère les publicités : le backend ne les supprime pas ([aide officielle](https://support.google.com/youtube/answer/132596?hl=fr)).

Les tests navigateur utilisent maintenant le build de production et sa CSP, avec les réponses de l’API du site et du lecteur simulées. Ils vérifient notamment les clics dans l’iframe, le mini-lecteur, les erreurs et les timecodes des cantiques. `npm run preview` applique la CSP définie dans `render.yaml`.
