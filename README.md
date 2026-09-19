# akikoi-site

Site vitrine de **Akikoi** (app « Objets prêtés ») — [akikoi.fr](https://akikoi.fr).

HTML/CSS statique, sans framework, hébergé sur **GitHub Pages**.

## Pages
- `index.html` — accueil FR
- `en/index.html` — accueil EN
- `confidentialite.html` — politique de confidentialité FR (URL Play Console)
- `en/privacy.html` — privacy policy EN
- `app/index.html` — redirection vers le store (`akikoi.fr/app`)
- `e/index.html` — lien d'emprunt (`akikoi.fr/e#<payload>`), format documenté en tête du fichier

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

## URLs de test du lien d'emprunt
- Date future (Perceuse, prêtée par Marc, retour 24/12/2026) :
  https://akikoi.fr/e#eyJ2IjoxLCJvIjoiUGVyY2V1c2UiLCJkIjoiMjAyNi0xMi0yNCIsInAiOiJNYXJjIiwidCI6IjIwMjYtMDktMTAifQ
- En retard (Tente 3 places, prêtée par Hélène, retour 01/09/2026) :
  https://akikoi.fr/e#eyJ2IjoxLCJvIjoiVGVudGUgMyBwbGFjZXMiLCJkIjoiMjAyNi0wOS0wMSIsInAiOiJIw6lsw6huZSIsInQiOiIyMDI2LTA4LTE1In0
- Sans date (« L'Étranger » de Camus, prêté par Léa) :
  https://akikoi.fr/e#eyJ2IjoxLCJvIjoiwqsgTCfDiXRyYW5nZXIgwrsgZGUgQ2FtdXMiLCJwIjoiTMOpYSJ9

En local : `python -m http.server` à la racine, puis `http://localhost:8000/e/#<payload>`.
