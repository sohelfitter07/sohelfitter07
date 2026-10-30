// (function injectCFRChatbot() {

//   // ── 1. STYLES ──────────────────────────────────────────────────
//   var css = document.createElement('style');
//   css.textContent = `
// #cfr-bubble-wrap{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;gap:10px;transition:opacity .2s}
// #cfr-bubble-wrap.cfr-hidden{opacity:0;pointer-events:none}
// #cfr-bubble-label{background:#1E2030;color:#e2e8f0;font-family:"Segoe UI",Roboto,sans-serif;font-size:13px;font-weight:600;padding:8px 14px;border-radius:20px;border:1px solid rgba(92,92,253,.35);box-shadow:0 4px 18px rgba(0,0,0,.45);white-space:nowrap;animation:cfrLabelBob 3s ease-in-out infinite;cursor:pointer}
// @keyframes cfrLabelBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
// #cfr-bubble{width:64px;height:64px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#5C5CFD 0%,#4ECDC4 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(92,92,253,.18),0 0 0 12px rgba(92,92,253,.07),0 6px 24px rgba(92,92,253,.55);transition:transform .22s ease,box-shadow .22s ease;position:relative;animation:cfrRingPulse 2.4s ease-in-out infinite}
// @keyframes cfrRingPulse{0%,100%{box-shadow:0 0 0 6px rgba(92,92,253,.18),0 0 0 12px rgba(92,92,253,.07),0 6px 24px rgba(92,92,253,.55)}50%{box-shadow:0 0 0 10px rgba(92,92,253,.12),0 0 0 20px rgba(92,92,253,.04),0 8px 30px rgba(92,92,253,.65)}}
// #cfr-bubble:hover{transform:scale(1.1);box-shadow:0 0 0 14px rgba(92,92,253,.1),0 8px 32px rgba(92,92,253,.7);animation:none}
// #cfr-bubble svg{width:30px;height:30px;fill:#fff}
// #cfr-bubble-notif{position:absolute;top:2px;right:2px;width:16px;height:16px;background:#FF6B6B;border-radius:50%;border:2.5px solid #151719;animation:cfrNotifPop .6s ease forwards,cfrNotifPulse 1.8s ease-in-out 1s infinite}
// @keyframes cfrNotifPop{from{transform:scale(0)}to{transform:scale(1)}}
// @keyframes cfrNotifPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,107,107,.7)}50%{box-shadow:0 0 0 6px rgba(255,107,107,0)}}
// #cfr-teaser{position:fixed;bottom:108px;right:28px;background:#1E2030;color:#e2e8f0;font-family:"Segoe UI",Roboto,sans-serif;font-size:13.5px;line-height:1.55;padding:13px 16px;border-radius:16px 16px 4px 16px;border:1px solid rgba(92,92,253,.3);box-shadow:0 10px 36px rgba(0,0,0,.55);max-width:220px;z-index:9997;display:none;animation:cfrFadeUp .4s ease;cursor:pointer}
// #cfr-teaser strong{color:#9b9bfd}
// #cfr-teaser-dismiss{display:block;margin-top:8px;font-size:11.5px;color:#64748b;cursor:pointer}
// #cfr-teaser-dismiss:hover{color:#94a3b8}

// /* ── Chat window — desktop ── */
// #cfr-win{position:fixed;bottom:108px;right:24px;width:375px;max-width:calc(100vw - 20px);background:#151719;border-radius:22px;border:1px solid rgba(92,92,253,.22);box-shadow:0 28px 70px rgba(0,0,0,.7);display:none;flex-direction:column;overflow:hidden;z-index:9998;font-family:"Segoe UI",Roboto,sans-serif}
// #cfr-win.cfr-open{display:flex;animation:cfrFadeUp .28s ease}
// @keyframes cfrFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

// /* ── Chat window — tablet (481px–768px) ── */
// @media(min-width:481px) and (max-width:768px){
//   #cfr-win{width:340px;bottom:90px;right:16px}
//   #cfr-bubble-wrap{bottom:16px;right:16px}
// }

// /* ── Chat window — mobile (≤480px) ── */
// @media(max-width:480px){
//   #cfr-win{
//     position:fixed;
//     bottom:0; left:0; right:0;
//     width:100vw; max-width:100vw;
//     height:88vh; max-height:88vh;
//     border-radius:20px 20px 0 0;
//     border-bottom:none;
//   }
//   #cfr-win .cfr-msgs{max-height:calc(88vh - 130px);flex:1}
//   #cfr-bubble-wrap{bottom:16px;right:14px}
//   #cfr-teaser{right:14px;bottom:106px;max-width:calc(100vw - 80px)}
//   #cfr-bubble-label{font-size:12px;padding:6px 12px}
// }

// /* ── Very small phones (≤360px) ── */
// @media(max-width:360px){
//   #cfr-win{height:92vh;max-height:92vh}
//   #cfr-win .cfr-msgs{max-height:calc(92vh - 130px)}
// }

// .cfr-hd{background:linear-gradient(135deg,#5C5CFD,#4ECDC4);padding:13px 16px;display:flex;align-items:center;gap:11px;flex-shrink:0}
// .cfr-hd-av{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
// .cfr-hd-info{flex:1}
// .cfr-hd-name{font-size:14px;font-weight:700;color:#fff}
// .cfr-hd-sub{font-size:11px;color:rgba(255,255,255,.82);margin-top:2px;display:flex;align-items:center;gap:5px}
// .cfr-hd-sub::before{content:'';width:7px;height:7px;background:#4ade80;border-radius:50%;display:inline-block}
// .cfr-x{background:none;border:none;color:rgba(255,255,255,.85);font-size:23px;cursor:pointer;padding:0 3px;line-height:1;flex-shrink:0}
// .cfr-x:hover{color:#fff}
// .cfr-msgs{overflow-y:auto;padding:13px 12px;display:flex;flex-direction:column;gap:9px;max-height:370px;min-height:180px;background:#151719;scroll-behavior:smooth;flex:1}
// .cfr-m{max-width:88%;padding:10px 14px;border-radius:18px;font-size:13.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word}
// .cfr-m.bot{background:#1E2030;color:#e2e8f0;border-radius:4px 18px 18px 18px;align-self:flex-start;border:1px solid rgba(255,255,255,.05)}
// .cfr-m.user{background:linear-gradient(135deg,#5C5CFD,#4ECDC4);color:#fff;border-radius:18px 4px 18px 18px;align-self:flex-end}
// .cfr-chips{display:flex;flex-wrap:wrap;gap:7px;align-self:flex-start;max-width:96%}
// .cfr-chip{background:transparent;border:1px solid rgba(92,92,253,.45);color:#9b9bfd;border-radius:99px;padding:6px 14px;font-size:12.5px;cursor:pointer;transition:all .18s;font-family:inherit}
// .cfr-chip:hover{background:rgba(92,92,253,.18);color:#fff;border-color:#5C5CFD}
// .cfr-btn-row{display:flex;flex-direction:column;gap:7px;align-self:flex-start;width:94%}
// .cfr-btn{background:#1E2030;border:1px solid rgba(92,92,253,.35);color:#e2e8f0;border-radius:13px;padding:10px 14px;font-size:13px;cursor:pointer;text-align:left;transition:all .18s;font-family:inherit;display:flex;align-items:center;gap:10px}
// .cfr-btn:hover{background:rgba(92,92,253,.15);border-color:#5C5CFD}
// .cfr-btn.primary{background:linear-gradient(135deg,#5C5CFD,#4ECDC4);color:#fff;border-color:transparent}
// .cfr-btn.primary:hover{opacity:.88}
// .cfr-btn.wa{border-color:#25D366;color:#4ade80}
// .cfr-btn.wa:hover{background:rgba(37,211,102,.1)}
// .cfr-btn.sms{border-color:#4ECDC4;color:#4ECDC4}
// .cfr-btn.sms:hover{background:rgba(78,205,196,.1)}
// .cfr-btn.email{border-color:#f59e0b;color:#fbbf24}
// .cfr-btn.email:hover{background:rgba(245,158,11,.1)}
// .cfr-btn.back{border-color:rgba(255,255,255,.1);color:#64748b}
// .cfr-btn.back:hover{color:#94a3b8;background:rgba(255,255,255,.04)}
// .cfr-btn .bi{font-size:17px;flex-shrink:0}
// .cfr-typing{display:flex;align-items:center;gap:5px;padding:11px 15px;background:#1E2030;border-radius:4px 18px 18px 18px;align-self:flex-start;border:1px solid rgba(255,255,255,.05)}
// .cfr-typing span{width:7px;height:7px;background:#94a3b8;border-radius:50%;animation:cfrDot 1.2s infinite}
// .cfr-typing span:nth-child(2){animation-delay:.2s}
// .cfr-typing span:nth-child(3){animation-delay:.4s}
// @keyframes cfrDot{0%,80%,100%{opacity:.25;transform:scale(.9)}40%{opacity:1;transform:scale(1.1)}}
// .cfr-form-panel{background:#1E2030;border-radius:14px;padding:14px;border:1px solid rgba(92,92,253,.2);align-self:flex-start;width:94%;display:flex;flex-direction:column;gap:10px}
// .cfr-form-panel label{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:3px}
// .cfr-form-panel input,.cfr-form-panel select,.cfr-form-panel textarea{width:100%;background:#151719;border:1px solid rgba(92,92,253,.22);border-radius:9px;padding:8px 11px;font-size:13px;color:#e2e8f0;font-family:inherit;outline:none;box-sizing:border-box}
// .cfr-form-panel input:focus,.cfr-form-panel textarea:focus{border-color:#5C5CFD}
// .cfr-form-panel select option{background:#1E2030}
// .cfr-form-panel textarea{resize:vertical;min-height:68px}
// .cfr-form-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
// .cfr-form-note{font-size:11px;color:#64748b}
// .cfr-form-submit{background:linear-gradient(135deg,#5C5CFD,#4ECDC4);color:#fff;border:none;border-radius:10px;padding:10px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .2s}
// .cfr-form-submit:hover{opacity:.88}
// .cfr-form-submit:disabled{opacity:.45;cursor:not-allowed}
// .cfr-bar{display:flex;gap:8px;padding:10px 12px;background:#1B1C27;border-top:1px solid rgba(255,255,255,.06);flex-shrink:0}
// .cfr-in{flex:1;background:#151719;border:1px solid rgba(92,92,253,.22);border-radius:11px;padding:9px 13px;font-size:13.5px;color:#e2e8f0;outline:none;font-family:inherit;min-width:0}
// .cfr-in:focus{border-color:#5C5CFD}
// .cfr-in::placeholder{color:#475569}
// .cfr-go{background:linear-gradient(135deg,#5C5CFD,#4ECDC4);border:none;border-radius:11px;padding:9px 15px;color:#fff;font-size:15px;cursor:pointer;transition:opacity .2s;flex-shrink:0}
// .cfr-go:hover{opacity:.88}
//   `;
//   document.head.appendChild(css);

//   // ── 2. HTML ────────────────────────────────────────────────────
//   var wrap = document.createElement('div');
//   wrap.innerHTML = `
//     <div id="cfr-teaser" onclick="cfrOpen()">
//       👋 Equipment acting up?<br>
//       <strong>We're online &amp; ready to help!</strong>
//       <span id="cfr-teaser-dismiss"
//         onclick="event.stopPropagation();
//                  document.getElementById('cfr-teaser').style.display='none';
//                  sessionStorage.setItem('cfrTeaserDismissed','1')">
//         No thanks
//       </span>
//     </div>

//     <div id="cfr-bubble-wrap">
//       <div id="cfr-bubble-label" onclick="cfrOpen()">💬 Chat with us — we're online!</div>
//       <button id="cfr-bubble" onclick="cfrOpen()" aria-label="Open chat">
//         <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.02 2 11c0 2.68 1.15 5.09 3 6.79V22l4.44-2.22A10.5 10.5 0 0012 20c5.52 0 10-4.02 10-9S17.52 2 12 2z"/></svg>
//         <span id="cfr-bubble-notif"></span>
//       </button>
//     </div>

//     <div id="cfr-win" role="dialog" aria-label="Chat with Canadian Fitness Repair">
//       <div class="cfr-hd">
//         <div class="cfr-hd-av">🔧</div>
//         <div class="cfr-hd-info">
//           <div class="cfr-hd-name">Canadian Fitness Repair</div>
//           <div class="cfr-hd-sub">Online now · replies instantly</div>
//         </div>
//         <button class="cfr-x" onclick="cfrClose()" aria-label="Close">×</button>
//       </div>
//       <div class="cfr-msgs" id="cfrMsgs"></div>
//       <div class="cfr-bar">
//         <input id="cfrIn" class="cfr-in" placeholder="Type a message…"
//           onkeydown="if(event.key==='Enter')cfrSend()" aria-label="Message" />
//         <button class="cfr-go" onclick="cfrSend()">➤</button>
//       </div>
//     </div>
//   `;
//   document.body.appendChild(wrap);

//   // ── 3. LOGIC ───────────────────────────────────────────────────
//   var isOpen   = false;
//   var userName = '';
//   var M, IN, WIN, BWRAP;

//   function init() {
//     M      = document.getElementById('cfrMsgs');
//     IN     = document.getElementById('cfrIn');
//     WIN    = document.getElementById('cfr-win');
//     BWRAP  = document.getElementById('cfr-bubble-wrap');

//     if (!sessionStorage.getItem('cfrTeaserDismissed')) {
//       setTimeout(function () {
//         if (!isOpen) document.getElementById('cfr-teaser').style.display = 'block';
//       }, 4000);
//     }
//   }

//   /* ── Render helpers ── */
//   function msg(text, who) {
//     var d = document.createElement('div');
//     d.className = 'cfr-m ' + who;
//     d.textContent = text;
//     M.appendChild(d);
//     M.scrollTop = M.scrollHeight;
//   }

//   function chips(arr) {
//     var row = document.createElement('div');
//     row.className = 'cfr-chips';
//     arr.forEach(function (c) {
//       var b = document.createElement('button');
//       b.className = 'cfr-chip';
//       b.textContent = c;
//       b.onclick = function () { row.remove(); onChip(c); };
//       row.appendChild(b);
//     });
//     M.appendChild(row);
//     M.scrollTop = M.scrollHeight;
//   }

//   /*
//     btns() — two button types:
//     - LINK buttons  (have url, no cb or empty cb): open URL, keep row visible, show "start over" after
//     - ACTION buttons (have cb): remove row and run the callback
//   */
//   function btns(arr) {
//     var row = document.createElement('div');
//     row.className = 'cfr-btn-row';

//     arr.forEach(function (b) {
//       var el = document.createElement('button');
//       el.className = 'cfr-btn ' + (b.cls || '');
//       el.innerHTML = '<span class="bi">' + (b.icon || '') + '</span><span>' + b.label + '</span>';

//       el.onclick = function () {
//         var isLinkOnly = b.url && (!b.cb || b.cb.toString().trim() === 'function () {}' || b.cb.toString().trim() === 'function(){}');

//         if (b.url) window.open(b.url, '_blank');

//         if (!isLinkOnly && b.cb) {
//           // Navigation button — remove whole row and go to new flow
//           row.remove();
//           b.cb();
//         } else if (isLinkOnly) {
//           // Link button — keep row visible but show a follow-up nudge once
//           if (!row.dataset.nudged) {
//             row.dataset.nudged = '1';
//             setTimeout(function () {
//               msg("Feel free to reach out anytime! 😊 Is there anything else I can help with?", 'bot');
//               var nudge = document.createElement('div');
//               nudge.className = 'cfr-chips';
//               var startBtn = document.createElement('button');
//               startBtn.className = 'cfr-chip';
//               startBtn.textContent = '🏠 Start over';
//               startBtn.onclick = function () { nudge.remove(); row.remove(); flowStart(); };
//               nudge.appendChild(startBtn);
//               M.appendChild(nudge);
//               M.scrollTop = M.scrollHeight;
//             }, 600);
//           }
//         }
//       };

//       row.appendChild(el);
//     });

//     M.appendChild(row);
//     M.scrollTop = M.scrollHeight;
//     return row;
//   }

//   function typing(ms, then) {
//     var t = document.createElement('div');
//     t.className = 'cfr-typing';
//     t.innerHTML = '<span></span><span></span><span></span>';
//     M.appendChild(t);
//     M.scrollTop = M.scrollHeight;
//     setTimeout(function () { t.remove(); then(); }, ms || 900);
//   }

//   /* ── Flows ── */
//   function flowStart() {
//     typing(700, function () {
//       var g = userName ? 'Hey ' + fn(userName) + '! 👋' : '👋 Hey there! Welcome to Canadian Fitness Repair.';
//       msg(g + "\n\nI'm here to help get your equipment back in shape 💪 What can I do for you today?", 'bot');
//       chips(['🔧 Book a repair', '💬 Get a quote', '🛠 Our services', '📍 Where we serve', '⚡ Emergency!', '🙋 Talk to a person']);
//     });
//   }

//   function flowServices() {
//     typing(700, function () {
//       msg("Here's everything we help with:\n\n🏃 Treadmill repair\n🚶 Elliptical repair\n🚴 Exercise bike & spin bike\n🚣 Rowing machine repair\n💪 Cable & strength machines\n🚶 Walking pad repair\n🔌 PCB / motor control boards\n🔧 Preventative maintenance plans\n🏢 Commercial gym contracts\n📦 Equipment installation & relocation\n🗑️ Eco-friendly equipment removal\n\nAll done right at your home or gym. Most jobs finished in a single visit!", 'bot');
//       btns([
//         { icon: '🔧', label: 'Book a repair', cls: 'primary', cb: flowBookingForm },
//         { icon: '💬', label: 'Get a quote', cb: flowQuote },
//         { icon: '🏠', label: 'Back to main menu', cls: 'back', cb: flowStart }
//       ]);
//     });
//   }

//   function flowAreas() {
//     typing(700, function () {
//       msg("We cover a big chunk of Ontario! 🗺️\n\nHamilton, Ancaster, Dundas, Stoney Creek, Waterdown, Burlington, Oakville, Mississauga, Milton, Brampton, Toronto & full GTA, Niagara Falls, St. Catharines, Grimsby, Brantford, Cambridge, Guelph, Kitchener, Waterloo, Woodstock, London & more.\n\nNo travel fees inside our service zones — we come to you!", 'bot');
//       btns([
//         { icon: '🔧', label: 'Book a repair', cls: 'primary', cb: flowBookingForm },
//         { icon: '💬', label: 'Get a quote', cb: flowQuote },
//         { icon: '🏠', label: 'Back to main menu', cls: 'back', cb: flowStart }
//       ]);
//     });
//   }

//   function flowEmergency() {
//     typing(600, function () {
//       msg("Oh no — let's get you sorted right away! 🚨\n\nWe have technicians available 24/7. Fastest ways to reach us:", 'bot');
//       btns([
//         { icon: '📞', label: 'Call us now — (289) 925-7239',  cls: 'primary', url: 'tel:2899257239' },
//         { icon: '📱', label: 'Text us — (289) 925-7239',      cls: 'sms',     url: 'sms:2899257239' },
//         { icon: '💬', label: 'WhatsApp us',                   cls: 'wa',      url: 'https://wa.me/13653662162' },
//         { icon: '📋', label: 'Fill quick booking form here',                  cb: flowBookingForm },
//         { icon: '🏠', label: 'Back to main menu',             cls: 'back',    cb: flowStart }
//       ]);
//     });
//   }

//   function flowHuman() {
//     typing(600, function () {
//       msg("Of course! Sometimes you just need a real person 😊\n\nHere are all the ways to reach our team — pick whatever's easiest:", 'bot');
//       btns([
//         { icon: '💬', label: 'WhatsApp us',                                    cls: 'wa',    url: 'https://wa.me/13653662162' },
//         { icon: '📱', label: 'Send us a text — (289) 925-7239',               cls: 'sms',   url: 'sms:2899257239' },
//         { icon: '📧', label: 'Email — canadianfitnessrepair@gmail.com',        cls: 'email', url: 'mailto:canadianfitnessrepair@gmail.com' },
//         { icon: '📞', label: 'Call us — (289) 925-7239',                       cls: 'primary', url: 'tel:2899257239' },
//         { icon: '🏠', label: 'Back to main menu',                              cls: 'back',  cb: flowStart }
//       ]);
//     });
//   }

//   function flowQuote() {
//     typing(700, function () {
//       msg("Happy to help! Here's a rough pricing guide — fully transparent, no hidden fees 😊\n\n💰 Service call + diagnosis: $89\n🔧 Belt adjustment: ~$150\n⚙️ Motor replacement: from $500\n🏢 Commercial plans: $199–$499/mo\n\n✅ Every repair includes a 30-day parts & labour warranty.", 'bot');
//       btns([
//         { icon: '📋', label: 'Fill quick booking form (right here!)', cls: 'primary', cb: flowBookingForm },
//         { icon: '🌐', label: 'Go to full quote page', url: 'https://www.canadianfitnessrepair.com/get-quote.html' },
//         { icon: '🙋', label: 'Talk to a real person', cb: flowHuman },
//         { icon: '🏠', label: 'Back to main menu', cls: 'back', cb: flowStart }
//       ]);
//     });
//   }

//   function flowBookingForm() {
//     typing(700, function () {
//       msg("No problem — let me take your details right here. Takes about a minute! 📋", 'bot');
//       setTimeout(renderForm, 400);
//     });
//   }

//   function renderForm() {
//     var p = document.createElement('div');
//     p.className = 'cfr-form-panel';
//     p.innerHTML = [
//       '<div class="cfr-form-row">',
//         '<div><label>First name *</label><input id="cf-fn" placeholder="Sarah" /></div>',
//         '<div><label>Last name</label><input id="cf-ln" placeholder="Johnson" /></div>',
//       '</div>',
//       '<div><label>Phone number *</label><input id="cf-ph" type="tel" placeholder="(289) 000-0000" /></div>',
//       '<div><label>Email address</label><input id="cf-em" type="email" placeholder="you@example.com" /></div>',
//       '<div><label>Preferred contact</label>',
//         '<select id="cf-pref"><option value="">-- How should we reach you? --</option>',
//         '<option>Phone call</option><option>Email</option><option>Text / SMS</option><option>WhatsApp</option>',
//         '</select></div>',
//       '<div><label>City / Town *</label><select id="cf-city">',
//         '<option value="">-- Pick your city --</option>',
//         ['Toronto','Mississauga','Brampton','Hamilton','Oakville','Burlington','Oshawa','Whitby',
//          'Ajax','Pickering','Markham','Vaughan','Richmond Hill','Newmarket','Aurora','Milton',
//          'Georgetown','Caledon','Scarborough','Etobicoke','North York','East York','Guelph',
//          'Cambridge','Kitchener','Waterloo','Niagara Falls','St. Catharines','Welland','Grimsby',
//          'Beamsville','Brantford','Woodstock','London','Ancaster','Dundas','Stoney Creek',
//          'Waterdown','Paris','Smithville'].map(function(c){return '<option>'+c+'</option>';}).join(''),
//       '</select></div>',
//       '<div><label>Postal code</label><input id="cf-postal" placeholder="L8E 5R9" /></div>',
//       '<div><label>Client type</label><select id="cf-type">',
//         '<option value="">-- Select --</option><option>Individual</option><option>Business</option>',
//       '</select></div>',
//       '<div><label>Service needed</label><select id="cf-svc">',
//         '<option value="">-- Select service --</option>',
//         '<option>Repairs &amp; Tune-Ups</option><option>Preventative Maintenance</option>',
//         '<option>Inspection</option><option>Relocation &amp; Assembly</option>',
//       '</select></div>',
//       '<div><label>Equipment type *</label><select id="cf-eq">',
//         '<option value="">-- Select equipment --</option>',
//         ['Treadmill','Elliptical','Exercise Bike','Spin Bike','Recumbent Bike','Rowing Machine',
//          'Strength Equipment','Cable Machine','Stair Climber','Walking Pad',
//          'Total Gym / Hybrid Trainer','Arc Trainer','Other']
//         .map(function(e){return '<option>'+e+'</option>';}).join(''),
//       '</select></div>',
//       '<div><label>Equipment brand</label><select id="cf-brand">',
//         '<option value="">-- Select brand (optional) --</option>',
//         ['NordicTrack','ProForm','Life Fitness','Precor','Matrix Fitness','Sole Fitness',
//          'Bowflex','Horizon Fitness','Technogym','True Fitness','Spirit Fitness','Cybex',
//          'Freemotion','Peloton','Nautilus','Schwinn','BH Fitness','Octane Fitness',
//          'Star Trac','Woodway','Reebok','Kettler','JTX Fitness','York Fitness','Not listed']
//         .map(function(b){return '<option>'+b+'</option>';}).join(''),
//       '</select></div>',
//       '<div><label>Model / serial (optional)</label><input id="cf-model" placeholder="e.g. NTL14122.4" /></div>',
//       '<div><label>Preferred date &amp; time</label><input id="cf-date" type="datetime-local" /></div>',
//       '<div><label>Describe the issue *</label>',
//         '<textarea id="cf-desc" placeholder="e.g. Belt slips at high speed and makes a grinding noise…"></textarea>',
//       '</div>',
//       '<p class="cfr-form-note">📸 After booking, send photos/videos of the issue — helps us come prepared!</p>',
//       '<button class="cfr-form-submit" onclick="cfrSubmitForm()">✅ Submit Booking Request</button>'
//     ].join('');
//     M.appendChild(p);
//     M.scrollTop = M.scrollHeight;
//     btns([{ icon: '🏠', label: 'Cancel & back to menu', cls: 'back', cb: function () { p.remove(); flowStart(); } }]);
//   }

//   window.cfrSubmitForm = function () {
//     var v = function (id) { return (document.getElementById(id) || {}).value || ''; };
//     var fn2=v('cf-fn'), ln=v('cf-ln'), ph=v('cf-ph'), em=v('cf-em'),
//         pref=v('cf-pref'), city=v('cf-city'), postal=v('cf-postal'),
//         type=v('cf-type'), svc=v('cf-svc'), eq=v('cf-eq'),
//         brand=v('cf-brand'), model=v('cf-model'), dt=v('cf-date'), desc=v('cf-desc');

//     if (!fn2)       { alert('Please enter your first name.'); return; }
//     if (!ph && !em) { alert('Please enter a phone number or email.'); return; }
//     if (!city)      { alert('Please select your city.'); return; }
//     if (!eq)        { alert('Please select your equipment type.'); return; }
//     if (!desc)      { alert('Please describe the issue.'); return; }

//     M.querySelectorAll('.cfr-form-panel, .cfr-btn-row').forEach(function (el) { el.remove(); });

//     var name = (fn2 + ' ' + ln).trim();
//     userName = name;

//     var waText = [
//       '🔧 *NEW BOOKING — Canadian Fitness Repair Bot*', '',
//       '👤 *Name:* ' + name,
//       '📞 *Phone:* ' + (ph || '—'),
//       '📧 *Email:* ' + (em || '—'),
//       '📬 *Preferred contact:* ' + (pref || '—'),
//       '📍 *City:* ' + city + (postal ? ' (' + postal + ')' : ''),
//       '🏢 *Client type:* ' + (type || '—'),
//       '🛠 *Service:* ' + (svc || '—'),
//       '🏋️ *Equipment:* ' + eq + (brand ? ' — ' + brand : '') + (model ? ' | Model: ' + model : ''),
//       '📅 *Preferred date:* ' + (dt || 'Flexible'), '',
//       '📝 *Issue:*', desc
//     ].join('\n');

//     msg("✅ Got it, " + fn(name) + "! Your booking request is submitted.", 'bot');
//     setTimeout(function () {
//       msg("We'll reach out shortly to confirm your appointment. If you have photos or a video of the issue, send them over — it helps us come fully prepared! 📸", 'bot');
//       btns([
//         { icon: '📸', label: 'Send photos via WhatsApp', cls: 'wa',
//           url: 'https://wa.me/13653662162?text=' + encodeURIComponent(waText) },
//         { icon: '📸', label: 'Send photos via SMS', cls: 'sms',
//           url: 'sms:2899257239?body=' + encodeURIComponent(waText) },
//         { icon: '📧', label: 'Send photos via Email', cls: 'email',
//           url: 'mailto:canadianfitnessrepair@gmail.com?subject=Booking+-+' + encodeURIComponent(name) + '&body=' + encodeURIComponent('Hi,\n\nBooking details:\n' + waText + '\n\nPhotos attached.') },
//         { icon: '🏠', label: 'Back to main menu', cls: 'back', cb: flowStart }
//       ]);
//     }, 900);
//   };

//   function onChip(c) {
//     msg(c, 'user');
//     var l = c.toLowerCase();
//     typing(850, function () {
//       if (l.includes('book') || l.includes('repair'))           flowBookingForm();
//       else if (l.includes('quote') || l.includes('price'))      flowQuote();
//       else if (l.includes('service') || l.includes('offer'))    flowServices();
//       else if (l.includes('area') || l.includes('where') || l.includes('serve')) flowAreas();
//       else if (l.includes('emergency') || l.includes('urgent')) flowEmergency();
//       else if (l.includes('human') || l.includes('person') || l.includes('talk')) flowHuman();
//       else flowStart();
//     });
//   }

//   window.cfrSend = function () {
//     var txt = IN.value.trim(); if (!txt) return; IN.value = '';
//     msg(txt, 'user');
//     var l = txt.toLowerCase();
//     typing(900, function () {
//       if (l.match(/book|appoint|schedul/))                         flowBookingForm();
//       else if (l.match(/quote|cost|price|how much/))               flowQuote();
//       else if (l.match(/service|offer|what do you/))               flowServices();
//       else if (l.match(/area|city|cover|where/))                   flowAreas();
//       else if (l.match(/emergency|urgent|broken|asap|right now/))  flowEmergency();
//       else if (l.match(/human|person|someone|whatsapp/))           flowHuman();
//       else if (l.match(/treadmill/))  { msg("Ugh, treadmill troubles! 😅 Let me get your details so we can send a tech out. 🏃", 'bot'); setTimeout(flowBookingForm, 500); }
//       else if (l.match(/elliptical/)) { msg("Elliptical issues? We'll have that sorted! 🚶 Let me grab your info.", 'bot'); setTimeout(flowBookingForm, 500); }
//       else if (l.match(/bike|peloton|spin/)) { msg("Exercise bike acting up? We fix all brands including Peloton 🚴", 'bot'); setTimeout(flowBookingForm, 500); }
//       else if (l.match(/rower|rowing/)) { msg("Rowing machine on the fritz? We're on it 🚣", 'bot'); setTimeout(flowBookingForm, 500); }
//       else if (l.match(/walk.*pad|walking pad/)) { msg("Walking pad repair — we handle those too! 🚶", 'bot'); setTimeout(flowBookingForm, 500); }
//       else if (l.match(/cable|strength|weight/)) { msg("Strength equipment giving you grief? Our techs fix cables, pulleys, weight stacks 💪", 'bot'); setTimeout(flowBookingForm, 500); }
//       else if (l.match(/warrant|guarantee/)) { msg("Every repair comes with a 30-day parts & labour warranty. If anything acts up again within that window, we come back — no charge. 🛡️", 'bot'); setTimeout(function () { btns([{ icon: '🔧', label: 'Book a repair', cls: 'primary', cb: flowBookingForm }, { icon: '🏠', label: 'Back to menu', cls: 'back', cb: flowStart }]); }, 400); }
//       else if (l.match(/pay|cash|e.?transfer|credit/)) { msg("We accept:\n💵 Cash\n📱 E-Transfer\n💳 Credit Card\n\nYou only pay once the job's done and you're happy! 😊", 'bot'); setTimeout(function () { btns([{ icon: '🔧', label: 'Book a repair', cls: 'primary', cb: flowBookingForm }, { icon: '🏠', label: 'Back to menu', cls: 'back', cb: flowStart }]); }, 400); }
//       else if (l.match(/remov|dispos|get rid|recycle/)) { msg("We do equipment removal too! 🗑️ We remove treadmills, ellipticals, full gym setups and recycle over 90% responsibly.", 'bot'); setTimeout(function () { btns([{ icon: '📋', label: 'Book a removal', cls: 'primary', cb: flowBookingForm }, { icon: '📞', label: 'Call us', url: 'tel:2899257239' }, { icon: '🏠', label: 'Back to menu', cls: 'back', cb: flowStart }]); }, 400); }
//       else if (l.match(/hi|hello|hey|howdy/)) { msg(userName ? 'Hey ' + fn(userName) + '! 👋 How can I help?' : 'Hey! 👋 Great to have you here.', 'bot'); setTimeout(function () { chips(['🔧 Book a repair', '💬 Get a quote', '🛠 Our services', '🙋 Talk to a person']); }, 400); }
//       else { msg("Hmm, not 100% sure about that one! 😅 Let me get you to the right place.", 'bot'); setTimeout(flowHuman, 500); }
//     });
//   };

//   function fn(n) { return n ? n.split(' ')[0] : ''; }

//   /* ── Open / Close — hide/show bubble ── */
//   window.cfrOpen = function () {
//     isOpen = true;
//     WIN.classList.add('cfr-open');
//     BWRAP.classList.add('cfr-hidden');          // ← hide bubble when chat is open
//     document.getElementById('cfr-teaser').style.display = 'none';
//     if (M.children.length === 0) flowStart();
//     setTimeout(function () { IN.focus(); }, 300);
//   };

//   window.cfrClose = function () {
//     isOpen = false;
//     WIN.classList.remove('cfr-open');
//     BWRAP.classList.remove('cfr-hidden');       // ← show bubble again when closed
//   };

//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', init);
//   } else {
//     init();
//   }

// })();


// ═══════════════════════════════════════════════════════════════════════════
// CFR INTELLIGENT CHATBOT - Production Ready
// ═══════════════════════════════════════════════════════════════════════════
// Combines your existing beautiful UI with Claude AI intelligence
// Copy-paste ready - just update the configuration section below
// ═══════════════════════════════════════════════════════════════════════════

(function injectCFRIntelligentChatbot() {

  // ╔═══════════════════════════════════════════════════════════════════════╗
  // ║  CONFIGURATION - UPDATE THESE VALUES FOR YOUR WEBSITE                 ║
  // ╚═══════════════════════════════════════════════════════════════════════╝
  
  const CONFIG = {
    // Training data location (upload this file to your website)
    TRAINING_DATA_URL: '/data/repairs.jsonl',
    
    // AI Mode: 'claude-api' = smart AI, 'embeddings' = local matching, 'rules' = basic
    AI_MODE: 'claude-api',  // Change to 'rules' for basic mode (no API needed)
    
    // Claude API settings (only needed if AI_MODE = 'claude-api')
    CLAUDE_API_KEY: '',  // Leave empty for basic mode, or add your key for smart AI
    CLAUDE_MODEL: 'claude-sonnet-4-20250514',
    MAX_TOKENS: 1000,
    
    // Similarity threshold for embeddings mode (0.0 to 1.0)
    SIMILARITY_THRESHOLD: 0.65,
    
    // Response timing
    TYPING_DELAY: 900,  // milliseconds
  };

  // ═══════════════════════════════════════════════════════════════════════
  // GLOBAL STATE
  // ═══════════════════════════════════════════════════════════════════════
  
  let isOpen = false;
  let userName = '';
  let M, IN, WIN, BWRAP;
  let trainingData = [];
  let conversationHistory = [];
  let isAIReady = false;
  
  // For embeddings mode
  let repairVectors = [];
  let embedder = null;
  let embedderReady = false;

  // ═══════════════════════════════════════════════════════════════════════
  // 1. STYLES (Your existing beautiful design)
  // ═══════════════════════════════════════════════════════════════════════
  
  var css = document.createElement('style');
  css.textContent = `
#cfr-bubble-wrap,#cfr-teaser,#cfr-win{--cfr-amber:#f59e0b;--cfr-amber-soft:#fbbf24;--cfr-amber-deep:#d97706;--cfr-purple:#5d5dff;--cfr-purple-deep:#4338ca;--cfr-ink:#0d1117;--cfr-panel:#151a23;--cfr-panel-2:#222936;--cfr-line:rgba(255,255,255,.09);--cfr-muted:#94a0b3;font-family:'Poppins','Montserrat','Segoe UI',Roboto,-apple-system,BlinkMacSystemFont,sans-serif}

/* ── Launcher ─────────────────────────────────────────────────────────── */
#cfr-bubble-wrap{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;gap:12px;transition:opacity .2s ease,transform .2s ease,visibility .2s ease}
#cfr-bubble-wrap.cfr-hidden{opacity:0;pointer-events:none;visibility:hidden}
#cfr-bubble-label{background:rgba(20,24,32,.94);color:#e8edf6;font-size:12.5px;font-weight:600;letter-spacing:.01em;padding:9px 15px;border-radius:999px;border:1px solid rgba(245,158,11,.35);box-shadow:0 12px 28px -16px rgba(0,0,0,.9),inset 0 0 0 1px rgba(255,255,255,.04);white-space:nowrap;animation:cfrLabelBob 4s ease-in-out infinite;cursor:pointer;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
@keyframes cfrLabelBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
#cfr-bubble{position:relative;width:64px;height:64px;border-radius:50%;border:none;cursor:pointer;padding:2px;background:linear-gradient(145deg,#fbbf24 0%,#f59e0b 45%,#5d5dff 125%);display:flex;align-items:center;justify-content:center;box-shadow:0 14px 32px -12px rgba(0,0,0,.9);transition:transform .22s ease,box-shadow .22s ease;animation:cfrRingPulse 3s ease-in-out infinite}
@keyframes cfrRingPulse{0%,100%{box-shadow:0 14px 32px -12px rgba(0,0,0,.9),0 0 0 0 rgba(245,158,11,.32)}50%{box-shadow:0 14px 32px -12px rgba(0,0,0,.9),0 0 0 9px rgba(245,158,11,0)}}
#cfr-bubble:hover{transform:translateY(-2px) scale(1.04);animation:none;box-shadow:0 20px 40px -14px rgba(0,0,0,.95),0 0 0 6px rgba(245,158,11,.14)}
#cfr-bubble:focus-visible{outline:3px solid rgba(251,191,36,.65);outline-offset:3px}
#cfr-bubble svg{width:100%;height:100%;border-radius:50%;display:block}
#cfr-bubble-notif{position:absolute;right:1px;bottom:5px;width:16px;height:16px;border-radius:50%;background:#22c55e;border:3px solid #12161e;animation:cfrOnlineGlow 2.6s ease-in-out infinite}
@keyframes cfrOnlineGlow{0%,100%{box-shadow:0 0 0 1px rgba(34,197,94,.4),0 0 0 0 rgba(34,197,94,.4)}50%{box-shadow:0 0 0 1px rgba(34,197,94,.4),0 0 0 7px rgba(34,197,94,0)}}

/* ── Teaser — iMessage-style notification ─────────────────────────────── */
#cfr-teaser{position:fixed;bottom:152px;right:24px;width:304px;max-width:calc(100vw - 48px);background:linear-gradient(180deg,#1c2230 0%,#151a23 100%);color:#e9edf5;font-size:13px;line-height:1.5;padding:14px;border-radius:20px;border:1px solid rgba(255,255,255,.1);box-shadow:0 26px 60px -24px rgba(0,0,0,.95),inset 0 0 0 1px rgba(245,158,11,.06);z-index:9997;display:none;animation:cfrFadeUp .4s cubic-bezier(.2,.8,.3,1);cursor:pointer;transition:opacity .25s ease,transform .25s ease}
#cfr-teaser.cfr-teaser-hiding{opacity:0;transform:translateY(6px);pointer-events:none}
#cfr-teaser::after{content:"";position:absolute;right:27px;bottom:-7px;width:13px;height:13px;background:#151a23;border-right:1px solid rgba(255,255,255,.1);border-bottom:1px solid rgba(255,255,255,.1);transform:rotate(45deg);border-radius:0 0 3px 0}
#cfr-teaser:focus-visible{outline:2px solid rgba(251,191,36,.8);outline-offset:3px}
.cfr-teaser-top{display:flex;align-items:flex-start;gap:11px}
.cfr-teaser-av{width:40px;height:40px;border-radius:50%;overflow:hidden;flex-shrink:0;border:2px solid rgba(245,158,11,.6);box-shadow:0 4px 14px -4px rgba(0,0,0,.7)}
.cfr-teaser-av svg{width:100%;height:100%;display:block;border-radius:50%;background:#1b2230}
.cfr-teaser-body{flex:1;min-width:0}
.cfr-teaser-who{display:block;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#fbbf24;margin:0 0 3px;padding-right:22px}
.cfr-teaser-msg{display:block;font-size:13px;line-height:1.45;color:#dbe2ee}
.cfr-teaser-msg strong{display:block;color:#f7f9fc;font-weight:600;margin-top:3px}
#cfr-teaser-dismiss{position:absolute;top:9px;right:9px;width:24px;height:24px;border-radius:50%;border:1px solid transparent;background:rgba(255,255,255,.07);color:#98a3b4;font-size:15px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;font-family:inherit;transition:background .18s,color .18s,transform .18s}
#cfr-teaser-dismiss:hover{background:rgba(255,255,255,.15);color:#fff;transform:scale(1.06)}
#cfr-teaser-dismiss:focus-visible{outline:2px solid rgba(251,191,36,.7);outline-offset:1px}

/* ── Window — desktop ─────────────────────────────────────────────────── */
#cfr-win{position:fixed;bottom:104px;right:24px;width:392px;max-width:calc(100vw - 24px);height:min(640px,calc(100vh - 128px));height:min(640px,calc(100dvh - 128px));max-height:calc(100dvh - 128px);background:#10141b;border-radius:24px;border:1px solid rgba(255,255,255,.1);box-shadow:0 42px 90px -32px rgba(0,0,0,.95),0 0 0 1px rgba(245,158,11,.05);display:none;flex-direction:column;overflow:hidden;z-index:9998}
#cfr-win.cfr-open{display:flex;animation:cfrFadeUp .3s cubic-bezier(.2,.8,.3,1)}
#cfr-win.cfr-closing{display:flex;animation:cfrFadeDown .22s ease forwards}
@keyframes cfrFadeUp{from{opacity:0;transform:translateY(16px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes cfrFadeDown{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(14px) scale(.99)}}

/* ── Header ───────────────────────────────────────────────────────────── */
.cfr-hd{position:relative;display:flex;align-items:center;gap:12px;flex-shrink:0;padding:16px 62px 16px 16px;background:radial-gradient(150px 120px at 88% -30%,rgba(251,191,36,.38),transparent 70%),linear-gradient(120deg,#241c44 0%,#3b2f8f 48%,#4f46e5 100%);border-bottom:1px solid rgba(245,158,11,.32)}
.cfr-hd::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,rgba(245,158,11,.85),rgba(251,191,36,.35) 45%,transparent 70%);pointer-events:none}
.cfr-hd-av{position:relative;width:46px;height:46px;border-radius:50%;padding:2px;background:linear-gradient(145deg,#fbbf24,#5d5dff);flex-shrink:0;box-shadow:0 8px 18px -8px rgba(0,0,0,.8)}
.cfr-hd-av svg{width:100%;height:100%;border-radius:50%;display:block;background:#151a24}
.cfr-hd-online{position:absolute;right:-1px;bottom:0;width:12px;height:12px;border-radius:50%;background:#22c55e;border:2.5px solid #2f2470;box-shadow:0 0 8px rgba(34,197,94,.85)}
.cfr-hd-info{flex:1;min-width:0}
.cfr-hd-name{display:flex;align-items:center;gap:6px;font-size:14.5px;font-weight:700;color:#fff;line-height:1.25;letter-spacing:.01em;white-space:nowrap}
.cfr-hd-role{font-size:12px;font-weight:500;color:rgba(253,230,138,.85)}
.cfr-ai-badge{display:inline-block;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);padding:2px 7px;border-radius:999px;font-size:9px;font-weight:600;letter-spacing:.02em;color:#fff}
.cfr-hd-sub{display:flex;align-items:center;gap:6px;margin-top:3px;font-size:11px;color:rgba(255,255,255,.75)}
.cfr-hd-sub::before{content:'';width:7px;height:7px;background:#4ade80;border-radius:50%;box-shadow:0 0 0 3px rgba(74,222,128,.18);display:inline-block;flex-shrink:0}
.cfr-x{position:absolute;top:50%;right:12px;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;background:rgba(10,12,18,.28);border:1px solid rgba(255,255,255,.22);color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .18s ease,transform .18s ease}
.cfr-x:hover,.cfr-x:focus-visible{background:rgba(10,12,18,.5);transform:translateY(-50%) rotate(90deg);outline:none}
.cfr-x:focus-visible{box-shadow:0 0 0 3px rgba(251,191,36,.55)}

/* ── Conversation ─────────────────────────────────────────────────────── */
.cfr-msgs{flex:1;min-height:0;overflow-y:auto;padding:16px 14px 18px;display:flex;flex-direction:column;gap:10px;background:radial-gradient(130% 80% at 50% 0%,rgba(93,93,255,.09),transparent 62%),#0f131a;scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.18) transparent}
.cfr-msgs::-webkit-scrollbar{width:6px}
.cfr-msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.16);border-radius:99px}
.cfr-m{max-width:84%;padding:10px 14px;border-radius:18px;font-size:13.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word;box-shadow:0 1px 2px rgba(0,0,0,.25);animation:cfrMsgIn .28s cubic-bezier(.2,.8,.3,1) both}
@keyframes cfrMsgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.cfr-m.bot{background:#222936;color:#e8edf5;border:1px solid rgba(255,255,255,.05);border-bottom-left-radius:6px;align-self:flex-start}
.cfr-m.user{background:linear-gradient(135deg,#6366f1 0%,#5d5dff 62%,#4f46e5 100%);color:#fff;border-bottom-right-radius:6px;align-self:flex-end;box-shadow:0 10px 22px -14px rgba(93,93,255,.95)}
.cfr-chips{display:flex;flex-wrap:wrap;gap:8px;align-self:flex-start;max-width:94%;animation:cfrMsgIn .3s ease both}
.cfr-chip{background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.32);color:#fcd34d;border-radius:999px;padding:7px 14px;font-size:12.5px;font-weight:500;cursor:pointer;transition:all .18s;font-family:inherit}
.cfr-chip:hover{background:rgba(245,158,11,.16);color:#fff;border-color:rgba(245,158,11,.6)}
.cfr-chip:focus-visible{outline:2px solid rgba(251,191,36,.6);outline-offset:2px}
.cfr-btn-row{display:flex;flex-direction:column;gap:8px;align-self:flex-start;width:94%;animation:cfrMsgIn .3s ease both}
.cfr-btn{background:#1b212c;border:1px solid rgba(255,255,255,.1);color:#e8edf5;border-radius:14px;padding:11px 14px;font-size:13px;cursor:pointer;text-align:left;transition:background .18s,border-color .18s,transform .18s;font-family:inherit;display:flex;align-items:center;gap:10px}
.cfr-btn:hover{background:#232a37;border-color:rgba(245,158,11,.4);transform:translateY(-1px)}
.cfr-btn.primary{background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#1c1305;border-color:transparent;font-weight:700;box-shadow:0 12px 26px -14px rgba(245,158,11,.9)}
.cfr-btn.primary:hover{filter:brightness(1.05);transform:translateY(-1px)}
.cfr-btn.wa{border-color:rgba(37,211,102,.45);color:#6ee7a0}
.cfr-btn.wa:hover{background:rgba(37,211,102,.1);border-color:#25D366}
.cfr-btn.sms{border-color:rgba(78,205,196,.4);color:#5eead4}
.cfr-btn.sms:hover{background:rgba(78,205,196,.1)}
.cfr-btn.email{border-color:rgba(245,158,11,.45);color:#fcd34d}
.cfr-btn.email:hover{background:rgba(245,158,11,.1)}
.cfr-btn.back{border-color:rgba(255,255,255,.08);color:#8b95a7}
.cfr-btn.back:hover{color:#cbd5e1;background:rgba(255,255,255,.04)}
.cfr-btn .bi{font-size:17px;flex-shrink:0}
.cfr-typing{display:flex;align-items:center;gap:5px;padding:13px 16px;background:#222936;border-radius:6px 18px 18px 18px;align-self:flex-start;border:1px solid rgba(255,255,255,.05);animation:cfrMsgIn .2s ease both}
.cfr-typing span{width:7px;height:7px;background:var(--cfr-amber-soft);border-radius:50%;animation:cfrDot 1.3s infinite ease-in-out}
.cfr-typing span:nth-child(2){animation-delay:.15s}
.cfr-typing span:nth-child(3){animation-delay:.3s}
@keyframes cfrDot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}

/* ── In-chat booking form ─────────────────────────────────────────────── */
.cfr-form-panel{align-self:stretch;width:100%;background:linear-gradient(180deg,#1b212c 0%,#151a23 100%);border:1px solid rgba(245,158,11,.22);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:12px;box-shadow:0 16px 34px -24px rgba(0,0,0,.95);animation:cfrMsgIn .3s ease both}
.cfr-form-panel label{display:block;margin-bottom:6px;font-size:11.5px;font-weight:600;letter-spacing:.01em;color:#aab4c5}
.cfr-form-panel input,.cfr-form-panel select,.cfr-form-panel textarea{width:100%;min-height:42px;background:#0e1219;border:1px solid rgba(255,255,255,.1);border-radius:11px;padding:10px 12px;font-size:13.5px;color:#eef2f8;font-family:inherit;outline:none;box-sizing:border-box;transition:border-color .18s ease,box-shadow .18s ease,background-color .18s ease}
.cfr-form-panel input::placeholder,.cfr-form-panel textarea::placeholder{color:#7c8798}
.cfr-form-panel input:focus,.cfr-form-panel select:focus,.cfr-form-panel textarea:focus{border-color:var(--cfr-amber);background-color:#111722;box-shadow:0 0 0 3px rgba(245,158,11,.16)}
.cfr-form-panel select{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23f59e0b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;background-size:11px 7px;padding-right:34px}
.cfr-form-panel select option{background:#151a23;color:#eef2f8}
.cfr-form-panel textarea{resize:vertical;min-height:88px}
.cfr-form-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cfr-form-note{margin:0;font-size:11.5px;line-height:1.5;color:#8b95a7}
.cfr-form-submit{width:100%;min-height:48px;background:linear-gradient(135deg,#fbbf24 0%,#f59e0b 58%,#d97706 100%);color:#1c1305;border:none;border-radius:12px;padding:12px;font-size:14px;font-weight:800;letter-spacing:.01em;cursor:pointer;font-family:inherit;box-shadow:0 14px 30px -14px rgba(245,158,11,.9);transition:filter .2s ease,transform .2s ease,opacity .2s}
.cfr-form-submit:hover{filter:brightness(1.05);transform:translateY(-1px)}
.cfr-form-submit:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none}

/* ── Composer ─────────────────────────────────────────────────────────── */
.cfr-bar{display:flex;align-items:center;gap:10px;padding:12px;background:#141922;border-top:1px solid rgba(255,255,255,.06);flex-shrink:0}
.cfr-in{flex:1;min-width:0;min-height:46px;background:#0e1219;border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:12px 16px;font-size:14px;color:#eef2f8;outline:none;font-family:inherit;transition:border-color .18s ease,box-shadow .18s ease}
.cfr-in:focus{border-color:var(--cfr-amber);box-shadow:0 0 0 3px rgba(245,158,11,.16)}
.cfr-in::placeholder{color:#7c8798}
.cfr-in:disabled{opacity:.5;cursor:not-allowed}
.cfr-go{display:flex;align-items:center;justify-content:center;width:46px;height:46px;padding:0;border:none;border-radius:50%;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#1c1305;cursor:pointer;flex-shrink:0;box-shadow:0 10px 24px -12px rgba(245,158,11,.95);transition:filter .2s ease,transform .2s ease,opacity .2s}
.cfr-go:hover:not(:disabled){filter:brightness(1.06);transform:translateY(-1px)}
.cfr-go:focus-visible{outline:3px solid rgba(251,191,36,.55);outline-offset:2px}
.cfr-go:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
.cfr-go svg{width:19px;height:19px;fill:currentColor}

/* ── Mobile — full-screen app feel (<768px) ───────────────────────────── */
@media(max-width:767px){
  #cfr-win{position:fixed;top:0;left:0;right:0;bottom:0;width:100%;max-width:100%;height:100vh;height:100dvh;max-height:100dvh;border-radius:0;border:none;box-shadow:none;z-index:10000}
  #cfr-win .cfr-msgs{max-height:none;flex:1;min-height:0;padding:14px 12px 20px}
  .cfr-hd{padding:calc(14px + env(safe-area-inset-top)) 64px 14px 14px;gap:11px}
  .cfr-hd-av{width:44px;height:44px}
  .cfr-hd-name{font-size:14px}
  .cfr-x{width:44px;height:44px;right:10px;font-size:24px}
  .cfr-bar{padding:10px 12px calc(10px + env(safe-area-inset-bottom));gap:9px}
  .cfr-in{min-height:48px;padding:12px 16px;font-size:16px}
  .cfr-go{width:48px;height:48px}
  .cfr-form-panel{padding:14px;border-radius:16px;gap:11px}
  .cfr-form-panel label{font-size:12px}
  .cfr-form-panel input,.cfr-form-panel select,.cfr-form-panel textarea{font-size:16px;min-height:46px;padding:11px 12px}
  .cfr-form-panel textarea{min-height:96px}
  .cfr-form-row{grid-template-columns:1fr}
  .cfr-form-submit{min-height:52px;font-size:15px}
  #cfr-bubble-wrap{bottom:max(16px,env(safe-area-inset-bottom));right:16px}
  #cfr-bubble{width:60px;height:60px}
  #cfr-bubble-label{display:none}
  #cfr-teaser{right:16px;bottom:92px;width:auto;max-width:calc(100vw - 32px)}
  #cfr-teaser-dismiss{width:28px;height:28px;top:8px;right:8px;font-size:17px}
  .cfr-m{font-size:14px}
}
@media(max-width:360px){
  #cfr-teaser{right:12px;bottom:88px;max-width:calc(100vw - 24px)}
  #cfr-bubble-wrap{right:12px}
  .cfr-hd-role{font-size:11px}
  .cfr-hd-name{font-size:13.5px}
}
body:has(#cfr-win.cfr-open) .cfr-hd-sub::before{animation:cfrOnlinePulse 2.4s ease-in-out infinite}
@keyframes cfrOnlinePulse{0%,100%{box-shadow:0 0 0 3px rgba(74,222,128,.18)}50%{box-shadow:0 0 0 6px rgba(74,222,128,.04)}}
@media(max-width:767px){
  body:has(#cfr-win.cfr-open){overflow:hidden}
}
@media (prefers-reduced-motion: reduce){
  #cfr-bubble,#cfr-bubble-label,#cfr-bubble-notif,.cfr-m,.cfr-chips,.cfr-btn-row,.cfr-form-panel,.cfr-hd-sub::before{animation:none!important}
  #cfr-win.cfr-open,#cfr-win.cfr-closing{animation-duration:.01ms!important}
  .cfr-typing span{animation-duration:1.8s}
}
  `;
  document.head.appendChild(css);

  // ═══════════════════════════════════════════════════════════════════════
  // 2. HTML STRUCTURE (Your existing layout)
  // ═══════════════════════════════════════════════════════════════════════
  
  var wrap = document.createElement('div');
  wrap.innerHTML = `
    <div id="cfr-teaser">
      <div class="cfr-teaser-top">
        <span class="cfr-teaser-av" aria-hidden="true">
          <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true">
            <circle cx="32" cy="32" r="32" fill="#1b2230"/>
            <path d="M8 64c0-12.7 10.7-21 24-21s24 8.3 24 21z" fill="#4f46e5"/>
            <path d="M8 64c0-12.7 10.7-21 24-21 4.6 0 8.9.9 12.6 2.5L26 64z" fill="#5d5dff" opacity=".6"/>
            <rect x="27.5" y="35" width="9" height="10" rx="4.5" fill="#e3ad84"/>
            <circle cx="32" cy="27" r="12.5" fill="#f3c9a3"/>
            <path d="M19.5 26.5c0-7.6 5.6-12.5 12.5-12.5s12.5 4.9 12.5 12.5c0-2.6-2.4-4.4-5.6-4.4-2.1 0-3.6-1.7-6.9-1.7-3.6 0-6.6 2.2-8.4 3.3-2 1.2-4.1 1-4.1 2.8z" fill="#2a2118"/>
            <path d="M17.5 27a14.5 14.5 0 0129 0" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
            <rect x="13" y="23.5" width="6.5" height="12" rx="3.25" fill="#f59e0b"/>
            <path d="M17.5 34c.4 4.4 3.8 7 7.5 7.2" fill="none" stroke="#f59e0b" stroke-width="2.4" stroke-linecap="round"/>
            <circle cx="26" cy="41.4" r="2.1" fill="#fbbf24"/>
            <circle cx="27.6" cy="27.4" r="1.5" fill="#2a2118"/>
            <circle cx="36.4" cy="27.4" r="1.5" fill="#2a2118"/>
            <path d="M28.3 32.2c2.1 2 5.3 2 7.4 0" fill="none" stroke="#b3744d" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </span>
        <div class="cfr-teaser-body">
          <span class="cfr-teaser-who">Sam · CFR Support</span>
          <span class="cfr-teaser-msg">Hi there! 👋 Need help with your equipment?
            <strong>We're online &amp; ready to help!</strong>
          </span>
        </div>
      </div>
      <button type="button" id="cfr-teaser-dismiss" aria-label="Dismiss message">×</button>
    </div>

    <div id="cfr-bubble-wrap">
      <div id="cfr-bubble-label" onclick="cfrOpen()">💬 Chat with Sam — we're online!</div>
      <button id="cfr-bubble" onclick="cfrOpen()" aria-label="Chat with Sam, our support technician">
        <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true">
          <circle cx="32" cy="32" r="32" fill="#1b2230"/>
          <path d="M8 64c0-12.7 10.7-21 24-21s24 8.3 24 21z" fill="#4f46e5"/>
          <path d="M8 64c0-12.7 10.7-21 24-21 4.6 0 8.9.9 12.6 2.5L26 64z" fill="#5d5dff" opacity=".6"/>
          <rect x="27.5" y="35" width="9" height="10" rx="4.5" fill="#e3ad84"/>
          <circle cx="32" cy="27" r="12.5" fill="#f3c9a3"/>
          <path d="M19.5 26.5c0-7.6 5.6-12.5 12.5-12.5s12.5 4.9 12.5 12.5c0-2.6-2.4-4.4-5.6-4.4-2.1 0-3.6-1.7-6.9-1.7-3.6 0-6.6 2.2-8.4 3.3-2 1.2-4.1 1-4.1 2.8z" fill="#2a2118"/>
          <path d="M17.5 27a14.5 14.5 0 0129 0" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
          <rect x="13" y="23.5" width="6.5" height="12" rx="3.25" fill="#f59e0b"/>
          <path d="M17.5 34c.4 4.4 3.8 7 7.5 7.2" fill="none" stroke="#f59e0b" stroke-width="2.4" stroke-linecap="round"/>
          <circle cx="26" cy="41.4" r="2.1" fill="#fbbf24"/>
          <circle cx="27.6" cy="27.4" r="1.5" fill="#2a2118"/>
          <circle cx="36.4" cy="27.4" r="1.5" fill="#2a2118"/>
          <path d="M28.3 32.2c2.1 2 5.3 2 7.4 0" fill="none" stroke="#b3744d" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
        <span id="cfr-bubble-notif"></span>
      </button>
    </div>

    <div id="cfr-win" role="dialog" aria-label="Chat with Sam from Canadian Fitness Repair">
      <div class="cfr-hd">
        <div class="cfr-hd-av">
          <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true">
            <circle cx="32" cy="32" r="32" fill="#1b2230"/>
            <path d="M8 64c0-12.7 10.7-21 24-21s24 8.3 24 21z" fill="#4f46e5"/>
            <path d="M8 64c0-12.7 10.7-21 24-21 4.6 0 8.9.9 12.6 2.5L26 64z" fill="#5d5dff" opacity=".6"/>
            <rect x="27.5" y="35" width="9" height="10" rx="4.5" fill="#e3ad84"/>
            <circle cx="32" cy="27" r="12.5" fill="#f3c9a3"/>
            <path d="M19.5 26.5c0-7.6 5.6-12.5 12.5-12.5s12.5 4.9 12.5 12.5c0-2.6-2.4-4.4-5.6-4.4-2.1 0-3.6-1.7-6.9-1.7-3.6 0-6.6 2.2-8.4 3.3-2 1.2-4.1 1-4.1 2.8z" fill="#2a2118"/>
            <path d="M17.5 27a14.5 14.5 0 0129 0" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
            <rect x="13" y="23.5" width="6.5" height="12" rx="3.25" fill="#f59e0b"/>
            <path d="M17.5 34c.4 4.4 3.8 7 7.5 7.2" fill="none" stroke="#f59e0b" stroke-width="2.4" stroke-linecap="round"/>
            <circle cx="26" cy="41.4" r="2.1" fill="#fbbf24"/>
            <circle cx="27.6" cy="27.4" r="1.5" fill="#2a2118"/>
            <circle cx="36.4" cy="27.4" r="1.5" fill="#2a2118"/>
            <path d="M28.3 32.2c2.1 2 5.3 2 7.4 0" fill="none" stroke="#b3744d" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          <span class="cfr-hd-online" aria-hidden="true"></span>
        </div>
        <div class="cfr-hd-info">
          <div class="cfr-hd-name">
            Sam <span class="cfr-hd-role">· CFR Support</span>
            <span class="cfr-ai-badge" id="cfr-ai-badge">✨ AI</span>
          </div>
          <div class="cfr-hd-sub">Online — replies in seconds</div>
        </div>
        <button class="cfr-x" onclick="cfrClose()" aria-label="Close chat" title="Close chat">×</button>
      </div>
      <div class="cfr-msgs" id="cfrMsgs"></div>
      <div class="cfr-bar">
        <input id="cfrIn" class="cfr-in" placeholder="Type a message…"
          onkeydown="if(event.key==='Enter')cfrSend()" aria-label="Message" />
        <button class="cfr-go" onclick="cfrSend()" id="cfr-send-btn" aria-label="Send message">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  // ═══════════════════════════════════════════════════════════════════════
  // 3. INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════
  
  function init() {
    M = document.getElementById('cfrMsgs');
    IN = document.getElementById('cfrIn');
    WIN = document.getElementById('cfr-win');
    BWRAP = document.getElementById('cfr-bubble-wrap');
    window.SENDBTN = document.getElementById('cfr-send-btn');
    
    // Update AI badge
    const badge = document.getElementById('cfr-ai-badge');
    if (CONFIG.AI_MODE === 'claude-api' && CONFIG.CLAUDE_API_KEY) {
      badge.textContent = '✨ AI-Powered';
    } else if (CONFIG.AI_MODE === 'embeddings') {
      badge.textContent = '🧠 Smart';
    } else {
      badge.textContent = '⚡ Fast';
    }
    
    // Teaser: show once per session, then collapse back to the bubble.
    var teaser = document.getElementById('cfr-teaser');
    var teaserDismiss = document.getElementById('cfr-teaser-dismiss');
    var teaserTimer = null;

    function hideTeaser() {
      if (!teaser || teaser.style.display === 'none') return;
      teaser.classList.add('cfr-teaser-hiding');
      setTimeout(function () {
        teaser.style.display = 'none';
        teaser.classList.remove('cfr-teaser-hiding');
      }, 250);
    }

    if (teaser) {
      teaser.addEventListener('click', function (event) {
        if (event.target.closest('#cfr-teaser-dismiss')) return;
        cfrOpen();
      });
    }

    if (teaserDismiss) {
      teaserDismiss.addEventListener('click', function (event) {
        event.stopPropagation();
        sessionStorage.setItem('cfrTeaserDismissed', '1');
        clearTimeout(teaserTimer);
        hideTeaser();
      });
    }

    if (
      teaser &&
      !sessionStorage.getItem('cfrTeaserDismissed') &&
      !sessionStorage.getItem('cfrTeaserShown')
    ) {
      teaserTimer = setTimeout(function () {
        if (isOpen) return;
        sessionStorage.setItem('cfrTeaserShown', '1');
        teaser.style.display = 'block';
        teaserTimer = setTimeout(hideTeaser, 9000);
      }, 4000);
    }

    // Hide the floating launcher while a page field is focused so it can
    // never sit on top of an input, select or textarea.
    var focusOutTimer = null;
    function isPageField(el) {
      if (!el || !el.matches || el.closest('#cfr-win')) return false;
      return el.matches(
        'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]), textarea, select'
      );
    }
    document.addEventListener('focusin', function (event) {
      if (!isPageField(event.target)) return;
      clearTimeout(focusOutTimer);
      document.body.classList.add('cfr-input-focus');
    });
    document.addEventListener('focusout', function (event) {
      if (!isPageField(event.target)) return;
      focusOutTimer = setTimeout(function () {
        if (!isPageField(document.activeElement)) {
          document.body.classList.remove('cfr-input-focus');
        }
      }, 180);
    });

    // Allow closing the chat with the Escape key.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen) cfrClose();
    });

    // Load AI system
    initializeAI();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 4. AI SYSTEM INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════
  
  async function initializeAI() {
    console.log(`[CFR] Initializing AI mode: ${CONFIG.AI_MODE}`);
    
    // Load training data for all AI modes
    try {
      const response = await fetch(CONFIG.TRAINING_DATA_URL);
      const text = await response.text();
      trainingData = text.trim().split('\n').map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
      
      console.log(`[CFR] Loaded ${trainingData.length} training examples`);
      isAIReady = true;
    } catch (error) {
      console.warn('[CFR] Could not load training data:', error);
    }
    
    // Initialize embeddings if needed
    if (CONFIG.AI_MODE === 'embeddings') {
      await initializeEmbeddings();
    }
  }

  async function initializeEmbeddings() {
    try {
      const module = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.11.0/dist/transformers.min.js');
      embedder = await module.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      embedderReady = true;
      console.log('[CFR] Embedder ready');
      await loadRepairVectors();
    } catch (error) {
      console.error('[CFR] Embedder initialization failed:', error);
    }
  }

  async function loadRepairVectors() {
    const cached = localStorage.getItem('cfrRepairVectors');
    if (cached) {
      try {
        repairVectors = JSON.parse(cached);
        console.log(`[CFR] Loaded ${repairVectors.length} vectors from cache`);
        return;
      } catch (e) {
        console.warn('[CFR] Cache parse error', e);
      }
    }
    
    const vectors = [];
    for (let entry of trainingData) {
      const userMsg = entry.messages.find(m => m.role === 'user')?.content || '';
      const assistantReply = entry.messages.find(m => m.role === 'assistant')?.content || '';
      if (userMsg && assistantReply && embedder) {
        const emb = await embedder(userMsg, { pooling: 'mean' });
        vectors.push({
          embedding: Array.from(emb.data),
          userMsg: userMsg,
          assistantReply: assistantReply
        });
      }
    }
    repairVectors = vectors;
    localStorage.setItem('cfrRepairVectors', JSON.stringify(repairVectors));
    console.log(`[CFR] Indexed ${repairVectors.length} repair cases`);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 5. AI RESPONSE GENERATION
  // ═══════════════════════════════════════════════════════════════════════
  
  async function getAIResponse(userMessage) {
    if (CONFIG.AI_MODE === 'claude-api' && CONFIG.CLAUDE_API_KEY) {
      return await getClaudeAPIResponse(userMessage);
    } else if (CONFIG.AI_MODE === 'embeddings' && embedderReady) {
      return await getEmbeddingsResponse(userMessage);
    } else {
      return getRuleBasedResponse(userMessage);
    }
  }

  async function getClaudeAPIResponse(userMessage) {
    try {
      const context = buildContextFromTraining(userMessage);
      const messages = [...conversationHistory, { role: 'user', content: userMessage }];

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CONFIG.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: CONFIG.CLAUDE_MODEL,
          max_tokens: CONFIG.MAX_TOKENS,
          system: `You are Sam from Canadian Fitness Repair, a professional and friendly fitness equipment repair service based in Hamilton, Ontario, Canada.

CONTEXT FROM PAST CUSTOMER INTERACTIONS:
${context}

YOUR ROLE:
- Provide helpful, professional, and friendly responses
- Include specific service fees when relevant ($150-$180 for most repairs)
- Mention what's included: travel, diagnostic, repair attempt during same visit
- Always include a clear call to action
- Be concise but warm and personable
- Use emojis sparingly but appropriately

SERVICES YOU OFFER:
- Treadmill repair & maintenance
- Elliptical repair
- Exercise bike repair (including Peloton)
- Rowing machine repair
- Strength equipment repair
- Walking pad repair
- Equipment removal & disposal

SERVICE AREA: Greater Toronto & Hamilton Area (GTA)

KEY POINTS:
- Most repairs: $150-$180 (includes travel + diagnostic + repair attempt)
- 30-day parts & labour warranty
- Payment after job completion (cash, e-transfer, credit card)
- Same-day/emergency service available

Keep responses under 150 words. If the person wants to book, pricing info, or talk to a human, guide them to the appropriate action.`,
          messages: messages
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      const reply = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n');

      conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: reply }
      );
      if (conversationHistory.length > 6) {
        conversationHistory = conversationHistory.slice(-6);
      }

      return { text: reply, source: 'claude-api' };
    } catch (error) {
      console.error('[CFR] Claude API error:', error);
      return getRuleBasedResponse(userMessage);
    }
  }

  async function getEmbeddingsResponse(userMessage) {
    try {
      const similar = await getSimilarRepairs(userMessage, 1);
      if (similar.length > 0 && similar[0].score >= CONFIG.SIMILARITY_THRESHOLD) {
        return {
          text: similar[0].assistantReply,
          source: 'embeddings',
          score: similar[0].score
        };
      }
    } catch (error) {
      console.error('[CFR] Embeddings error:', error);
    }
    return getRuleBasedResponse(userMessage);
  }

  function buildContextFromTraining(userMessage) {
    if (!trainingData.length) return '';
    const lower = userMessage.toLowerCase();
    const relevant = trainingData.filter(ex => {
      const content = ex.messages[0].content.toLowerCase();
      return (
        (lower.includes('treadmill') && content.includes('treadmill')) ||
        (lower.includes('elliptical') && content.includes('elliptical')) ||
        (lower.includes('bike') && content.includes('bike')) ||
        (lower.includes('price') && content.includes('price')) ||
        (lower.includes('quote') && content.includes('quote'))
      );
    }).slice(0, 3);

    if (!relevant.length) {
      relevant.push(...trainingData.slice(0, 2));
    }

    return relevant.map(ex => {
      const userReq = ex.messages[0].content.substring(0, 300);
      const samReply = ex.messages[1].content.substring(0, 400);
      return `Example:\nCustomer: ${userReq}...\nSam: ${samReply}...`;
    }).join('\n\n');
  }

  function cosineSimilarity(vecA, vecB) {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  async function getSimilarRepairs(userMessage, topK = 2) {
    if (!embedder || repairVectors.length === 0) return [];
    const queryEmb = await embedder(userMessage, { pooling: 'mean' });
    const queryVec = Array.from(queryEmb.data);
    const scored = repairVectors.map(rep => ({
      ...rep,
      score: cosineSimilarity(queryVec, rep.embedding)
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  function getRuleBasedResponse(userMessage) {
    const lower = userMessage.toLowerCase();
    
    if (lower.match(/price|cost|quote|how much/)) {
      return {
        text: "Our standard service call is $150-$180, which includes:\n\n✅ Travel to your location\n✅ Full diagnostic inspection\n✅ Repair attempt during the same visit (if no parts needed)\n\nIf parts are required, we'll provide a quote before proceeding.\n\nWould you like to book an appointment?",
        source: 'rules',
        action: 'show_booking_chips'
      };
    }
    
    if (lower.match(/treadmill/)) {
      return {
        text: "Treadmill troubles? We handle all common issues:\n\n🔧 Error codes (E1, E2, etc.)\n🔧 Belt problems\n🔧 Console issues\n🔧 Strange noises\n\nService fee: $160 (travel + diagnostic + repair attempt)\n\nShall I get your booking details?",
        source: 'rules',
        action: 'suggest_booking'
      };
    }
    
    if (lower.match(/area|service|location|where/)) {
      return {
        text: "We service the Greater Toronto & Hamilton Area (GTA):\n\n📍 Hamilton, Burlington, Oakville\n📍 Mississauga, Toronto, Brampton\n📍 Kitchener, Cambridge, Guelph\n\nAnd surrounding areas! What city are you in?",
        source: 'rules'
      };
    }
    
    return {
      text: "Thanks for your message! To help you best, could you tell me:\n\n1️⃣ What type of equipment?\n2️⃣ What's the issue?\n3️⃣ Your city/area?\n\nOr if you prefer: (289) 925-7239",
      source: 'rules',
      action: 'show_main_chips'
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 6. UI RENDERING FUNCTIONS (Your existing design)
  // ═══════════════════════════════════════════════════════════════════════
  
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
        var isLinkOnly = b.url && (!b.cb || b.cb.toString().trim() === 'function () {}');
        if (b.url) window.open(b.url, '_blank');
        if (!isLinkOnly && b.cb) {
          row.remove();
          b.cb();
        } else if (isLinkOnly) {
          if (!row.dataset.nudged) {
            row.dataset.nudged = '1';
            setTimeout(function () {
              msg("Feel free to reach out anytime! 😊 Anything else I can help with?", 'bot');
              var nudge = document.createElement('div');
              nudge.className = 'cfr-chips';
              var startBtn = document.createElement('button');
              startBtn.className = 'cfr-chip';
              startBtn.textContent = '🏠 Start over';
              startBtn.onclick = function () { nudge.remove(); row.remove(); flowStart(); };
              nudge.appendChild(startBtn);
              M.appendChild(nudge);
              M.scrollTop = M.scrollHeight;
            }, 600);
          }
        }
      };
      row.appendChild(el);
    });
    M.appendChild(row);
    M.scrollTop = M.scrollHeight;
    return row;
  }

  function typing(ms, then) {
    var t = document.createElement('div');
    t.className = 'cfr-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    M.appendChild(t);
    M.scrollTop = M.scrollHeight;
    setTimeout(function () { t.remove(); if (typeof then === 'function') then(); }, ms || CONFIG.TYPING_DELAY);
    return t;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 7. CONVERSATION FLOWS (Your existing flows)
  // ═══════════════════════════════════════════════════════════════════════
  
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
        { icon: '📞', label: 'Call us now — (289) 925-7239',  cls: 'primary', url: 'tel:2899257239' },
        { icon: '📱', label: 'Text us — (289) 925-7239',      cls: 'sms',     url: 'sms:2899257239' },
        { icon: '💬', label: 'WhatsApp us',                   cls: 'wa',      url: 'https://wa.me/13653662162' },
        { icon: '📋', label: 'Fill quick booking form here',                  cb: flowBookingForm },
        { icon: '🏠', label: 'Back to main menu',             cls: 'back',    cb: flowStart }
      ]);
    });
  }

  function flowHuman() {
    typing(600, function () {
      msg("Of course! Sometimes you just need a real person 😊\n\nHere are all the ways to reach our team — pick whatever's easiest:", 'bot');
      btns([
        { icon: '💬', label: 'WhatsApp us',                                    cls: 'wa',    url: 'https://wa.me/13653662162' },
        { icon: '📱', label: 'Send us a text — (289) 925-7239',               cls: 'sms',   url: 'sms:2899257239' },
        { icon: '📧', label: 'Email — canadianfitnessrepair@gmail.com',        cls: 'email', url: 'mailto:canadianfitnessrepair@gmail.com' },
        { icon: '📞', label: 'Call us — (289) 925-7239',                       cls: 'primary', url: 'tel:2899257239' },
        { icon: '🏠', label: 'Back to main menu',                              cls: 'back',  cb: flowStart }
      ]);
    });
  }

  function flowQuote() {
    typing(700, function () {
      msg("Happy to help! Here's a rough pricing guide — fully transparent, no hidden fees 😊\n\n💰 Service call + diagnosis: $89\n🔧 Belt adjustment: ~$150\n⚙️ Motor replacement: from $500\n🏢 Commercial plans: $199–$499/mo\n\n✅ Every repair includes a 30-day parts & labour warranty.", 'bot');
      btns([
        { icon: '📋', label: 'Fill quick booking form (right here!)', cls: 'primary', cb: flowBookingForm },
        { icon: '🌐', label: 'Go to full quote page', url: 'https://www.canadianfitnessrepair.com/get-quote.html' },
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
        '<option>Repairs &amp; Tune-Ups</option><option>Preventative Maintenance</option>',
        '<option>Inspection</option><option>Relocation &amp; Assembly</option>',
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
      '<div><label>Model / serial (optional)</label><input id="cf-model" placeholder="e.g. NTL14122.4" /></div>',
      '<div><label>Preferred date &amp; time</label><input id="cf-date" type="datetime-local" /></div>',
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

    // 1. Validation
    if (!fn2)       { alert('Please enter your first name.'); return; }
    if (!ph && !em) { alert('Please enter a phone number or email.'); return; }
    if (!city)      { alert('Please select your city.'); return; }
    if (!eq)        { alert('Please select your equipment type.'); return; }
    if (!desc)      { alert('Please describe the issue.'); return; }

    var name = (fn2 + ' ' + ln).trim();
    
    // 2. Format the text for the follow-up buttons
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

    // 3. Change button to "Sending..." 
    var btn = document.querySelector('.cfr-form-submit');
    if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }

    // 4. ACTUALLY SEND VIA EMAILJS
    // ⚠️ REPLACE THESE WITH YOUR ACTUAL EMAILJS KEYS
  var EMAILJS_SERVICE_ID = "service_15f1fcs"; 
    var EMAILJS_TEMPLATE_ID = "template_pq3tpbe";

    // Map the chatbot fields to match your exact EmailJS template
    var templateParams = {
        firstName: fn2,
        lastName: ln,
        contactNumber: ph,
        email: em,
        preferredContact: pref,
        city: city,
        postal: postal,
        clientType: type,
        serviceRequest: svc,
        equipmentType: eq,
        brand: brand,
        model: model,
        bookingDateTime: dt,
        description: desc,
        address: '',
        province: 'ON',
        country: 'Canada',
        serial: ''
    };

    if (typeof emailjs !== 'undefined') {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(function() {
                // SUCCESS!
                M.querySelectorAll('.cfr-form-panel, .cfr-btn-row').forEach(function (el) { el.remove(); });
                userName = name;
                msg("✅ Got it, " + fn(name) + "! Your booking request is submitted.", 'bot');
                
                setTimeout(function () {
                  msg("We'll reach out shortly to confirm your appointment. If you have photos or a video of the issue, send them over — it helps us come fully prepared! 📸", 'bot');
                  btns([
                    { icon: '📸', label: 'Send photos via WhatsApp', cls: 'wa', url: 'https://wa.me/13653662162?text=' + encodeURIComponent(waText) },
                    { icon: '📸', label: 'Send photos via SMS', cls: 'sms', url: 'sms:2899257239?body=' + encodeURIComponent(waText) },
                    { icon: '📧', label: 'Send photos via Email', cls: 'email', url: 'mailto:canadianfitnessrepair@gmail.com?subject=Booking+-+' + encodeURIComponent(name) + '&body=' + encodeURIComponent('Hi,\n\nBooking details:\n' + waText + '\n\nPhotos attached.') },
                    { icon: '🏠', label: 'Back to main menu', cls: 'back', cb: flowStart }
                  ]);
                }, 900);
            }, function(error) {
                // FAILED
                console.error('EmailJS failed:', error);
                alert("Sorry, we couldn't send your request. Please call us at (289) 925-7239.");
                if (btn) { btn.textContent = '✅ Submit Booking Request'; btn.disabled = false; }
            });
    } else {
        alert("Error: EmailJS not loaded. Please call us at (289) 925-7239.");
        if (btn) { btn.textContent = '✅ Submit Booking Request'; btn.disabled = false; }
    }
  };
  function onChip(c) {
    msg(c, 'user');
    var l = c.toLowerCase();
    typing(850, function () {
      if (l.includes('book') || l.includes('repair'))           flowBookingForm();
      else if (l.includes('quote') || l.includes('price'))      flowQuote();
      else if (l.includes('service') || l.includes('offer'))    flowServices();
      else if (l.includes('area') || l.includes('where') || l.includes('serve')) flowAreas();
      else if (l.includes('emergency') || l.includes('urgent')) flowEmergency();
      else if (l.includes('human') || l.includes('person') || l.includes('talk')) flowHuman();
      else flowStart();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 8. MAIN MESSAGE HANDLER (AI-powered)
  // ═══════════════════════════════════════════════════════════════════════
  
  window.cfrSend = async function() {
    var txt = IN.value.trim();
    if (!txt) return;
    
    IN.value = '';
    IN.disabled = true;
    window.SENDBTN.disabled = true;
    
    msg(txt, 'user');
    
    const typingDiv = typing(CONFIG.TYPING_DELAY);
    
    try {
      const response = await getAIResponse(txt);
      typingDiv.remove();
      msg(response.text, 'bot');
      
      // Show suggested actions based on response
      if (response.action === 'show_booking_chips') {
        setTimeout(() => {
          chips(['📅 Book now', '💬 Ask more', '📞 Call instead']);
        }, 500);
      } else if (response.action === 'suggest_booking') {
        setTimeout(() => {
          btns([
            { icon: '🔧', label: 'Book a repair', cls: 'primary', cb: flowBookingForm },
            { icon: '🏠', label: 'Back to menu', cls: 'back', cb: flowStart }
          ]);
        }, 500);
      } else if (response.action === 'show_main_chips') {
        setTimeout(() => {
          chips(['🔧 Book a repair', '💬 Get a quote', '📞 Call us']);
        }, 500);
      }
      
    } catch (error) {
      typingDiv.remove();
      msg("Sorry, I had a technical issue. Please try again or call us at (289) 925-7239", 'bot');
      console.error('[CFR] Error:', error);
    } finally {
      IN.disabled = false;
      window.SENDBTN.disabled = false;
      IN.focus();
    }
  };

  function fn(n) { return n ? n.split(' ')[0] : ''; }

  // ═══════════════════════════════════════════════════════════════════════
  // 9. WINDOW CONTROLS
  // ═══════════════════════════════════════════════════════════════════════
  
  window.cfrOpen = function () {
    isOpen = true;
    WIN.classList.add('cfr-open');
    BWRAP.classList.add('cfr-hidden');
    document.body.classList.remove('cfr-input-focus');
    var teaser = document.getElementById('cfr-teaser');
    if (teaser) {
      teaser.classList.remove('cfr-teaser-hiding');
      teaser.style.display = 'none';
    }
    if (M.children.length === 0) flowStart();
    setTimeout(function () { IN.focus(); }, 300);
  };

  window.cfrClose = function () {
    if (!isOpen) return;
    isOpen = false;

    // Play the fade-down animation, then restore the launcher bubble.
    WIN.classList.add('cfr-closing');

    var finished = false;
    function finishClose() {
      if (finished) return;
      finished = true;
      WIN.removeEventListener('animationend', finishClose);
      WIN.classList.remove('cfr-open', 'cfr-closing');
      BWRAP.classList.remove('cfr-hidden');

      var bubble = document.getElementById('cfr-bubble');
      if (bubble) bubble.focus();
    }

    WIN.addEventListener('animationend', finishClose);
    // Fallback for reduced-motion or browsers that skip the animation.
    setTimeout(finishClose, 320);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 10. AUTO-INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();