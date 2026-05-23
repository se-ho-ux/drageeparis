# Dragée Paris · Site vitrine

Site vitrine artisanal pour **Dragée Paris**, confiseur-artisan en Île-de-France spécialisé dans les dragées et bougies personnalisables.

## Structure du projet

```
drageeparis/
├── index.html               # Accueil (Hero, occasions, produits, artisan, CTA, galerie)
├── dragees.html             # Galerie dragées avec filtre par occasion
├── bougies.html             # Galerie bougies avec parfums
├── personnalisation.html    # Options de personnalisation + formulaire
├── a-propos.html            # Histoire, valeurs, localisation
├── contact.html             # Formulaire de devis complet
├── mentions-legales.html    # Mentions légales & CGV
├── style.css                # Feuille de style principale
├── main.js                  # JavaScript (nav, animations, formulaires, filtre)
├── .gitignore
└── images/
    ├── mariage/             # Photos de dragées pour mariage
    ├── naiss/               # Photos de dragées pour naissance
    ├── bapteme/             # Photos de dragées pour baptême
    ├── anniv/               # Photos de dragées pour anniversaire
    ├── bougies/             # Photos de bougies
    └── artisanat_1.png      # Photo atelier
```

## Technologies

- **HTML5** sémantique (accessibilité WCAG AA)
- **CSS3** pur — variables CSS, Grid, Flexbox, responsive mobile-first
- **JavaScript Vanilla** — aucune dépendance externe
- **Google Fonts** — Cormorant Garamond + Montserrat

## Palette de couleurs

| Nom       | Hex       | Usage                     |
|-----------|-----------|---------------------------|
| Rose      | `#F2D5CE` | Mariage, naissance fille  |
| Sauge     | `#C9D7BC` | Communion, champêtre      |
| Lavande   | `#D9CFE8` | Baptême, douceur          |
| Beurre    | `#F5E9B8` | Fêtes, naissance garçon   |
| Papier    | `#FAF6EF` | Fond principal            |
| Crème     | `#F2EBDC` | Sections alternées        |
| Or chaud  | `#B8975A` | Accent, CTA, liens        |
| Encre     | `#2B2A28` | Texte principal           |

## Déploiement sur GitHub Pages

1. Créer un dépôt sur GitHub (ex : `drageeparis`)
2. Pousser le code :
   ```bash
   git init
   git add .
   git commit -m "feat: site vitrine Dragée Paris"
   git remote add origin https://github.com/votre-compte/drageeparis.git
   git push -u origin main
   ```
3. Dans **Settings → Pages** : choisir `main` / `/ (root)` comme source
4. Le site sera disponible à `https://votre-compte.github.io/drageeparis/`

> Pour un domaine personnalisé (`drageeparis.fr`), ajouter un fichier `CNAME` contenant uniquement `drageeparis.fr` à la racine du projet, puis configurer les DNS chez votre registrar (enregistrements A vers `185.199.108.153` – `185.199.111.153`).

## Fonctionnalités

- Navigation sticky avec fond solide au scroll
- Menu hamburger sur mobile
- Animations fade-in au scroll (IntersectionObserver)
- Lazy loading sur toutes les images galerie
- Filtre galerie dragées par occasion (Mariage / Naissance / Baptême / Anniversaire)
- Formulaire de devis avec validation inline et message de succès
- Upload de fichier d'inspiration (image)
- Newsletter footer
- Responsive : 375px / 768px / 1024px / 1440px
- `prefers-reduced-motion` respecté
- Accessibilité : skip-link, aria-labels, focus-visible, rôles sémantiques

## Personnalisation

- **Coordonnées** : Remplacer `06 01 23 45 67` et `contact@drageeparis.fr` dans tous les fichiers HTML
- **SIRET / infos légales** : Compléter `mentions-legales.html`
- **Instagram** : Remplacer les `href="#"` des liens Instagram par l'URL réelle
- **Images hero** : La page d'accueil utilise `./images/mariage/image17.jpeg` comme fond — remplacer si besoin

## À faire (prochaines étapes)

- [ ] Intégrer un service de formulaire (Formspree, Netlify Forms, EmailJS)
- [ ] Ajouter les vraies coordonnées et SIRET
- [ ] Créer un favicon (`favicon.ico` ou `favicon.svg`)
- [ ] Ajouter des métadonnées Open Graph pour les partages sociaux
- [ ] Connecter le vrai compte Instagram
- [ ] Optimiser les images en WebP
