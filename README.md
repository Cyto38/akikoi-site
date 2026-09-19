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

## Format du lien /e
Page du lien d'emprunt : `https://akikoi.fr/e#<payload>` (`e/index.html`). L'app Akikoi
encode le lien à l'identique.

`payload = base64url( UTF-8( JSON compact ) )`
- base64url : alphabet RFC 4648 §5 (`-` et `_` au lieu de `+` et `/`), sans padding `=`
  (le décodeur accepte aussi le padding).
- JSON compact, versionné, clés courtes :
  `{"v":1,"o":"Perceuse","d":"2026-09-24","p":"Marc","t":"2026-09-10"}`

| Clé | Sens | Statut |
|---|---|---|
| `v` | version du format | obligatoire, entier, = 1 |
| `o` | objet prêté | obligatoire, chaîne non vide |
| `d` | date de retour convenue | optionnel, `AAAA-MM-JJ` |
| `p` | prénom du prêteur | optionnel, chaîne |
| `t` | date du prêt | optionnel, `AAAA-MM-JJ` |

- Les clés inconnues sont ignorées (ajouts compatibles sans changer `v`).
- `v` inconnu, base64/UTF-8/JSON invalide, `o` absent ou vide, `d` mal formée
  → état « lien illisible ». Un `t` mal formé est simplement ignoré.
- Fragment absent → état « Ce lien est incomplet ».
- Les dates sont des dates civiles (sans heure ni fuseau) : l'écart de jours est calculé
  au jour près dans le fuseau du téléphone qui ouvre la page.
- `o` et `p` sont tronqués à 120 caractères à l'affichage.

Le fragment (`#…`) n'est jamais envoyé au serveur : tout est lu côté client via
`location.hash`. Aucun tracking, aucun script tiers. L'Open Graph de la page est donc
générique (aucune donnée du prêt).

## URLs de test du lien d'emprunt
- Date future (Perceuse, prêtée par Marc, retour 24/12/2026) :
  https://akikoi.fr/e#eyJ2IjoxLCJvIjoiUGVyY2V1c2UiLCJkIjoiMjAyNi0xMi0yNCIsInAiOiJNYXJjIiwidCI6IjIwMjYtMDktMTAifQ
- En retard (Tente 3 places, prêtée par Hélène, retour 01/09/2026) :
  https://akikoi.fr/e#eyJ2IjoxLCJvIjoiVGVudGUgMyBwbGFjZXMiLCJkIjoiMjAyNi0wOS0wMSIsInAiOiJIw6lsw6huZSIsInQiOiIyMDI2LTA4LTE1In0
- Sans date (« L'Étranger » de Camus, prêté par Léa) :
  https://akikoi.fr/e#eyJ2IjoxLCJvIjoiwqsgTCfDiXRyYW5nZXIgwrsgZGUgQ2FtdXMiLCJwIjoiTMOpYSJ9

En local : `python -m http.server` à la racine, puis `http://localhost:8000/e/#<payload>`.
