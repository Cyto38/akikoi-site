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
- `o/index.html` — objet proposé en prêt (`akikoi.fr/o#<payload>`)

## Aperçus (Open Graph)
Les pages partagées — `/o`, `/e`, `/app` — déclarent `assets/og-banner.png`,
une **bannière 1200×630** (fond accent, symbole + « Akikoi », baseline « Prêts &
emprunts »). WhatsApp affiche une image large en vignette d'aperçu, là où un
carré est rogné. Les dimensions déclarées sont les vraies, et le fichier pèse
moins de 300 Ko.

L'aperçu reste **générique** : le fragment (`#…`) n'arrive jamais au serveur,
et rien du prêt ni de l'objet proposé ne doit fuir dans une vignette.

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
- JSON compact, versionné, clés courtes, dans l'ordre `v, o, d, p, t, l` :
  `{"v":1,"o":"Perceuse","d":"2026-09-24","p":"Marc","t":"2026-09-10"}`

| Clé | Sens | Statut |
|---|---|---|
| `v` | version du format | obligatoire, entier, = 1 |
| `o` | objet prêté — pour un lot, le **résumé** (« Livre 1, Livre 2 et Scie ») | obligatoire, chaîne non vide |
| `d` | date de retour convenue — pour un lot, la **plus proche** | optionnel, `AAAA-MM-JJ` |
| `p` | prénom du prêteur | optionnel, chaîne |
| `t` | date du prêt | optionnel, `AAAA-MM-JJ` |
| `l` | **lot** : la liste des articles, `[{"o":…,"d":…}, …]` | optionnel, tableau |

### Le lot (`l`)
Plusieurs objets prêtés d'un coup, à la même personne, le même jour. Chaque article
porte son objet `o` (obligatoire, chaîne non vide) et sa date de retour `d` (optionnelle,
`AAAA-MM-JJ`) — les dates peuvent différer d'un article à l'autre.

- `o` et `d` restent au premier niveau, comme **résumé** : le titre-liste et la date la
  plus proche (le premier retour attendu). Un lecteur qui ignore `l` — une page ou une
  app antérieure — lit donc un prêt unique, juste, à la date la plus proche.
- Un `l` mal formé (pas un tableau, tableau vide, un article sans `o`, un `d` mal
  formé) est **ignoré en entier** : le lien se lit par son résumé, il n'est pas
  illisible pour autant.
- Au plus 50 articles sont lus ; les suivants sont ignorés. `o` de chaque article est
  tronqué à 120 caractères à l'affichage, comme `o`.
- Sans `l` : comportement inchangé.

Exemple (3 articles, deux dates) :
`{"v":1,"o":"Livre 1, Livre 2 et Scie","d":"2026-10-04","p":"Marc","t":"2026-09-19","l":[{"o":"Livre 1","d":"2026-12-24"},{"o":"Livre 2","d":"2026-12-24"},{"o":"Scie","d":"2026-10-04"}]}`

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

## Format du lien /o (objet proposé)
Page d'un objet qu'on **propose** à ses contacts : `https://akikoi.fr/o#<payload>`
(`o/index.html`). Même mécanique que `/e` — base64url d'un JSON compact versionné, lu
côté client depuis `location.hash`, jamais envoyé au serveur.

Un objet proposé n'est prêté à personne : il n'y a ni emprunteur, ni date de retour, ni
prêt en cours. La page ne montre donc **rien qui ressemble à un engagement** : l'objet,
qui le propose, deux mots pour le décrire, la durée conseillée, et un bouton pour dire
qu'il intéresse.

`payload = base64url( UTF-8( JSON compact ) )`, clés dans l'ordre `v, o, p, x, r, n` :
`{"v":1,"o":"Tondeuse","p":"Marc","x":"Thermique, coupe 46 cm.","r":3,"n":"33612345678"}`

| Clé | Sens | Statut |
|---|---|---|
| `v` | version du format | obligatoire, entier, = 1 |
| `o` | objet proposé | obligatoire, chaîne non vide |
| `p` | prénom de qui propose | obligatoire, chaîne non vide |
| `x` | « en deux mots » : ce que c'est, en une phrase | optionnel, chaîne |
| `r` | durée conseillée, en jours | optionnel, entier ≥ 1 |
| `n` | numéro WhatsApp, **international, chiffres seuls** (ni `+`, ni espaces) | optionnel, 6 à 15 chiffres |

- `o` et `p` sont tronqués à 120 caractères à l'affichage, `x` à 300.
- `r` absent, nul ou mal formé → « Durée à convenir ensemble ». Au-delà de 365, ignoré.
- `n` mal formé (lettres, trop court, trop long) est **ignoré** : la page reste lisible,
  elle dit simplement de répondre sur WhatsApp au lieu d'ouvrir la conversation.
- `v` inconnu, base64/UTF-8/JSON invalide, `o` ou `p` absent ou vide → « lien illisible ».
- Clés inconnues ignorées (ajouts compatibles sans changer `v`).
- Fragment absent → « Ce lien est incomplet ».

Le bouton « Ça m'intéresse ! » ouvre `https://wa.me/<n>?text=<message>` — « Salut {p},
{o} m'intéresse 🙂 ». Sans `n`, pas de bouton : une ligne dit de répondre à {p} sur
WhatsApp, là où le message a été reçu.

L'Open Graph est générique (« Un objet proposé en prêt · Akikoi ») : les messageries ne
reçoivent pas le fragment, et rien de l'objet ne doit fuir dans un aperçu. `noindex`,
comme `/e`.

## URLs de test du lien d'emprunt
- Date future (Perceuse, prêtée par Marc, retour 24/12/2026) :
  https://akikoi.fr/e#eyJ2IjoxLCJvIjoiUGVyY2V1c2UiLCJkIjoiMjAyNi0xMi0yNCIsInAiOiJNYXJjIiwidCI6IjIwMjYtMDktMTAifQ
- En retard (Tente 3 places, prêtée par Hélène, retour 01/09/2026) :
  https://akikoi.fr/e#eyJ2IjoxLCJvIjoiVGVudGUgMyBwbGFjZXMiLCJkIjoiMjAyNi0wOS0wMSIsInAiOiJIw6lsw6huZSIsInQiOiIyMDI2LTA4LTE1In0
- Sans date (« L'Étranger » de Camus, prêté par Léa) :
  https://akikoi.fr/e#eyJ2IjoxLCJvIjoiwqsgTCfDiXRyYW5nZXIgwrsgZGUgQ2FtdXMiLCJwIjoiTMOpYSJ9
- Lot de 3 articles (Livre 1 et Livre 2 au 24/12/2026, Scie au 04/10/2026, prêtés par Marc) :
  https://akikoi.fr/e#eyJ2IjoxLCJvIjoiTGl2cmUgMSwgTGl2cmUgMiBldCBTY2llIiwiZCI6IjIwMjYtMTAtMDQiLCJwIjoiTWFyYyIsInQiOiIyMDI2LTA5LTE5IiwibCI6W3sibyI6IkxpdnJlIDEiLCJkIjoiMjAyNi0xMi0yNCJ9LHsibyI6IkxpdnJlIDIiLCJkIjoiMjAyNi0xMi0yNCJ9LHsibyI6IlNjaWUiLCJkIjoiMjAyNi0xMC0wNCJ9XX0

En local : `python -m http.server` à la racine, puis `http://localhost:8000/e/#<payload>`.

## URLs de test du lien d'objet proposé
- Tondeuse proposée par Marc, 3 jours conseillés, avec numéro :
  https://akikoi.fr/o#eyJ2IjoxLCJvIjoiVG9uZGV1c2UgdGhlcm1pcXVlIiwicCI6Ik1hcmMiLCJ4IjoiQ291cGUgNDYgY20sIGJhYyBkZSByYW1hc3NhZ2UuIEZvbmN0aW9ubmUgbmlja2VsLiIsInIiOjMsIm4iOiIzMzYxMjM0NTY3OCJ9
- Échelle proposée par Léa, sans durée ni numéro :
  https://akikoi.fr/o#eyJ2IjoxLCJvIjoiw4ljaGVsbGUgMyBtIiwicCI6IkzDqWEifQ
