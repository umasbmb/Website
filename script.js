/* ============================================================================
UMICH ASBMB — INTERACTIVITY

============================================================================ */
(function(){
  var $=function(s){
    return document.querySelector(s)
  },$$=function(s){
    return [].slice.call(document.querySelectorAll(s))
  };
  // Navigation: mobile menu and light/dark theme
  $('#burger').onclick = function () {
    const isOpen = $('#menu').classList.toggle('open');
    $('#burger').setAttribute('aria-expanded', String(isOpen));
  };
  $$('#menu a').forEach(function(a) {
    a.onclick = function () {
      $('#menu').classList.remove('open');
      $('#burger').setAttribute('aria-expanded', 'false');
    };
  });
  // Remember theme preference on future visits.
  var storedTheme = localStorage.getItem('asbmb-theme');
  if (storedTheme) document.documentElement.setAttribute('data-theme', storedTheme);
  $('#theme').onclick = function () {
    var d = document.documentElement;
    var isDark = getComputedStyle(d).colorScheme === 'dark';
    var nextTheme = isDark ? 'light' : 'dark';
    d.setAttribute('data-theme', nextTheme);
    localStorage.setItem('asbmb-theme', nextTheme);
  };
  // Scroll animations: reveal elements and highlight active section
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting)e.target.classList.add('in')
    })
  },{
    threshold:.15
  });
  $$('.rv').forEach(function(e){
    io.observe(e)
  });
  var links=$$('nav a.l'),so=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting)links.forEach(function(l){
        l.classList.toggle('act',l.getAttribute('href')==='#'+e.target.id)
      })
    })
  },{
    rootMargin:'-45% 0px -50% 0px'
  });
  $$('section.s').forEach(function(s){
    so.observe(s)
  });
  /* ==========================================================================
     UPCOMING CALENDAR
     --------------------------------------------------------------------------
     Instructions for if you guys need to edit: add, change, or delete entries in the events list below.
     Each event sits between { and } and is followed by a comma.

       date:      'YYYY-MM-DD'   required, e.g. '2026-11-05'
       endDate:   'YYYY-MM-DD'   optional, for things that last several days
       startTime: '6:00 pm'      optional, leave out for all-day items
       endTime:   '7:30 pm'      optional
       title:     the name of the event
       type:      'meeting', 'social', 'big', 'deadline', or 'campus'
       place:     where it happens (optional)
       note:      one short sentence (optional)
       link:      a web address for RSVP or more info (optional)
       linkText:  the label for that link button (optional)
       tbd:       true   shows a "Details coming" tag. Delete this line
                    once the plan is set.
     Meetings and socials without their own time or place use the MEETING
     settings just below.

     Order does not matter, the calendar sorts itself. Past events disappear
     automatically the day after they end.
     ========================================================================== */

  var MEETING = { startTime: '2:00 pm', endTime: '3:00 pm', place: 'Mason Hall, Room 3300' };

  var EVENTS = [
    { date: '2026-10-18', endDate: '2026-10-20', title: 'Fall Break', type: 'campus',
      note: 'No chapter meeting Sunday, and no classes Monday and Tuesday.' },

    { date: '2026-10-25', title: 'Grad Student Talk with Quinn', type: 'meeting',
      note: 'What the grad school process is like.' },

    { date: '2026-10-30', title: 'ASBMB 2027 Annual Meeting: early decision abstracts due', type: 'deadline',
      note: 'Submit by this date to hear back by Nov. 12.',
      link: 'https://www.asbmb.org/annual-meeting/abstracts', linkText: 'Abstract info' },

    { date: '2026-11-01', title: 'Halloween Meeting', type: 'social',
      note: 'Something super spooky is in the works.', tbd: true },

    { date: '2026-11-08', title: 'Scientific Communication with Valeria', type: 'meeting',
      note: 'Details are in the works.' },

    { date: '2026-11-15', title: 'Scientific Abstracts and Applications with Sydnie', type: 'meeting',
      note: 'Perfect timing for the Dec. 8 ASBMB abstract deadline.' },

    { date: '2026-11-22', title: 'Industry: Seqhub with Sydnie', type: 'meeting',
      note: 'An industry session.' },

    { date: '2026-11-25', endDate: '2026-11-29', title: 'Thanksgiving Recess', type: 'campus',
      note: 'No classes and no chapter meeting Sunday. Happy Thanksgiving!' },

    { date: '2026-12-01', title: 'ASBMB conference registration opens', type: 'deadline',
      note: 'Register early for the 2027 ASBMB Annual Meeting.',
      link: 'https://www.asbmb.org/annual-meeting/registration', linkText: 'Registration info' },

    { date: '2026-12-06', title: 'Bring a Friend! with Anthony', type: 'social',
      note: 'Bring a friend who is not in the club yet. Workshop, food, and drinks.' },

    { date: '2026-12-08', title: 'ASBMB 2027 Annual Meeting: regular abstracts due', type: 'deadline',
      note: 'Abstracts are reviewed for talks or posters.',
      link: 'https://www.asbmb.org/annual-meeting/abstracts', linkText: 'Abstract info' },

    { date: '2026-12-14', endDate: '2026-12-18', title: 'Final Exams', type: 'campus',
      note: 'Good luck, everyone!' }
  ];

  // Labels for each event type (also used for the filter buttons).
  var TYPES = {
    meeting:  { label: 'Meetings',   one: 'Meeting' },
    social:   { label: 'Socials',    one: 'Social' },
    big:      { label: 'Big Events', one: 'Big Event' },
    deadline: { label: 'Key Dates',  one: 'Key Date' },
    campus:   { label: 'Campus',     one: 'Campus' }
  };

  (function calendar() {
    var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
      });
    }
    function parseDate(s) { var p = String(s).split('-'); return new Date(+p[0], p[1] - 1, +p[2]); }
    function dayKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function ymd(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); }
    function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }

    // Turns '6:00 pm' into minutes after midnight (or -1 if missing).
    function toMin(t) {
      var m = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i.exec(t || '');
      if (!m) return -1;
      var h = +m[1] % 12, min = +(m[2] || 0);
      if (m[3] && m[3].toLowerCase() === 'pm') h += 12;
      if (!m[3] && +m[1] === 12) h = 12;
      return h * 60 + min;
    }
    function hms(min) { return pad(Math.floor(min / 60) % 24) + pad(min % 60) + '00'; }

    var today = new Date(); today.setHours(0, 0, 0, 0);

    var all = EVENTS.map(function (e, i) {
      var s = parseDate(e.date), en = e.endDate ? parseDate(e.endDate) : s;
      if ((e.type === 'meeting' || e.type === 'social') && !e.endDate) {
        e = Object.assign({}, e);
        if (!e.startTime && MEETING.startTime) { e.startTime = MEETING.startTime; if (!e.endTime) e.endTime = MEETING.endTime; }
        if (!e.place && MEETING.place) e.place = MEETING.place;
      }
      return { e: e, start: s, end: en < s ? s : en, id: 'ev-' + i, type: TYPES[e.type] ? e.type : 'meeting' };
    }).filter(function (x) { return x.end >= today; })
      .sort(function (a, b) { return (a.start - b.start) || (toMin(a.e.startTime) - toMin(b.e.startTime)); });

    var filter = 'all', selected = null;
    function visible() { return all.filter(function (x) { return filter === 'all' || x.type === filter; }); }

    // Google Calendar "add event" link
    function gcal(x) {
      var e = x.e, st = toMin(e.startTime), dates;
      if (st < 0) {
        dates = ymd(x.start) + '/' + ymd(addDays(x.end, 1));
      } else {
        var et = toMin(e.endTime); if (et <= st) et = st + 60;
        dates = ymd(x.start) + 'T' + hms(st) + '/' + ymd(x.start) + 'T' + hms(et);
      }
      var details = (e.note || '') + (e.link ? '\n' + e.link : '');
      return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
        '&text=' + encodeURIComponent(e.title) + '&dates=' + dates + '&ctz=America/Detroit' +
        (e.place ? '&location=' + encodeURIComponent(e.place) : '') +
        (details ? '&details=' + encodeURIComponent(details) : '');
    }

    function whenText(x) {
      var e = x.e, s = x.start, en = x.end, out;
      if (+s === +en) {
        out = DOW[s.getDay()] + ', ' + MONTHS[s.getMonth()].slice(0, 3) + ' ' + s.getDate();
      } else if (s.getMonth() === en.getMonth()) {
        out = MONTHS[s.getMonth()].slice(0, 3) + ' ' + s.getDate() + ' to ' + en.getDate();
      } else {
        out = MONTHS[s.getMonth()].slice(0, 3) + ' ' + s.getDate() + ' to ' + MONTHS[en.getMonth()].slice(0, 3) + ' ' + en.getDate();
      }
      if (e.startTime) out += ' · ' + e.startTime + (e.endTime ? ' to ' + e.endTime : '');
      else if (x.type !== 'meeting' && x.type !== 'social') out += ' · All day';
      return out;
    }

    // Filter bttns
    var fwrap = $('#cal-filters');
    var fhtml = '<button type="button" class="chip" data-f="all" aria-pressed="true">All</button>';
    Object.keys(TYPES).forEach(function (k) {
      if (!all.some(function (x) { return x.type === k; })) return;
      fhtml += '<button type="button" class="chip t-' + k + '" data-f="' + k + '" aria-pressed="false"><i></i>' + TYPES[k].label + '</button>';
    });
    fwrap.innerHTML = fhtml;
    fwrap.onclick = function (ev) {
      var b = ev.target.closest('.chip'); if (!b) return;
      filter = b.getAttribute('data-f'); selected = null;
      $$('#cal-filters .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
      renderGrid(); renderList();
    };

    // Agenda list
    function renderList() {
      var items = visible(), box = $('#agenda');
      if (!items.length) {
        box.innerHTML = '<p class="cal-empty">Nothing on the calendar here yet. Follow us on social media to hear first!</p>';
        return;
      }
      var html = '', lastMonth = '';
      items.forEach(function (x, i) {
        var e = x.e, t = TYPES[x.type], s = x.start;
        var mLabel = MONTHS[s.getMonth()] + ' ' + s.getFullYear();
        if (mLabel !== lastMonth) { html += '<h3 class="mo">' + mLabel + '</h3>'; lastMonth = mLabel; }
        var sub = +x.start === +x.end ? DOW[s.getDay()] : 'to ' + (x.end.getMonth() !== s.getMonth() ? MONTHS[x.end.getMonth()].slice(0, 3) + ' ' : '') + x.end.getDate();
        html += '<article class="ev t-' + x.type + '" id="' + x.id + '" tabindex="-1">' +
          '<div class="ev-date"><span>' + MONTHS[s.getMonth()].slice(0, 3) + '</span><b>' + s.getDate() + '</b><span>' + sub + '</span></div>' +
          '<div class="ev-body"><div class="ev-tags"><span class="pill t-' + x.type + '">' + t.one + '</span>' +
          (i === 0 ? '<span class="pill next">Next up</span>' : '') +
          (e.tbd || e.sample ? '<span class="pill sample">Details coming</span>' : '') + '</div>' +
          '<h4>' + esc(e.title) + '</h4>' +
          '<p class="ev-meta">' + esc(whenText(x)) + (e.place ? '<br>' + esc(e.place) : '') + '</p>' +
          (e.note ? '<p class="ev-note">' + esc(e.note) + '</p>' : '') +
          '<div class="ev-actions"><a class="ev-btn" href="' + esc(gcal(x)) + '" target="_blank" rel="noopener">+ Add to calendar</a>' +
          (e.link ? '<a class="ev-btn" href="' + esc(e.link) + '" target="_blank" rel="noopener">' + esc(e.linkText || 'More info') + '</a>' : '') +
          '</div></div></article>';
      });
      box.innerHTML = html;
    }

    // Month grid
    var firstMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    var lastEnd = all.reduce(function (m, x) { return x.end > m ? x.end : m; }, today);
    var lastMonthDate = new Date(lastEnd.getFullYear(), lastEnd.getMonth(), 1);
    var view = new Date(firstMonth);

    function renderGrid() {
      $('#cal-title').textContent = MONTHS[view.getMonth()] + ' ' + view.getFullYear();
      $('#cal-prev').disabled = view <= firstMonth;
      $('#cal-next').disabled = view >= lastMonthDate;
      var map = {};
      visible().forEach(function (x) {
        for (var d = new Date(x.start); d <= x.end; d = addDays(d, 1)) {
          var k = dayKey(d); (map[k] = map[k] || []).push(x);
        }
      });
      var html = DOW.map(function (d) { return '<span class="dow">' + d.charAt(0) + '</span>'; }).join('');
      for (var b = 0; b < view.getDay(); b++) html += '<span></span>';
      var days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      for (var n = 1; n <= days; n++) {
        var d = new Date(view.getFullYear(), view.getMonth(), n), k = dayKey(d), evs = map[k] || [];
        var cls = 'day' + (evs.length ? ' has' : '') + (d < today ? ' past' : '') + (+d === +today ? ' today' : '') + (selected === k ? ' sel' : '');
        var seen = {}, dots = '';
        evs.forEach(function (x) { if (!seen[x.type] && Object.keys(seen).length < 3) { seen[x.type] = 1; dots += '<i class="t-' + x.type + '"></i>'; } });
        var label = MONTHS[d.getMonth()] + ' ' + n + (evs.length ? ': ' + evs.map(function (x) { return x.e.title; }).join(', ') : '');
        html += '<button type="button" class="' + cls + '" data-k="' + k + '"' + (evs.length ? '' : ' tabindex="-1" disabled') +
          ' aria-label="' + esc(label) + '" title="' + esc(label) + '"><span>' + n + '</span><span class="dots">' + dots + '</span></button>';
      }
      $('#cal-grid').innerHTML = html;
    }

    $('#cal-prev').onclick = function () { view.setMonth(view.getMonth() - 1); renderGrid(); };
    $('#cal-next').onclick = function () { view.setMonth(view.getMonth() + 1); renderGrid(); };
    $('#cal-grid').onclick = function (ev) {
      var b = ev.target.closest('.day.has'); if (!b) return;
      selected = b.getAttribute('data-k'); renderGrid();
      var d = parseDate(selected);
      var hit = visible().filter(function (x) { return x.start <= d && x.end >= d; })[0];
      var el = hit && document.getElementById(hit.id);
      if (!el) return;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
      el.focus({ preventScroll: true });
    };

    renderGrid();
    renderList();
  })();
  /* ==========================================================================
     PHOTO GALLERY
     --------------------------------------------------------------------------
     How to add more photos:
       1. Put the photo in your "images" folder (jpg, png, gif, or webp).
       2. Add its name to the list below, in quotes, followed by a comma.


     Captions are optional. Add one after a | sign, like this:
       'images/festifall.jpg | Festifall 2026',

     Photos appear in the order that they are listed. Any photo that can't be found is
     simply skipped.
     ========================================================================== */
  var PHOTOS = [
    'images/group-photo.jpg | E-Board Members'
  ];

  (function gallery() {
    var SHOW_FIRST = 12;   // how many photos show before the "Show more" button
    var grid = $('#gallery-grid'), more = $('#gallery-more'), empty = $('#gallery-empty');
    var lb = $('#lb'), lbImg = $('#lb-img'), lbCap = $('#lb-cap'), lbCount = $('#lb-count');
    var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
    var finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;

    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
      });
    }
    // Turns a Google Drive shared link into a direct image link (if needed but not in current website)
    function toSrc(s) {
      var m = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/.exec(s);
      return m ? 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w2000' : s;
    }

    var items = PHOTOS.map(function (p) {
      var parts = String(p).split('|');
      return { src: toSrc(parts[0].trim()), cap: (parts[1] || '').trim(), ok: true };
    }).filter(function (x) { return x.src; });

    function good() { return items.filter(function (x) { return x.ok; }); }

    function refresh() {
      var tiles = $$('#gallery-grid .gtile');
      tiles.forEach(function (t, n) { t.classList.toggle('extra', n >= SHOW_FIRST); });
      more.hidden = grid.classList.contains('all') || tiles.length <= SHOW_FIRST;
      empty.hidden = tiles.length > 0;
      grid.setAttribute('data-count', tiles.length < 3 ? tiles.length : 'many');
    }

    grid.innerHTML = items.map(function (x, i) {
      var label = x.cap || 'Chapter photo ' + (i + 1);
      return '<button type="button" class="gtile" data-i="' + i + '" style="animation-delay:' + (Math.min(i, 12) * 60) + 'ms" aria-label="Open photo: ' + esc(label) + '">' +
        '<img src="' + esc(x.src) + '" alt="' + esc(label) + '" loading="lazy" referrerpolicy="no-referrer">' +
        (x.cap ? '<span class="gcap">' + esc(x.cap) + '</span>' : '') + '</button>';
    }).join('');

    // Skip any photo that doesn't load in 
    $$('#gallery-grid .gtile img').forEach(function (img) {
      img.onerror = function () {
        var t = img.closest('.gtile');
        items[+t.getAttribute('data-i')].ok = false;
        t.remove();
        refresh();
      };
    });
    refresh();

    more.onclick = function () { grid.classList.add('all'); refresh(); };

    //  3D tilt that follows the mouse, only for desktop does not work on phone 
    if (finePointer && !reduce) {
      grid.addEventListener('pointermove', function (e) {
        var t = e.target.closest('.gtile'); if (!t) return;
        var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        t.style.transform = 'perspective(700px) rotateY(' + x * 8 + 'deg) rotateX(' + (-y * 8) + 'deg) translateY(-3px)';
      });
      grid.addEventListener('pointerout', function (e) {
        var t = e.target.closest('.gtile');
        if (t && !t.contains(e.relatedTarget)) t.style.transform = '';
      });
    }

    // Full screen view
    var current = 0, lastFocus = null;
    function show(i) {
      var list = good(); if (!list.length) return;
      current = (i + list.length) % list.length;
      var x = list[current];
      lbImg.classList.add('swap');
      setTimeout(function () {
        lbImg.src = x.src;
        lbImg.alt = x.cap || 'Chapter photo';
        lbCap.textContent = x.cap;
        lbCount.textContent = (current + 1) + ' of ' + list.length;
        lbImg.classList.remove('swap');
      }, reduce ? 0 : 140);
      var multi = list.length > 1;
      $('#lb-prev').hidden = !multi; $('#lb-next').hidden = !multi;
    }
    function open(item) {
      lastFocus = document.activeElement;
      lb.hidden = false;
      document.documentElement.classList.add('lb-open');
      show(good().indexOf(item));
      $('#lb-close').focus();
    }
    function close() {
      lb.hidden = true;
      document.documentElement.classList.remove('lb-open');
      if (lastFocus) lastFocus.focus();
    }

    grid.onclick = function (e) {
      var t = e.target.closest('.gtile'); if (!t) return;
      open(items[+t.getAttribute('data-i')]);
    };
    $('#lb-prev').onclick = function () { show(current - 1); };
    $('#lb-next').onclick = function () { show(current + 1); };
    $('#lb-close').onclick = close;
    lb.onclick = function (e) { if (e.target === lb || e.target.tagName === 'FIGURE') close(); };
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
      else if (e.key === 'Tab') {   // keep keyboard focus inside the viewer
        var f = $$('#lb button:not([hidden])'), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // Swipe left or right on phones
    var sx = null, sy = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();   // swipe down to close
      sx = sy = null;
    });
  })();
  // Contact: "Copy" button next to the email address.
  // Helpful for visitors whose computer has no email app set up.
  (function copyEmail() {
    var btn = $('#copy-email'), addr = $('#contact-address');
    if (!btn || !addr) return;
    function done(ok) {
      btn.textContent = ok ? 'Copied!' : 'Press Ctrl+C';
      btn.classList.add('copied');
      setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    }
    function fallback(text) {
      var t = document.createElement('textarea');
      t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(t); done(ok);
    }
    btn.onclick = function () {
      var text = addr.textContent.trim();
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(text); });
      } else { fallback(text); }
    };
  })();
  // Scroll progress + back-to-top
  function updateScrollUI() {
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    $('#scroll-progress').style.width = progress + '%';
    $('#back-to-top').classList.toggle('visible', window.scrollY > 480);
  }
  window.addEventListener('scroll', updateScrollUI, {
    passive: true
  });
  $('#back-to-top').onclick = function () {
    window.scrollTo({
      top: 0, behavior: 'smooth'
    });
  };
  updateScrollUI();
  // Interactive molecule canvas
  var cv=$('#cv'),c=cv.getContext('2d'),W,H,dpr=Math.min(devicePixelRatio||1,2),atoms=[],bits=[],m={
    x:-999,y:-999
  };
  var cols=['#0960AB','#4aa3f0','#93c9f9','#2b7fd0'];
  function size(){
    var r=cv.parentNode.getBoundingClientRect();
    W=r.width;
    H=r.height;
    cv.width=W*dpr;
    cv.height=H*dpr;
    c.setTransform(dpr,0,0,dpr,0,0);
    var n=Math.round(W*H/16000);
    while(atoms.length<n)atoms.push(mk(Math.random()*W,Math.random()*H));
    atoms.length=n
  }
  function mk(x,y){
    return{
      x:x,y:y,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5,r:4+Math.random()*7,c:cols[Math.random()*4|0]
    }
  }
  function hex(x,y,r){
    c.beginPath();
    for(var i=0;
    i<6;
    i++){
      var a=i*Math.PI/3;
      c.lineTo(x+r*Math.cos(a),y+r*Math.sin(a))
    }c.closePath()
  }
  cv.addEventListener('pointermove',function(e){
    var r=cv.getBoundingClientRect();
    m.x=e.clientX-r.left;
    m.y=e.clientY-r.top
  });
  cv.addEventListener('pointerleave',function(){
    m.x=m.y=-999
  });
  cv.addEventListener('pointerdown',function(e){
    var r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    for(var i=0;
    i<14;
    i++){
      var a=Math.random()*6.28,s=1+Math.random()*3;
      bits.push({
        x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:3+Math.random()*6,c:cols[i%4],l:1,h:i%3===0
      })
    }
    if(atoms.length<140)atoms.push(mk(x,y))
  });
  function ink(){
    return getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()
  }
  function tick(){
    c.clearRect(0,0,W,H);
    var bc=ink();
    atoms.forEach(function(a){
      var dx=a.x-m.x,dy=a.y-m.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<130&&d>0){
        a.vx+=dx/d*.12;
        a.vy+=dy/d*.12
      }
      a.vx*=.985;
      a.vy*=.985;
      a.x+=a.vx;
      a.y+=a.vy;
      if(a.x<0||a.x>W)a.vx*=-1;
      if(a.y<0||a.y>H)a.vy*=-1;
      if(Math.abs(a.vx)+Math.abs(a.vy)<.15){
        a.vx+=(Math.random()-.5)*.05;
        a.vy+=(Math.random()-.5)*.05
      }
    });
    c.lineWidth=1.5;
    c.strokeStyle=bc;
    for(var i=0;
    i<atoms.length;
    i++)for(var j=i+1;
    j<atoms.length;
    j++){
      var a=atoms[i],b=atoms[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<100){
        c.globalAlpha=(1-d/100)*.5;
        c.beginPath();
        c.moveTo(a.x,a.y);
        c.lineTo(b.x,b.y);
        c.stroke()
      }
    }
    c.globalAlpha=.85;
    atoms.forEach(function(a){
      c.fillStyle=a.c;
      c.beginPath();
      c.arc(a.x,a.y,a.r,0,6.28);
      c.fill()
    });
    bits=bits.filter(function(p){
      return p.l>0
    });
    bits.forEach(function(p){
      p.x+=p.vx;
      p.y+=p.vy;
      p.vx*=.96;
      p.vy*=.96;
      p.l-=.02;
      c.globalAlpha=Math.max(p.l,0);
      c.fillStyle=p.c;
      if(p.h){
        hex(p.x,p.y,p.r);
        c.fill()
      }else{
        c.beginPath();
        c.arc(p.x,p.y,p.r,0,6.28);
        c.fill()
      }
    });
    c.globalAlpha=1;
    if(!document.hidden)raf=requestAnimationFrame(tick);
  }
  var raf;
  size();
  addEventListener('resize',size);
  if(!matchMedia('(prefers-reduced-motion:reduce)').matches){
    raf=requestAnimationFrame(tick);
    document.addEventListener('visibilitychange',function(){
      if(!document.hidden){
        cancelAnimationFrame(raf);
        raf=requestAnimationFrame(tick)
      }
    })
  }
  else{
    atoms.forEach(function(a){
      c.fillStyle=a.c;
      c.beginPath();
      c.arc(a.x,a.y,a.r,0,6.28);
      c.fill()
    })
  }
})();
