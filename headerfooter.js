// ================================================================
//  HOW TO ADD THE CHATBOT TO headerfooter.js
//  ----------------------------------------------------------------
//  OPTION A (Easiest): Upload your headerfooter.js to this chat
//  and Claude will do the merge for you automatically.
//
//  OPTION B: Follow the 3 steps below yourself.
// ================================================================
//
//  STEP 1 ── Open headerfooter.js in VS Code
//  STEP 2 ── Scroll to the VERY BOTTOM of the file
//  STEP 3 ── Paste EVERYTHING below the dashed line at the bottom
// ================================================================


// ----------------------------------------------------------------
//  PASTE THIS ENTIRE BLOCK AT THE BOTTOM OF YOUR headerfooter.js
// ----------------------------------------------------------------

(function injectCFRChatbot() {

  // ── 1. STYLES ──────────────────────────────────────────────────
  var css = document.createElement('style');
  css.textContent = `
#cfr-bubble-wrap{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;gap:10px}
#cfr-bubble-label{background:#1E2030;color:#e2e8f0;font-family:"Segoe UI",Roboto,sans-serif;font-size:13px;font-weight:600;padding:8px 14px;border-radius:20px;border:1px solid rgba(92,92,253,.35);box-shadow:0 4px 18px rgba(0,0,0,.45);white-space:nowrap;animation:cfrLabelBob 3s ease-in-out infinite;cursor:pointer}
@keyframes cfrLabelBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
#cfr-bubble{width:64px;height:64px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#5C5CFD 0%,#4ECDC4 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(92,92,253,.18),0 0 0 12px rgba(92,92,253,.07),0 6px 24px rgba(92,92,253,.55);transition:transform .22s ease,box-shadow .22s ease;position:relative;animation:cfrRingPulse 2.4s ease-in-out infinite}
@keyframes cfrRingPulse{0%,100%{box-shadow:0 0 0 6px rgba(92,92,253,.18),0 0 0 12px rgba(92,92,253,.07),0 6px 24px rgba(92,92,253,.55)}50%{box-shadow:0 0 0 10px rgba(92,92,253,.12),0 0 0 20px rgba(92,92,253,.04),0 8px 30px rgba(92,92,253,.65)}}
#cfr-bubble:hover{transform:scale(1.1);box-shadow:0 0 0 14px rgba(92,92,253,.1),0 8px 32px rgba(92,92,253,.7);animation:none}
#cfr-bubble svg{width:30px;height:30px;fill:#fff}
#cfr-bubble-notif{position:absolute;top:2px;right:2px;width:16px;height:16px;background:#FF6B6B;border-radius:50%;border:2.5px solid #151719;animation:cfrNotifPop .6s ease forwards,cfrNotifPulse 1.8s ease-in-out 1s infinite}
@keyframes cfrNotifPop{from{transform:scale(0)}to{transform:scale(1)}}
@keyframes cfrNotifPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,107,107,.7)}50%{box-shadow:0 0 0 6px rgba(255,107,107,0)}}
#cfr-teaser{position:fixed;bottom:108px;right:28px;background:#1E2030;color:#e2e8f0;font-family:"Segoe UI",Roboto,sans-serif;font-size:13.5px;line-height:1.55;padding:13px 16px;border-radius:16px 16px 4px 16px;border:1px solid rgba(92,92,253,.3);box-shadow:0 10px 36px rgba(0,0,0,.55);max-width:220px;z-index:9997;display:none;animation:cfrFadeUp .4s ease;cursor:pointer}
#cfr-teaser strong{color:#9b9bfd}
#cfr-teaser-dismiss{display:block;margin-top:8px;font-size:11.5px;color:#64748b;cursor:pointer}
#cfr-teaser-dismiss:hover{color:#94a3b8}
#cfr-win{position:fixed;bottom:108px;right:24px;width:375px;max-width:calc(100vw - 20px);background:#151719;border-radius:22px;border:1px solid rgba(92,92,253,.22);box-shadow:0 28px 70px rgba(0,0,0,.7);display:none;flex-direction:column;overflow:hidden;z-index:9998;font-family:"Segoe UI",Roboto,sans-serif}
#cfr-win.cfr-open{display:flex;animation:cfrFadeUp .28s ease}
@keyframes cfrFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.cfr-hd{background:linear-gradient(135deg,#5C5CFD,#4ECDC4);padding:13px 16px;display:flex;align-items:center;gap:11px}
.cfr-hd-av{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.cfr-hd-info{flex:1}
.cfr-hd-name{font-size:14px;font-weight:700;color:#fff}
.cfr-hd-sub{font-size:11px;color:rgba(255,255,255,.82);margin-top:2px;display:flex;align-items:center;gap:5px}
.cfr-hd-sub::before{content:'';width:7px;height:7px;background:#4ade80;border-radius:50%;display:inline-block}
.cfr-x{background:none;border:none;color:rgba(255,255,255,.85);font-size:23px;cursor:pointer;padding:0 3px;line-height:1}
.cfr-x:hover{color:#fff}
.cfr-msgs{overflow-y:auto;padding:13px 12px;display:flex;flex-direction:column;gap:9px;max-height:370px;min-height:180px;background:#151719;scroll-behavior:smooth}
.cfr-m{max-width:88%;padding:10px 14px;border-radius:18px;font-size:13.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word}
.cfr-m.bot{background:#1E2030;color:#e2e8f0;border-radius:4px 18px 18px 18px;align-self:flex-start;border:1px solid rgba(255,255,255,.05)}
.cfr-m.user{background:linear-gradient(135deg,#5C5CFD,#4ECDC4);color:#fff;border-radius:18px 4px 18px 18px;align-self:flex-end}
.cfr-chips{display:flex;flex-wrap:wrap;gap:7px;align-self:flex-start;max-width:96%}
.cfr-chip{background:transparent;border:1px solid rgba(92,92,253,.45);color:#9b9bfd;border-radius:99px;padding:6px 14px;font-size:12.5px;cursor:pointer;transition:all .18s;font-family:inherit}
.cfr-chip:hover{background:rgba(92,92,253,.18);color:#fff;border-color:#5C5CFD}
.cfr-btn-row{display:flex;flex-direction:column;gap:7px;align-self:flex-start;width:94%}
.cfr-btn{background:#1E2030;border:1px solid rgba(92,92,253,.35);color:#e2e8f0;border-radius:13px;padding:10px 14px;font-size:13px;cursor:pointer;text-align:left;transition:all .18s;font-family:inherit;display:flex;align-items:center;gap:10px}
.cfr-btn:hover{background:rgba(92,92,253,.15);border-color:#5C5CFD}
.cfr-btn.primary{background:linear-gradient(135deg,#5C5CFD,#4ECDC4);color:#fff;border-color:transparent}
.cfr-btn.primary:hover{opacity:.88}
.cfr-btn.wa{border-color:#25D366;color:#4ade80}
.cfr-btn.wa:hover{background:rgba(37,211,102,.1)}
.cfr-btn.sms{border-color:#4ECDC4;color:#4ECDC4}
.cfr-btn.sms:hover{background:rgba(78,205,196,.1)}
.cfr-btn.email{border-color:#f59e0b;color:#fbbf24}
.cfr-btn.email:hover{background:rgba(245,158,11,.1)}
.cfr-btn.back{border-color:rgba(255,255,255,.1);color:#64748b}
.cfr-btn.back:hover{color:#94a3b8;background:rgba(255,255,255,.04)}
.cfr-btn .bi{font-size:17px;flex-shrink:0}
.cfr-typing{display:flex;align-items:center;gap:5px;padding:11px 15px;background:#1E2030;border-radius:4px 18px 18px 18px;align-self:flex-start;border:1px solid rgba(255,255,255,.05)}
.cfr-typing span{width:7px;height:7px;background:#94a3b8;border-radius:50%;animation:cfrDot 1.2s infinite}
.cfr-typing span:nth-child(2){animation-delay:.2s}
.cfr-typing span:nth-child(3){animation-delay:.4s}
@keyframes cfrDot{0%,80%,100%{opacity:.25;transform:scale(.9)}40%{opacity:1;transform:scale(1.1)}}
.cfr-form-panel{background:#1E2030;border-radius:14px;padding:14px;border:1px solid rgba(92,92,253,.2);align-self:flex-start;width:94%;display:flex;flex-direction:column;gap:10px}
.cfr-form-panel label{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:3px}
.cfr-form-panel input,.cfr-form-panel select,.cfr-form-panel textarea{width:100%;background:#151719;border:1px solid rgba(92,92,253,.22);border-radius:9px;padding:8px 11px;font-size:13px;color:#e2e8f0;font-family:inherit;outline:none;box-sizing:border-box}
.cfr-form-panel input:focus,.cfr-form-panel textarea:focus{border-color:#5C5CFD}
.cfr-form-panel select option{background:#1E2030}
.cfr-form-panel textarea{resize:vertical;min-height:68px}
.cfr-form-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.cfr-form-note{font-size:11px;color:#64748b}
.cfr-form-submit{background:linear-gradient(135deg,#5C5CFD,#4ECDC4);color:#fff;border:none;border-radius:10px;padding:10px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .2s}
.cfr-form-submit:hover{opacity:.88}
.cfr-form-submit:disabled{opacity:.45;cursor:not-allowed}
.cfr-bar{display:flex;gap:8px;padding:10px 12px;background:#1B1C27;border-top:1px solid rgba(255,255,255,.06)}
.cfr-in{flex:1;background:#151719;border:1px solid rgba(92,92,253,.22);border-radius:11px;padding:9px 13px;font-size:13.5px;color:#e2e8f0;outline:none;font-family:inherit}
.cfr-in:focus{border-color:#5C5CFD}
.cfr-in::placeholder{color:#475569}
.cfr-go{background:linear-gradient(135deg,#5C5CFD,#4ECDC4);border:none;border-radius:11px;padding:9px 15px;color:#fff;font-size:15px;cursor:pointer;transition:opacity .2s}
.cfr-go:hover{opacity:.88}
@media(max-width:480px){#cfr-win{bottom:0;right:0;width:100vw;max-width:100vw;border-radius:20px 20px 0 0}#cfr-bubble-wrap{bottom:16px;right:14px}#cfr-teaser{right:14px;bottom:106px}}
  `;
  document.head.appendChild(css);

  // ── 2. HTML ────────────────────────────────────────────────────
  var html = document.createElement('div');
  html.innerHTML = `
    <div id="cfr-teaser" onclick="cfrOpen()">
      👋 Equipment acting up?<br>
      <strong>We're online &amp; ready to help!</strong>
      <span id="cfr-teaser-dismiss"
        onclick="event.stopPropagation();
                 document.getElementById('cfr-teaser').style.display='none';
                 sessionStorage.setItem('cfrTeaserDismissed','1')">
        No thanks
      </span>
    </div>

    <div id="cfr-bubble-wrap">
      <div id="cfr-bubble-label" onclick="cfrOpen()">💬 Chat with us — we're online!</div>
      <button id="cfr-bubble" onclick="cfrOpen()" aria-label="Open chat">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.02 2 11c0 2.68 1.15 5.09 3 6.79V22l4.44-2.22A10.5 10.5 0 0012 20c5.52 0 10-4.02 10-9S17.52 2 12 2z"/></svg>
        <span id="cfr-bubble-notif"></span>
      </button>
    </div>

    <div id="cfr-win" role="dialog" aria-label="Chat with Canadian Fitness Repair">
      <div class="cfr-hd">
        <div class="cfr-hd-av">🔧</div>
        <div class="cfr-hd-info">
          <div class="cfr-hd-name">Canadian Fitness Repair</div>
          <div class="cfr-hd-sub">Online now · replies instantly</div>
        </div>
        <button class="cfr-x" onclick="cfrClose()" aria-label="Close">×</button>
      </div>
      <div class="cfr-msgs" id="cfrMsgs"></div>
      <div class="cfr-bar">
        <input id="cfrIn" class="cfr-in" placeholder="Type a message…"
          onkeydown="if(event.key==='Enter')cfrSend()" aria-label="Message" />
        <button class="cfr-go" onclick="cfrSend()">➤</button>
      </div>
    </div>
  `;
  document.body.appendChild(html);

  // ── 3. LOGIC ───────────────────────────────────────────────────
  var isOpen   = false;
  var userName = '';
  var M, IN, WIN;

  function init() {
    M   = document.getElementById('cfrMsgs');
    IN  = document.getElementById('cfrIn');
    WIN = document.getElementById('cfr-win');

    // Teaser: show after 4 s if not dismissed this session
    if (!sessionStorage.getItem('cfrTeaserDismissed')) {
      setTimeout(function () {
        if (!isOpen) document.getElementById('cfr-teaser').style.display = 'block';
      }, 4000);
    }
  }

  /* ── Render helpers ── */
  function msg(text, who) {
    var d = document.createElement('div');
    d.className = 'cfr-m ' + who;
    d.textContent = text;
    M.appendChild(d);
    M.scrollTop = M.scrollHeight;
  }

  function chips(arr) {
    var row = document.createElement('div');
    row.className = 'cfr-chips';
    arr.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'cfr-chip';
      b.textContent = c;
      b.onclick = function () { row.remove(); onChip(c); };
      row.appendChild(b);
    });
    M.appendChild(row);
    M.scrollTop = M.scrollHeight;
  }

  function btns(arr) {
    var row = document.createElement('div');
    row.className = 'cfr-btn-row';
    arr.forEach(function (b) {
      var el = document.createElement('button');
      el.className = 'cfr-btn ' + (b.cls || '');
      el.innerHTML = '<span class="bi">' + (b.icon || '') + '</span><span>' + b.label + '</span>';
      el.onclick = function () {
        if (b.url) window.open(b.url, '_blank');
        if (b.cb) { row.remove(); b.cb(); }
      };
      row.appendChild(el);
    });
    M.appendChild(row);
    M.scrollTop = M.scrollHeight;
  }

  function typing(ms, then) {
    var t = document.createElement('div');
    t.className = 'cfr-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    M.appendChild(t);
    M.scrollTop = M.scrollHeight;
    setTimeout(function () { t.remove(); then(); }, ms || 900);
  }

  /* ── Flows ── */
  function flowStart() {
    typing(700, function () {
      var g = userName ? 'Hey ' + fn(userName) + '! 👋' : '👋 Hey there! Welcome to Canadian Fitness Repair.';
      msg(g + "\n\nI'm here to help get your equipment back in shape 💪 What can I do for you today?", 'bot');
      chips(['🔧 Book a repair', '💬 Get a quote', '🛠 Our services', '📍 Where we serve', '⚡ Emergency!', '🙋 Talk to a person']);
    });
  }

  function flowServices() {
    typing(700, function () {
      msg("Here's everything we help with:\n\n🏃 Treadmill repair\n🚶 Elliptical repair\n🚴 Exercise bike & spin bike\n🚣 Rowing machine repair\n💪 Cable & strength machines\n🚶 Walking pad repair\n🔌 PCB / motor control boards\n🔧 Preventative maintenance plans\n🏢 Commercial gym contracts\n📦 Equipment installation & relocation\n🗑️ Eco-friendly equipment removal\n\nAll done right at your home or gym. Most jobs finished in a single visit!", 'bot');
      btns([
        { icon: '🔧', label: 'Book a repair', cls: 'primary', cb: flowBookingForm },
        { icon: '💬', label: 'Get a quote', cb: flowQuote },
        { icon: '🏠', label: 'Back to main menu', cls: 'back', cb: flowStart }
      ]);
    });
  }

  function flowAreas() {
    typing(700, function () {
      msg("We cover a big chunk of Ontario! 🗺️\n\nHamilton, Ancaster, Dundas, Stoney Creek, Waterdown, Burlington, Oakville, Mississauga, Milton, Brampton, Toronto & full GTA, Niagara Falls, St. Catharines, Grimsby, Brantford, Cambridge, Guelph, Kitchener, Waterloo, Woodstock, London & more.\n\nNo travel fees inside our service zones — we come to you!", 'bot');
      btns([
        { icon: '🔧', label: 'Book a repair', cls: 'primary', cb: flowBookingForm },
        { icon: '💬', label: 'Get a quote', cb: flowQuote },
        { icon: '🏠', label: 'Back to main menu', cls: 'back', cb: flowStart }
      ]);
    });
  }

  function flowEmergency() {
    typing(600, function () {
      msg("Oh no — let's get you sorted right away! 🚨\n\nWe have technicians available 24/7. Fastest ways to reach us:", 'bot');
      btns([
        { icon: '📞', label: 'Call us now — (289) 925-7239', cls: 'primary', url: 'tel:+12899257239', cb: function () {} },
        { icon: '📱', label: 'Text us — (289) 925-7239', cls: 'sms', url: 'sms:+12899257239', cb: function () {} },
        { icon: '💬', label: 'WhatsApp us', cls: 'wa', url: 'https://wa.me/13653662162', cb: function () {} },
        { icon: '📋', label: 'Fill quick booking form here', cb: flowBookingForm },
        { icon: '🏠', label: 'Back to main menu', cls: 'back', cb: flowStart }
      ]);
    });
  }

  function flowHuman() {
    typing(600, function () {
      msg("Of course! Sometimes you just need a real person 😊\n\nHere are all the ways to reach our team:", 'bot');
      btns([
        { icon: '💬', label: 'WhatsApp us', cls: 'wa', url: 'https://wa.me/13653662162', cb: function () {} },
        { icon: '📱', label: 'Send us a text — (289) 925-7239', cls: 'sms', url: 'sms:+12899257239', cb: function () {} },
        { icon: '📧', label: 'Email us — canadianfitnessrepair@gmail.com', cls: 'email', url: 'mailto:canadianfitnessrepair@gmail.com', cb: function () {} },
        { icon: '📞', label: 'Call us — (289) 925-7239', cls: 'primary', url: 'tel:+12899257239', cb: function () {} },
        { icon: '🏠', label: 'Back to main menu', cls: 'back', cb: flowStart }
      ]);
    });
  }

  function flowQuote() {
    typing(700, function () {
      msg("Happy to help! Here's a rough pricing guide — fully transparent, no hidden fees 😊\n\n💰 Service call + diagnosis: $89\n🔧 Belt adjustment: ~$150\n⚙️ Motor replacement: from $500\n🏢 Commercial plans: $199–$499/mo\n\n✅ Every repair includes a 90-day parts & labour warranty.\n\nWant an exact quote? Fill the quick form right here!", 'bot');
      btns([
        { icon: '📋', label: 'Fill quick booking form (right here!)', cls: 'primary', cb: flowBookingForm },
        { icon: '🌐', label: 'Go to full quote page', url: 'https://www.canadianfitnessrepair.com/get-quote.html', cb: function () {} },
        { icon: '🙋', label: 'Talk to a real person', cb: flowHuman },
        { icon: '🏠', label: 'Back to main menu', cls: 'back', cb: flowStart }
      ]);
    });
  }

  function flowBookingForm() {
    typing(700, function () {
      msg("No problem — let me take your details right here. Takes about a minute! 📋", 'bot');
      setTimeout(renderForm, 400);
    });
  }

  function renderForm() {
    var p = document.createElement('div');
    p.className = 'cfr-form-panel';
    p.innerHTML = [
      '<div class="cfr-form-row">',
        '<div><label>First name *</label><input id="cf-fn" placeholder="Sarah" /></div>',
        '<div><label>Last name</label><input id="cf-ln" placeholder="Johnson" /></div>',
      '</div>',
      '<div><label>Phone number *</label><input id="cf-ph" type="tel" placeholder="(289) 000-0000" /></div>',
      '<div><label>Email address</label><input id="cf-em" type="email" placeholder="you@example.com" /></div>',
      '<div><label>Preferred contact</label>',
        '<select id="cf-pref"><option value="">-- How should we reach you? --</option>',
        '<option>Phone call</option><option>Email</option><option>Text / SMS</option><option>WhatsApp</option>',
        '</select></div>',
      '<div><label>City / Town *</label><select id="cf-city">',
        '<option value="">-- Pick your city --</option>',
        ['Toronto','Mississauga','Brampton','Hamilton','Oakville','Burlington','Oshawa','Whitby',
         'Ajax','Pickering','Markham','Vaughan','Richmond Hill','Newmarket','Aurora','Milton',
         'Georgetown','Caledon','Scarborough','Etobicoke','North York','East York','Guelph',
         'Cambridge','Kitchener','Waterloo','Niagara Falls','St. Catharines','Welland','Grimsby',
         'Beamsville','Brantford','Woodstock','London','Ancaster','Dundas','Stoney Creek',
         'Waterdown','Paris','Smithville'].map(function(c){return '<option>'+c+'</option>';}).join(''),
      '</select></div>',
      '<div><label>Postal code</label><input id="cf-postal" placeholder="L8E 5R9" /></div>',
      '<div><label>Client type</label><select id="cf-type">',
        '<option value="">-- Select --</option><option>Individual</option><option>Business</option>',
      '</select></div>',
      '<div><label>Service needed</label><select id="cf-svc">',
        '<option value="">-- Select service --</option>',
        '<option>Repairs & Tune-Ups</option><option>Preventative Maintenance</option>',
        '<option>Inspection</option><option>Relocation & Assembly</option>',
      '</select></div>',
      '<div><label>Equipment type *</label><select id="cf-eq">',
        '<option value="">-- Select equipment --</option>',
        ['Treadmill','Elliptical','Exercise Bike','Spin Bike','Recumbent Bike','Rowing Machine',
         'Strength Equipment','Cable Machine','Stair Climber','Walking Pad',
         'Total Gym / Hybrid Trainer','Arc Trainer','Other']
        .map(function(e){return '<option>'+e+'</option>';}).join(''),
      '</select></div>',
      '<div><label>Equipment brand</label><select id="cf-brand">',
        '<option value="">-- Select brand (optional) --</option>',
        ['NordicTrack','ProForm','Life Fitness','Precor','Matrix Fitness','Sole Fitness',
         'Bowflex','Horizon Fitness','Technogym','True Fitness','Spirit Fitness','Cybex',
         'Freemotion','Peloton','Nautilus','Schwinn','BH Fitness','Octane Fitness',
         'Star Trac','Woodway','Reebok','Kettler','JTX Fitness','York Fitness','Not listed']
        .map(function(b){return '<option>'+b+'</option>';}).join(''),
      '</select></div>',
      '<div><label>Model / serial number (optional)</label><input id="cf-model" placeholder="e.g. NTL14122.4 / SN 12345" /></div>',
      '<div><label>Preferred date & time</label><input id="cf-date" type="datetime-local" /></div>',
      '<div><label>Describe the issue *</label>',
        '<textarea id="cf-desc" placeholder="e.g. Belt slips at high speed and makes a grinding noise…"></textarea>',
      '</div>',
      '<p class="cfr-form-note">📸 After booking, send photos/videos of the issue — helps us come prepared!</p>',
      '<button class="cfr-form-submit" onclick="cfrSubmitForm()">✅ Submit Booking Request</button>'
    ].join('');
    M.appendChild(p);
    M.scrollTop = M.scrollHeight;
    btns([{ icon: '🏠', label: 'Cancel & back to menu', cls: 'back', cb: function () { p.remove(); flowStart(); } }]);
  }

  window.cfrSubmitForm = function () {
    var v = function (id) { return (document.getElementById(id) || {}).value || ''; };
    var fn2=v('cf-fn'), ln=v('cf-ln'), ph=v('cf-ph'), em=v('cf-em'),
        pref=v('cf-pref'), city=v('cf-city'), postal=v('cf-postal'),
        type=v('cf-type'), svc=v('cf-svc'), eq=v('cf-eq'),
        brand=v('cf-brand'), model=v('cf-model'), dt=v('cf-date'), desc=v('cf-desc');

    if (!fn2)        { alert('Please enter your first name.'); return; }
    if (!ph && !em)  { alert('Please enter a phone number or email.'); return; }
    if (!city)       { alert('Please select your city.'); return; }
    if (!eq)         { alert('Please select your equipment type.'); return; }
    if (!desc)       { alert('Please describe the issue.'); return; }

    M.querySelectorAll('.cfr-form-panel, .cfr-btn-row').forEach(function (el) { el.remove(); });

    var name = (fn2 + ' ' + ln).trim();
    userName = name;

    var waText = [
      '🔧 *NEW BOOKING — Canadian Fitness Repair Bot*', '',
      '👤 *Name:* ' + name,
      '📞 *Phone:* ' + (ph || '—'),
      '📧 *Email:* ' + (em || '—'),
      '📬 *Preferred contact:* ' + (pref || '—'),
      '📍 *City:* ' + city + (postal ? ' (' + postal + ')' : ''),
      '🏢 *Client type:* ' + (type || '—'),
      '🛠 *Service:* ' + (svc || '—'),
      '🏋️ *Equipment:* ' + eq + (brand ? ' — ' + brand : '') + (model ? ' | Model: ' + model : ''),
      '📅 *Preferred date:* ' + (dt || 'Flexible'), '',
      '📝 *Issue:*', desc
    ].join('\n');

    msg("✅ Got it, " + fn(name) + "! Your booking request is submitted.", 'bot');
    setTimeout(function () {
      msg("We'll reach out shortly to confirm your appointment. If you have photos or a video of the issue, send them over — it helps us come fully prepared! 📸", 'bot');
      btns([
        { icon: '📸', label: 'Send photos via WhatsApp', cls: 'wa',
          url: 'https://wa.me/13653662162?text=' + encodeURIComponent(waText), cb: function () {} },
        { icon: '📸', label: 'Send photos via SMS', cls: 'sms',
          url: 'sms:+12899257239?body=' + encodeURIComponent(waText), cb: function () {} },
        { icon: '📧', label: 'Send photos via Email', cls: 'email',
          url: 'mailto:canadianfitnessrepair@gmail.com?subject=Booking+Photos+-+' + encodeURIComponent(name) + '&body=' + encodeURIComponent('Hi,\n\nI submitted a booking via your chatbot.\n\nDetails:\n' + waText + '\n\nPlease find photos/videos attached.'), cb: function () {} },
        { icon: '🏠', label: 'Back to main menu', cls: 'back', cb: flowStart }
      ]);
    }, 900);
  };

  function onChip(c) {
    msg(c, 'user');
    var l = c.toLowerCase();
    typing(850, function () {
      if (l.includes('book') || l.includes('repair'))          flowBookingForm();
      else if (l.includes('quote') || l.includes('price'))     flowQuote();
      else if (l.includes('service') || l.includes('offer'))   flowServices();
      else if (l.includes('area') || l.includes('where') || l.includes('serve')) flowAreas();
      else if (l.includes('emergency') || l.includes('urgent')) flowEmergency();
      else if (l.includes('human') || l.includes('person') || l.includes('talk')) flowHuman();
      else flowStart();
    });
  }

  window.cfrSend = function () {
    var txt = IN.value.trim(); if (!txt) return; IN.value = '';
    msg(txt, 'user');
    var l = txt.toLowerCase();
    typing(900, function () {
      if (l.match(/book|appoint|schedul/))            flowBookingForm();
      else if (l.match(/quote|cost|price|how much/))  flowQuote();
      else if (l.match(/service|offer|what do you/))  flowServices();
      else if (l.match(/area|city|cover|where/))      flowAreas();
      else if (l.match(/emergency|urgent|broken|asap|right now/)) flowEmergency();
      else if (l.match(/human|person|someone|whatsapp/)) flowHuman();
      else if (l.match(/treadmill/))  { msg("Ugh, treadmill troubles! 😅 Let me get your details so we can send a tech out. 🏃", 'bot'); setTimeout(flowBookingForm, 500); }
      else if (l.match(/elliptical/)) { msg("Elliptical issues? We'll have that sorted! 🚶 Let me grab your info.", 'bot'); setTimeout(flowBookingForm, 500); }
      else if (l.match(/bike|peloton|spin/)) { msg("Exercise bike acting up? We fix all brands including Peloton 🚴", 'bot'); setTimeout(flowBookingForm, 500); }
      else if (l.match(/rower|rowing/)) { msg("Rowing machine on the fritz? We're on it 🚣", 'bot'); setTimeout(flowBookingForm, 500); }
      else if (l.match(/walk.*pad|walking/)) { msg("Walking pad repair — yep, we handle those too! 🚶", 'bot'); setTimeout(flowBookingForm, 500); }
      else if (l.match(/cable|strength|weight/)) { msg("Strength equipment giving you grief? Our techs fix cables, pulleys, weight stacks 💪", 'bot'); setTimeout(flowBookingForm, 500); }
      else if (l.match(/warrant|guarantee/)) { msg("Every repair comes with a 90-day parts & labour warranty. If anything acts up again within that window, we come back — no charge. 🛡️", 'bot'); setTimeout(function () { btns([{ icon: '🔧', label: 'Book a repair', cls: 'primary', cb: flowBookingForm }, { icon: '🏠', label: 'Back to menu', cls: 'back', cb: flowStart }]); }, 400); }
      else if (l.match(/pay|cash|e.?transfer|credit/)) { msg("We accept:\n💵 Cash\n📱 E-Transfer\n💳 Credit Card\n\nYou only pay once the job's done and you're happy! 😊", 'bot'); setTimeout(function () { btns([{ icon: '🔧', label: 'Book a repair', cls: 'primary', cb: flowBookingForm }, { icon: '🏠', label: 'Back to menu', cls: 'back', cb: flowStart }]); }, 400); }
      else if (l.match(/remov|dispos|get rid|recycle/)) { msg("We do equipment removal too! 🗑️ We remove treadmills, ellipticals, full gym setups and recycle over 90% responsibly.", 'bot'); setTimeout(function () { btns([{ icon: '📋', label: 'Book a removal', cls: 'primary', cb: flowBookingForm }, { icon: '📞', label: 'Call us', url: 'tel:+12899257239', cb: function () {} }, { icon: '🏠', label: 'Back to menu', cls: 'back', cb: flowStart }]); }, 400); }
      else if (l.match(/hi|hello|hey|howdy/)) { msg(userName ? 'Hey ' + fn(userName) + '! 👋 How can I help?' : 'Hey! 👋 Great to have you here.', 'bot'); setTimeout(function () { chips(['🔧 Book a repair', '💬 Get a quote', '🛠 Our services', '🙋 Talk to a person']); }, 400); }
      else { msg("Hmm, not 100% sure about that one! 😅 Let me get you to the right place.", 'bot'); setTimeout(flowHuman, 500); }
    });
  };

  function fn(n) { return n ? n.split(' ')[0] : ''; }

  window.cfrOpen = function () {
    isOpen = true;
    WIN.classList.add('cfr-open');
    document.getElementById('cfr-teaser').style.display = 'none';
    var notif = document.getElementById('cfr-bubble-notif');
    if (notif) notif.style.display = 'none';
    var label = document.getElementById('cfr-bubble-label');
    if (label) label.style.display = 'none';
    if (M.children.length === 0) flowStart();
    setTimeout(function () { IN.focus(); }, 300);
  };

  window.cfrClose = function () {
    isOpen = false;
    WIN.classList.remove('cfr-open');
  };

  // Wait for DOM to be ready before grabbing elements
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(); // end injectCFRChatbot