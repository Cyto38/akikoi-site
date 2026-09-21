/*
  Le script des deux pages d'annonce : /o (un objet) et /objets (une liste).

  Elles ne diffèrent que par leur en-tête — titre, description, aperçu : au
  singulier pour l'une, au pluriel pour l'autre. Ce qui s'affiche, lui, ne tient
  pas à l'adresse mais à la clé `l` du lien : une liste ouverte sur /o
  s'affiche en liste, un objet seul sur /objets s'affiche seul. Deux copies de
  ce fichier auraient fini par diverger.

  Le markup des deux pages doit rester le même : ce sont ses identifiants qu'on
  lit ici.

  Format du lien (#<payload>) : voir README.md, sections « Format du lien /o ».
*/
(function () {
  "use strict";

  var MAX_LEN = 120;
  var MAX_WORDS = 300;
  var MAX_DAYS = 365;
  var MAX_ITEMS = 50;

  function $(id) { return document.getElementById(id); }

  function cleanText(s, max) {
    if (typeof s !== "string") return "";
    s = s.replace(/\s+/g, " ").trim();
    return s.length > max ? s.slice(0, max - 1) + "…" : s;
  }

  function base64urlToUtf8(b64) {
    var s = b64.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
    if (!/^[A-Za-z0-9+\/]*$/.test(s) || s.length % 4 === 1) throw new Error("base64");
    while (s.length % 4) s += "=";
    var bin = atob(s);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  }

  // Durée conseillée en jours : un entier raisonnable, sinon rien à conseiller
  function readDays(value) {
    if (typeof value !== "number" || !isFinite(value)) return null;
    var n = Math.floor(value);
    return n >= 1 && n <= MAX_DAYS ? n : null;
  }

  // Numéro international, chiffres seuls : mal formé, il est ignoré plutôt que suivi
  function readPhone(value) {
    if (typeof value !== "string") return "";
    var digits = value.replace(/[\s.\-()]/g, "").replace(/^\+/, "");
    return /^[0-9]{6,15}$/.test(digits) ? digits : "";
  }

  // Liste : [{ object, words, days }, …] si l est un tableau bien formé, sinon
  // null — le lien se lit alors par son résumé, il n'est pas illisible.
  function decodeItems(list) {
    if (!Array.isArray(list) || list.length === 0) return null;
    var items = [];
    for (var i = 0; i < list.length && i < MAX_ITEMS; i++) {
      var raw = list[i];
      if (!raw || typeof raw !== "object") return null;
      var object = cleanText(raw.o, MAX_LEN);
      if (!object) return null;
      items.push({
        object: object,
        words: cleanText(raw.x, MAX_WORDS),
        days: readDays(raw.r)
      });
    }
    return items;
  }

  // Renvoie { object, lender, words, days, phone, items } ou null si illisible
  function decodePayload(payload) {
    var data;
    try {
      data = JSON.parse(base64urlToUtf8(payload));
    } catch (e) {
      return null;
    }
    if (!data || typeof data !== "object" || data.v !== 1) return null;

    var object = cleanText(data.o, MAX_LEN);
    var lender = cleanText(data.p, MAX_LEN);
    if (!object || !lender) return null;

    return {
      object: object,
      lender: lender,
      words: cleanText(data.x, MAX_WORDS),
      days: readDays(data.r),
      phone: readPhone(data.n),
      items: decodeItems(data.l)
    };
  }

  function durationText(days) {
    // Les mêmes mots que l'app : une durée proposée, jamais promise.
    if (days === null) return "Durée libre, à convenir ensemble";
    return days === 1 ? "Durée proposée : 1 jour" : "Durée proposée : " + days + " jours";
  }

  function utf8ToBase64url(s) {
    var bytes = new TextEncoder().encode(s);
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  // Le lien retour (README, « Format du lien /p ») : chez le prêteur, Akikoi
  // l'ouvre et pose le prêt à moitié rempli — l'objet, et qui le demande.
  function loanLink(object, firstName) {
    var data = firstName ? { v: 1, o: object, e: firstName } : { v: 1, o: object };
    return "https://akikoi.fr/p#" + utf8ToBase64url(JSON.stringify(data));
  }

  /** Le prénom saisi, resserré — vide s'il n'y en a pas. */
  function firstNameOf(id) {
    var champ = $(id);
    return champ ? cleanText(champ.value, MAX_LEN) : "";
  }

  /*
    Le message part écrit : celui qui reçoit n'a qu'à l'envoyer. Dans une
    liste, il nomme **cet** objet-là, pas le résumé. Il se signe du prénom
    s'il y en a un, et porte le lien qui note le prêt d'un tap.
  */
  function interestLink(offer, object, firstName) {
    var salutation = "Salut " + offer.lender + ", " + object + " m'intéresse 🙂";
    var message = (firstName ? salutation + " — " + firstName : salutation) +
      "\n📦 Note le prêt en un tap → " + loanLink(object, firstName);
    return "https://wa.me/" + offer.phone + "?text=" + encodeURIComponent(message);
  }

  // Une carte par objet : son nom, ses deux mots, sa durée, son bouton.
  function renderItems(offer) {
    var list = $("offers-list");
    while (list.firstChild) list.removeChild(list.firstChild);
    offer.items.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "loan-card offer-card";

      var name = document.createElement("h2");
      name.className = "offer-card-object";
      name.textContent = item.object;
      li.appendChild(name);

      if (item.words) {
        var words = document.createElement("p");
        words.className = "offer-words";
        words.textContent = item.words;
        li.appendChild(words);
      }

      var duration = document.createElement("p");
      duration.className = "loan-badge loan-badge-free";
      duration.textContent = durationText(item.days);
      li.appendChild(duration);

      if (offer.phone) {
        var cta = document.createElement("a");
        cta.className = "cta cta-live loan-cta-btn";
        cta.href = interestLink(offer, item.object, firstNameOf("offers-firstname"));
        cta.textContent = "Ça m'intéresse !";
        li.appendChild(cta);
      }

      list.appendChild(li);
    });
  }

  function show(id) {
    ["state-offer", "state-offers", "state-invalid", "state-empty"].forEach(function (s) {
      $(s).hidden = s !== id;
    });
  }

  function render() {
    var payload = location.hash.replace(/^#/, "");
    if (!payload) {
      document.title = "Ce lien est incomplet · Akikoi";
      show("state-empty");
      return;
    }

    var offer = decodePayload(payload);
    if (!offer) {
      document.title = "Lien illisible · Akikoi";
      show("state-invalid");
      return;
    }

    // Une liste d'objets : ce que quelqu'un peut prêter, une carte chacun.
    if (offer.items) {
      $("offers-title").textContent = "Ce que " + offer.lender + " peut prêter";
      renderItems(offer);
      $("offers-reply").hidden = !!offer.phone;
      $("offers-reply").textContent = "Réponds à " + offer.lender + " sur WhatsApp.";
      document.title = "Ce que " + offer.lender + " peut prêter · Akikoi";
      show("state-offers");
      return;
    }

    // Uniquement textContent : le contenu vient du lien, jamais interprété comme HTML
    $("offer-title").textContent = offer.object;
    $("offer-by").textContent = "Proposé par " + offer.lender + ", à qui en a besoin";

    $("offer-words").hidden = !offer.words;
    $("offer-words").textContent = offer.words;

    $("offer-duration").textContent = durationText(offer.days);

    $("offer-whatsapp").hidden = !offer.phone;
    $("offer-name-row").hidden = !offer.phone;
    if (offer.phone) {
      $("offer-whatsapp").href = interestLink(offer, offer.object, firstNameOf("offer-firstname"));
    }
    $("offer-reply").hidden = !!offer.phone;
    $("offer-reply").textContent = "Réponds à " + offer.lender + " sur WhatsApp.";

    document.title = offer.object + " · Akikoi";
    show("state-offer");
  }

  /*
    Le prénom se tape **après** que la page s'est affichée : les liens se
    refont à chaque frappe, sans bouton à presser pour « valider ». Écouté
    sur le document, les champs naissant avec la liste.
  */
  document.addEventListener("input", function (e) {
    if (e.target && (e.target.id === "offer-firstname" || e.target.id === "offers-firstname")) {
      render();
    }
  });

  window.addEventListener("hashchange", render);
  render();
})();
