(function () {
  var T = window.TRACKS || [];
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var by = function (n) { return T[n - 1]; };
  var mask = function (s) { return String(s).replace(/fuck/gi, function (m) { return m[0] + "*" + m.slice(2); }).replace(/shit/gi, function (m) { return m[0] + "***"; }); };

  // ---- the title, cut out of a ransom note ----
  var fonts = ['"Black Ops One"', '"Permanent Marker"', '"Rubik Mono One"', '"Special Elite"'];
  var title = $("title");
  var words = title.textContent.split(" ");
  title.innerHTML = words.map(function (w, wi) {
    return '<span class="w" aria-hidden="true">' + w.split("").map(function (ch, i) {
      var k = (wi * 7 + i * 3) % 9;
      var cut = k === 2 || k === 5;
      var rot = ((wi * 11 + i * 5) % 7 - 3) * 1.6;
      return '<span class="l' + (cut ? " cut" : "") + '" style="font-family:' + fonts[(wi + i) % fonts.length] + ';transform:rotate(' + rot + 'deg)">' + esc(ch) + '</span>';
    }).join("") + "</span>";
  }).join(" ");

  // ---- the numbers, counted from the track list ----
  var count = function (re) { return T.filter(function (t) { return re.test(t.artist); }).length; };
  var stats = [
    [T.length, "songs under review", -2],
    [count(/mgk/i), "of them involve Machine Gun Kelly. A residency.", 1.5],
    [count(/lil peep/i), "Lil Peep songs. He is practically on the lease.", -1],
    [count(/avicii/i), "Avicii songs, the playlist apologizing for everything else", 2],
    [count(/travis barker/i), "appearances by Travis Barker. The drums were subpoenaed.", -1.5],
    [T.filter(function (t) { return /scars/i.test(t.title); }).length, "different songs called Scars. This is a point, not a mistake.", 1]
  ];
  $("stats").innerHTML = stats.map(function (s) {
    return '<div class="stat" style="--r:' + s[2] + 'deg"><b data-n="' + s[0] + '">' + s[0] + '</b><span>' + esc(s[1]) + "</span></div>";
  }).join("");
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

  // ---- genre whiplash: tracks 33 to 40 ----
  $("whiplash").innerHTML = T.slice(32, 40).map(function (t) {
    return '<li><span class="no">' + t.n + '</span><span><span class="t">' + esc(mask(t.title)) + '</span><span class="a">' + esc(t.artist) + "</span></span></li>";
  }).join("");

  // ---- exhibits: real tracks, each with a one-liner about the song ----
  var X = [
    [8, "I Think I'm OKAY", "A song that is basically a group chat between three people who each drove here separately. Track 8 is where the playlist stops pretending to be one mood."],
    [3, "Molly (feat. Brendon Urie)", "A goofy Lil Dicky track in a room full of serious people. It walked in wearing a Hawaiian shirt and the room said nothing."],
    [12, "Dear Maria, Count Me In", "A high school anthem from the days when everybody had a hoodie and a plan. The playlist just unlocked a memory nobody asked for."],
    [13, "Ill Mind of Hopsin 5", "A Hopsin track just wandered into the middle of this like it got off at the wrong stop. Nobody asked it to leave. Respect."],
    [14, "Airplanes", "Someone wished on a shooting star at least once, and I am not going to ask what for."],
    [16, "No Sleep", "Wiz Khalifa at track 16, which is also what this playlist does to your brain at 2 a.m."],
    [24, "Cat's in the Cradle", "Harry Chapin walks into a party between Ed Sheeran and Marshmello like somebody's dad came to pick everyone up. Best surprise on the list."],
    [23, "Castle on the Hill", "Ed Sheeran, then Harry Chapin, then Marshmello. The transitions are a crime, and I would like to see them again."],
    [2, "Hands Down", "Dashboard Confessional is either excellent taste or a very well-hidden diary. The jury is on lunch."],
    [34, "Snuff", "Slipknot, right before Fort Minor, right before a track by something called Swedish Jam Factory. Three people, one steering wheel."],
    [37, "Fallen", "Volbeat shows up out of nowhere, nods once, and leaves. Pure professionalism."],
    [18, "Levels", "The playlist opens a window and the whole room exhales. Avicii has been doing this for years."],
    [22, "It Ain't Me", "A Kygo song, remixed by Tiësto, with Selena Gomez, on a playlist that also has Slipknot. That is called range."],
    [40, "Scenario", "After thirty-nine songs of emotional weather, A Tribe Called Quest arrives wearing sunglasses like it never heard any of it. The best song here, and it knows."],
    [39, "WITHOUT YOU", "The Kid LAROI and Miley Cyrus, one track before the playlist ends on a hip-hop classic. Nobody warned the Tribe."],
    [5, "Bad Things", "Machine Gun Kelly and Camila Cabello. Track 5, and the playlist is already telling you who is in charge."]
  ];
  var card = function (x, i) {
    var t = by(x[0]);
    return '<article class="card"><span class="tag">EXHIBIT ' + String(i + 1).padStart(2, "0") + '</span><h3>' + esc(mask(t ? t.title : x[1])) +
      '</h3><p class="by">' + esc(t ? t.artist : "") + ", track " + x[0] + '</p><p class="r">' + esc(x[2]) + "</p></article>";
  };
  var last = -1;
  $("roll").onclick = function () {
    var i; do { i = Math.floor(Math.random() * X.length); } while (i === last && X.length > 1);
    last = i;
    var el = $("exhibit");
    el.className = "exhibit";
    el.innerHTML = card(X[i], i).replace(/^<article class="card">/, "").replace(/<\/article>$/, "");
    void el.offsetWidth; el.classList.add("pop");
  };
  $("all").onclick = function () {
    var box = $("exhibits");
    box.hidden = !box.hidden;
    $("all").textContent = box.hidden ? "Show all exhibits" : "Hide the exhibits";
    if (!box.innerHTML) box.innerHTML = X.map(card).join("");
  };
  $("roll").click();

  // ---- the break-up department: titles that are about someone leaving ----
  var leaving = [
    [4, "A farewell, with Halsey."],
    [7, "A goodbye, with a feature. Very organized."],
    [10, "Another Machine Gun Kelly track, staying on theme."],
    [11, "The title does not leave room for interpretation."],
    [35, "Somebody is asking where somebody went."],
    [39, "The title is the whole song."]
  ];
  $("leaving").innerHTML = leaving.map(function (l) {
    var t = by(l[0]);
    return "<li><b>" + esc(mask(t.title)) + "</b> <em>" + esc(t.artist) + ".</em> " + esc(l[1]) + "</li>";
  }).join("");

  // ---- the player ----
  $("embed").src = "https://open.spotify.com/embed/playlist/" + (window.PLAYLIST_ID || "") + "?utm_source=generator&theme=0";
})();
