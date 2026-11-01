// Shared renderer for the exhibit pages. Everything is counted from the track lists, nothing is typed in by hand.
(function () {
  var P = window.PAGES[window.PAGE_KEY];
  var T = window[window.PAGE_KEY === "basement" ? "PL_BASEMENT" : "PL_DISASTER"];
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var mask = function (s) { return String(s).replace(/fuck/gi, function (m) { return m[0] + "*" + m.slice(2); }).replace(/shit/gi, function (m) { return m[0] + "***"; }); };
  var norm = function (s) { return s.toLowerCase().replace(/\s*[-–(].*$/, "").replace(/[^a-z0-9 ]/g, "").trim(); };
  var first = function (a) { return a.split(",")[0].toLowerCase().trim(); };

  // ransom-note title
  var fonts = ['"Black Ops One"', '"Permanent Marker"', '"Rubik Mono One"', '"Special Elite"'];
  var title = $("title");
  title.innerHTML = title.textContent.split(" ").map(function (w, wi) {
    return '<span class="w" aria-hidden="true">' + w.split("").map(function (ch, i) {
      var cut = (wi * 7 + i * 3) % 9 === 2 || (wi * 7 + i * 3) % 9 === 5;
      var rot = ((wi * 11 + i * 5) % 7 - 3) * 1.6;
      return '<span class="l' + (cut ? " cut" : "") + '" style="font-family:' + fonts[(wi + i) % fonts.length] + ';transform:rotate(' + rot + 'deg)">' + esc(ch) + "</span>";
    }).join("") + "</span>";
  }).join(" ");

  // the numbers
  var stats = [[T.length, "songs under review", -2]].concat(P.stats.map(function (s) {
    var re = new RegExp(s[0], "i");
    return [T.filter(function (t) { return re.test(t.artist); }).length, s[1], s[2]];
  }));
  $("stats").innerHTML = stats.map(function (s) { return '<div class="stat" style="--r:' + s[2] + 'deg"><b data-n="' + s[0] + '">' + s[0] + "</b><span>" + esc(s[1]) + "</span></div>"; }).join("");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var n = +e.target.dataset.n, k = 0, step = Math.max(1, Math.ceil(n / 24));
        var t = setInterval(function () { k = Math.min(n, k + step); e.target.textContent = k; if (k >= n) clearInterval(t); }, 40);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll(".stat b").forEach(function (b) { b.textContent = "0"; io.observe(b); });
  }

  // the lineup: top artists as bars
  var counts = {};
  T.forEach(function (t) { t.artist.split(", ").forEach(function (a) { counts[a] = (counts[a] || 0) + 1; }); });
  var top = Object.keys(counts).map(function (a) { return [a, counts[a]]; }).sort(function (a, b) { return b[1] - a[1] || a[0].localeCompare(b[0]); }).slice(0, 10);
  var max = top[0][1];
  $("bars").innerHTML = top.map(function (r) {
    return '<li><span class="nm">' + esc(r[0]) + '</span><span class="bar"><i style="width:' + Math.round(100 * r[1] / max) + '%"></i></span><span class="ct">' + r[1] + "</span></li>";
  }).join("");

  // repeat offenders inside this playlist
  var seen = {};
  T.forEach(function (t) { var k = norm(t.title) + "|" + first(t.artist); (seen[k] = seen[k] || []).push(t); });
  var reps = Object.keys(seen).filter(function (k) { return seen[k].length > 1; }).map(function (k) { return seen[k]; });
  $("repnote").textContent = P.repeatsNote;
  $("repeats").innerHTML = reps.length ? reps.map(function (g) {
    var q = P.repeatQuips[norm(g[0].title)] || "Appears more than once. She was not taking chances.";
    return "<li><b>" + esc(mask(g[0].title.replace(/\s*-\s.*$/, ""))) + "</b> <em>" + esc(g[0].artist) + ".</em> Tracks " + g.map(function (t) { return t.n; }).join(" and ") + ". " + esc(q) + "</li>";
  }).join("") : "<li>No repeats. She is disciplined, or she is lying.</li>";

  // songs she liked enough to put on more than one playlist
  var all = [["the case file playlist", window.TRACKS || []], ["the indie playlist", window.HER1 || []], ["the basement playlist", window.PL_BASEMENT || []], ["the metal playlist", window.PL_DISASTER || []]];
  var where = {};
  all.forEach(function (pl) { pl[1].forEach(function (t) { var k = norm(t.title) + "|" + first(t.artist); (where[k] = where[k] || { t: t, in: {} }).in[pl[0]] = true; }); });
  var here = window.PAGE_KEY === "basement" ? "the basement playlist" : "the metal playlist";
  var cross = Object.keys(where).map(function (k) { return where[k]; }).filter(function (w) { return w.in[here] && Object.keys(w.in).length > 1; });
  $("cross").innerHTML = cross.length ? cross.map(function (w) {
    var others = Object.keys(w.in).filter(function (n) { return n !== here; });
    return "<li><b>" + esc(mask(w.t.title.replace(/\s*-\s.*$/, ""))) + "</b> <em>" + esc(w.t.artist) + ".</em> Also on " + esc(others.join(" and ")) + ".</li>";
  }).join("") : "<li>No song appears on more than one playlist. She keeps her playlists in separate rooms.</li>";

  // exhibits
  var card = function (x, i) {
    var t = T[x[0] - 1];
    return '<span class="tag">EXHIBIT ' + String(i + 1).padStart(2, "0") + '</span><h3>' + esc(mask(t.title.replace(/\s*-\s(Live|New Version|Remaster|Acoustic).*$/i, ""))) + '</h3><p class="by">' + esc(t.artist) + ", track " + x[0] + '</p><p class="r">' + esc(x[1]) + "</p>";
  };
  var X = P.exhibits, last = -1;
  $("roll").onclick = function () {
    var i; do { i = Math.floor(Math.random() * X.length); } while (i === last && X.length > 1);
    last = i;
    var el = $("exhibit"); el.className = "exhibit"; el.innerHTML = card(X[i], i); void el.offsetWidth; el.classList.add("pop");
  };
  $("all").onclick = function () {
    var box = $("exhibits"); box.hidden = !box.hidden;
    $("all").textContent = box.hidden ? "Show all exhibits" : "Hide the exhibits";
    if (!box.innerHTML) box.innerHTML = X.map(function (x, i) { return '<article class="card">' + card(x, i) + "</article>"; }).join("");
  };
  $("roll").click();

  // says, cues, recommendations
  $("says").innerHTML = P.says.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
  var embed = function (id, box) { box.innerHTML = '<iframe title="Play the song" src="https://open.spotify.com/embed/track/' + id + '?utm_source=generator&theme=0" width="100%" height="80" frameborder="0" allow="encrypted-media; clipboard-write" loading="lazy"></iframe>'; };
  var slots = { first: P.cueFirst, mid: P.cueMid, end: P.cueEnd };
  document.querySelectorAll(".cue").forEach(function (el) {
    var c = P.cues[slots[el.dataset.slot]]; if (!c) return;
    el.innerHTML = '<span class="k">Soundtrack for this section</span><b>' + esc(mask(c.title)) + "</b> <i>" + esc(c.artist) + '</i><span class="v">' + esc(c.vibe) + '</span><button class="play" type="button">Play it here</button><div class="slot"></div>';
    el.querySelector(".play").onclick = function () { embed(c.id, el.querySelector(".slot")); this.hidden = true; };
  });
  $("recs").innerHTML = P.recs.map(function (r, i) {
    return '<li class="rec"><span class="n">' + (i + 1) + '</span><div><b>' + esc(r.title) + "</b> <i>" + esc(r.artist) + '</i><span class="v">' + esc(r.why) + '</span><button class="play" type="button" data-id="' + esc(r.id) + '">Play it here</button><div class="slot"></div></div></li>';
  }).join("");
  document.querySelectorAll(".rec .play").forEach(function (b) { b.onclick = function () { embed(b.dataset.id, b.parentNode.querySelector(".slot")); b.hidden = true; }; });
  $("fullpl").href = "https://open.spotify.com/playlist/" + (window.JASON_PLAYLIST || "");
  $("vbig").textContent = P.verdictBig; $("vtext").textContent = P.verdict;
})();
