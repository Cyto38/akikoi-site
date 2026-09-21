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

`/o` parle à la première personne — « Je propose un objet à prêter · Akikoi »,
« Ouvre le lien pour voir ce que c'est, et réponds-moi si ça t'intéresse. » :
l'aperçu s'affiche sous le message de qui l'envoie. La page n'existe qu'en
français ; le jour où elle aura sa version anglaise, ce sera « I'm offering an
item to lend · Akikoi », « Open the link to see it, and reply if you're
interested. » et, sous le titre, « Offered by {p}, to anyone who needs it ».

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
| `r` | durée **proposée**, en jours (1, 3, 7, 15, 30 — comme les chips de l'app) | optionnel, entier ≥ 1 |
| `n` | numéro WhatsApp, **international, chiffres seuls** (ni `+`, ni espaces) | optionnel, 6 à 15 chiffres |

- `o` et `p` sont tronqués à 120 caractères à l'affichage, `x` à 300.
- `r` absent, nul ou mal formé → « Durée libre, à convenir ensemble ». Au-delà de 365, ignoré.
- `n` mal formé (lettres, trop court, trop long) est **ignoré** : la page reste lisible,
  elle dit simplement de répondre sur WhatsApp au lieu d'ouvrir la conversation.
- `v` inconnu, base64/UTF-8/JSON invalide, `o` ou `p` absent ou vide → « lien illisible ».
- Clés inconnues ignorées (ajouts compatibles sans changer `v`).
- Fragment absent → « Ce lien est incomplet ».

Le bouton « Ça m'intéresse ! » ouvre `https://wa.me/<n>?text=<message>` — « Salut {p},
{o} m'intéresse 🙂 ». Sans `n`, pas de bouton : une ligne dit de répondre à {p} sur
WhatsApp, là où le message a été reçu.

### La liste (`l`)
**Ce que quelqu'un peut prêter**, et non plus un objet seul : `l` porte la liste, chaque
article avec son objet `o` (obligatoire, chaîne non vide), ses deux mots `x`
(optionnel) et sa durée proposée `r` (optionnelle). Même mécanique que le lot de `/e`.

- `o`, `x` et `r` restent au premier niveau, comme **résumé** : le titre-liste
  (« Tondeuse, Échelle et Perceuse ») et ce qui décrit le premier objet. Un lecteur qui
  ignore `l` — une page ou une app antérieure — lit donc une annonce juste, pour un
  objet. `p` et `n` valent pour toute la liste : c'est la même personne qui propose.
- Un `l` mal formé (pas un tableau, tableau vide, un article sans `o`) est **ignoré en
  entier** : le lien se lit par son résumé, il n'est pas illisible pour autant.
- Au plus 50 articles sont lus ; les suivants sont ignorés. `o` de chaque article est
  tronqué à 120 caractères, `x` à 300, `r` suit les mêmes bornes qu'au premier niveau.
- Sans `l` : comportement inchangé.

Avec `l`, la page titre « Ce que {p} peut prêter » et pose une carte par objet — son
nom, ses deux mots, sa durée proposée —, chacune avec son bouton « Ça m'intéresse ! »
dont le message nomme **cet** objet-là. Sans `n`, pas de boutons : la ligne « Réponds à
{p} sur WhatsApp. » est posée **une fois** sous la liste, et non répétée sous chaque
carte — c'est la même réponse pour tous les objets.

Exemple (3 objets) :
`{"v":1,"o":"Tondeuse thermique, Échelle 3 m et Perceuse","p":"Marc","x":"Coupe 46 cm.","r":3,"n":"33612345678","l":[{"o":"Tondeuse thermique","x":"Coupe 46 cm, bac de ramassage.","r":3},{"o":"Échelle 3 m","x":"Aluminium, légère."},{"o":"Perceuse","x":"Avec ses mèches.","r":7}]}`

L'Open Graph est générique (« Un objet proposé en prêt · Akikoi ») : les messageries ne
reçoivent pas le fragment, et rien de l'objet ne doit fuir dans un aperçu. `noindex`,
comme `/e`.

## Format du lien /p (« ça m'intéresse »)
Le chemin **retour**, de qui emprunte vers qui prête : `https://akikoi.fr/p#<payload>`
(`p/index.html`). Même mécanique que `/e` et `/o` — base64url d'un JSON compact
versionné, lu côté client depuis `location.hash`, jamais envoyé au serveur.

Le bouton « Ça m'intéresse ! » de `/o` ne fait plus qu'ouvrir une conversation : il
glisse ce lien dans le message. Chez le prêteur, Akikoi l'ouvre (App Link) et pose le
prêt à moitié rempli — l'objet et la personne. **Rien n'est créé sans lui** : c'est un
formulaire qui s'ouvre, pas une fiche qui apparaît.

`payload = base64url( UTF-8( JSON compact ) )`, clés dans l'ordre `v, o, e` :
`{"v":1,"o":"Tondeuse thermique","e":"Léa"}`

| Clé | Sens | Statut |
|---|---|---|
| `v` | version du format | obligatoire, entier, = 1 |
| `o` | objet demandé — celui de l'annonce | obligatoire, chaîne non vide |
| `e` | prénom de qui demande | optionnel, chaîne |

- `o` et `e` sont tronqués à 120 caractères à l'affichage.
- `v` inconnu, base64/UTF-8/JSON invalide, `o` absent ou vide → « lien illisible ».
- Clés inconnues ignorées (ajouts compatibles sans changer `v`).
- Fragment absent → « Ce lien est incomplet ».

La page est un **repli**, et se lit comme tel : « {e} veut emprunter {o} », « Ouvre
Akikoi pour noter le prêt », et le lien d'installation. Sans `e`, « Quelqu'un veut
emprunter {o} » — la phrase reste vraie sans nommer personne. Sur le téléphone du
prêteur qui a l'app, cette page ne s'affiche jamais : l'App Link la court-circuite.

L'Open Graph est générique, `noindex`, comme `/e` et `/o`.

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

## URLs de test du lien « ça m'intéresse »
- Léa veut emprunter la tondeuse :
  https://akikoi.fr/p#eyJ2IjoxLCJvIjoiVG9uZGV1c2UgdGhlcm1pcXVlIiwiZSI6IkzDqWEifQ
- Sans prénom (« Quelqu'un veut emprunter Échelle 3 m ») :
  https://akikoi.fr/p#eyJ2IjoxLCJvIjoiw4ljaGVsbGUgMyBtIn0

## URLs de test du lien d'objet proposé
- Tondeuse proposée par Marc, 3 jours conseillés, avec numéro :
  https://akikoi.fr/o#eyJ2IjoxLCJvIjoiVG9uZGV1c2UgdGhlcm1pcXVlIiwicCI6Ik1hcmMiLCJ4IjoiQ291cGUgNDYgY20sIGJhYyBkZSByYW1hc3NhZ2UuIEZvbmN0aW9ubmUgbmlja2VsLiIsInIiOjMsIm4iOiIzMzYxMjM0NTY3OCJ9
- Liste de 3 objets proposés par Marc (Tondeuse 3 j, Échelle sans durée, Perceuse 7 j), avec numéro :
  https://akikoi.fr/o#eyJ2IjoxLCJvIjoiVG9uZGV1c2UgdGhlcm1pcXVlLCDDiWNoZWxsZSAzIG0gZXQgUGVyY2V1c2UiLCJwIjoiTWFyYyIsIngiOiJDb3VwZSA0NiBjbSwgYmFjIGRlIHJhbWFzc2FnZS4iLCJyIjozLCJuIjoiMzM2MTIzNDU2NzgiLCJsIjpbeyJvIjoiVG9uZGV1c2UgdGhlcm1pcXVlIiwieCI6IkNvdXBlIDQ2IGNtLCBiYWMgZGUgcmFtYXNzYWdlLiIsInIiOjN9LHsibyI6IsOJY2hlbGxlIDMgbSIsIngiOiJBbHVtaW5pdW0sIGzDqWfDqHJlLiJ9LHsibyI6IlBlcmNldXNlIiwieCI6IkF2ZWMgc2VzIG3DqGNoZXMuIiwiciI6N31dfQ
- Échelle proposée par Léa, sans durée ni numéro :
  https://akikoi.fr/o#eyJ2IjoxLCJvIjoiw4ljaGVsbGUgMyBtIiwicCI6IkzDqWEifQ
