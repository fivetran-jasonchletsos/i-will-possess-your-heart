// Motion layer: scroll reveals and an equalizer. Everything is visible without it, and it stands down for reduced motion.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hero = document.querySelector(".hero .btn");
  if (hero && !document.querySelector(".eq")) {
    var eq = document.createElement("div");
    eq.className = "eq"; eq.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 9; i++) { var b = document.createElement("i"); b.style.animationDelay = (i * 0.11) + "s"; b.style.animationDuration = (0.7 + (i % 4) * 0.19) + "s"; eq.appendChild(b); }
    hero.parentNode.appendChild(eq);
  }
  var flyers = document.querySelectorAll(".flyer");
  if (reduce || !("IntersectionObserver" in window)) { flyers.forEach(function (f) { f.classList.add("in"); }); return; }
  document.documentElement.classList.add("fx");
  // Reveal every panel that has been reached or passed. A fast flick can skip past a panel, so this checks position, not just visibility.
  var pending = Array.prototype.slice.call(flyers), ticking = false;
  var check = function () {
    ticking = false;
    var edge = window.innerHeight * 0.94;
    pending = pending.filter(function (f) {
      if (f.getBoundingClientRect().top < edge) { f.classList.add("in"); return false; }
      return true;
    });
    if (!pending.length) { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); }
  };
  var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  check();
  // never leave a panel hidden if something goes wrong
  setTimeout(function () { flyers.forEach(function (f) { f.classList.add("in"); }); }, 8000);
})();
