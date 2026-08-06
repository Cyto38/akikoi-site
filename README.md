# akikoi-site

Site vitrine de **Akikoi** (app « Objets prêtés ») — [akikoi.fr](https://akikoi.fr).

HTML/CSS statique, sans framework, hébergé sur **GitHub Pages**.

## Pages
- `index.html` — accueil FR
- `en/index.html` — accueil EN
- `confidentialite.html` — politique de confidentialité FR (URL Play Console)
- `en/privacy.html` — privacy policy EN

## Design
Sobre, mobile-first, aligné sur l'app : accent `#059669`, fond clair, police système.
Tout le style est dans `styles.css`. Le logo (`assets/logo.png`) est le symbole de l'app.

## Développement
Pages 100 % statiques : ouvrir un fichier `.html` dans le navigateur, ou servir le dossier
(`python -m http.server`). Aucune build.

## Emplacements à compléter avant lancement
- Lien Google Play (bouton actuellement « Bientôt disponible », désactivé) — à synchroniser
  avec la constante `APP_URL` de l'app.
- Captures d'écran dans le hero.
