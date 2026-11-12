// Quel store pour cet appareil ? iPhone/iPad -> App Store, Android -> Google Play,
// ailleurs -> aucun : les liens gardent leur adresse (akikoi.fr/app, qui montre
// les deux badges). Aperçu : ?ios=1 ou ?android=1 simule l'appareil.
(function () {
  "use strict";
  var APP_STORE = "https://apps.apple.com/app/id6822337850";
  var PLAY = "https://play.google.com/store/apps/details?id=com.cyriltosi.objetspretes";

  var ua = navigator.userAgent || "";
  var q = location.search;
  // iPadOS se présente comme un Mac : on le reconnaît à l'écran tactile
  var ios = /[?&]ios=1(&|$)/.test(q) ||
    /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var android = !ios && (/[?&]android=1(&|$)/.test(q) || /Android/i.test(ua));

  var store = window.AKIKOI_STORE = {
    appStore: APP_STORE,
    play: PLAY,
    platform: ios ? "ios" : android ? "android" : null,
    url: ios ? APP_STORE : android ? PLAY : null
  };

  // Les liens d'installation (data-store-link) vont droit au store de l'appareil
  function apply() {
    if (!store.url) return;
    var links = document.querySelectorAll("a[data-store-link]");
    for (var i = 0; i < links.length; i++) links[i].href = store.url;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
