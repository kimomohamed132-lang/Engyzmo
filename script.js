/* ============================================================
   0. CORE SETUP
   ============================================================ */
window.addEventListener('load', () => {
  const splash = document.getElementById('splash-screen');
  setTimeout(() => { splash.classList.add('hidden'); setTimeout(() => splash.remove(), 600); }, 2500); 
  
  loadGlobalState(); 
  
  // Initialize Topics
  initTopic('krach', krachData, krachTextRaw);
  initTopic('neueheimat', neueHeimatData, neueHeimatTextRaw);
  initTopic('muttersprache', mutterspracheData, mutterspracheTextRaw);
  
  // Build Practices
  buildTekamolo();
  buildNeueHeimatMCQ();
  buildMuttersprachePassiv();
  buildMutterspracheMCQ();
  
  setupTooltips();
});

function openPage(pageId) {
  document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  window.scrollTo(0, 0);
}

function switchTopicTab(prefix, tabName, btnElement) {
  const parent = btnElement.parentElement;
  parent.querySelectorAll('.sub-btn').forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');
  
  document.getElementById(`${prefix}-lesetext`).classList.remove('active');
  document.getElementById(`${prefix}-flashcards`).classList.remove('active');
  const practiceTab = document.getElementById(`${prefix}-practice`);
  if(practiceTab) practiceTab.classList.remove('active');
  
  document.getElementById(`${prefix}-${tabName}`).classList.add('active');
}

function switchPracticeTab(prefix, tabName, btnElement) {
  const parent = btnElement.parentElement;
  parent.querySelectorAll('.fc-toggle-btn').forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');
  
  const container = document.getElementById(`${prefix}-practice`);
  container.querySelectorAll('.practice-tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(`${prefix}-${tabName}`).classList.add('active');
}

document.querySelectorAll('.fc-toggle-btn').forEach(btn => {
  if(btn.hasAttribute('onclick')) return; 
  btn.addEventListener('click', () => {
    const parent = btn.closest('.sub-view');
    parent.querySelectorAll('.fc-toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    parent.querySelectorAll('.fc-view').forEach(v => v.classList.remove('active'));
    const targetId = btn.dataset.fcview;
    document.getElementById(targetId).classList.add('active');
    if (targetId.includes('-study-view')) {
      const prefix = targetId.split('-study-view')[0];
      if(window[`renderStudyCard_${prefix}`]) window[`renderStudyCard_${prefix}`]();
    }
  });
});

/* ============================================================
   1. GLOBAL STATE & LOGIC
   ============================================================ */
let appState = {
  krach: { reviewQueue: [], studyOrder: [], studyPos: 0 },
  neueheimat: { reviewQueue: [], studyOrder: [], studyPos: 0 },
  muttersprache: { reviewQueue: [], studyOrder: [], studyPos: 0 }
};

function loadGlobalState() {
  const saved = localStorage.getItem('engyzmo_state_v9'); 
  if (saved) {
    const parsed = JSON.parse(saved);
    appState.krach = parsed.krach || appState.krach;
    appState.neueheimat = parsed.neueheimat || appState.neueheimat;
    appState.muttersprache = parsed.muttersprache || appState.muttersprache;
  }
}
function saveGlobalState() { localStorage.setItem('engyzmo_state_v9', JSON.stringify(appState)); }

function shuffle(arr){
  const a = [...arr];
  for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

let toastTimer;
function showToast(msg){
  const toast = document.getElementById('toast');
  toast.textContent = msg; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function initTopic(prefix, dataArray, htmlText) {
  const textContainer = document.getElementById(`${prefix}-text-container`);
  if(textContainer) textContainer.innerHTML = htmlText;

  if(appState[prefix].studyOrder.length === 0 || appState[prefix].studyOrder.length !== dataArray.length) {
    appState[prefix].studyOrder = shuffle(dataArray.map((_, i) => i));
    appState[prefix].studyPos = 0;
  }
  
  const grid = document.getElementById(`${prefix}-flashcard-grid`);
  const reviewGrid = document.getElementById(`${prefix}-review-grid`);
  const reviewBadge = document.getElementById(`${prefix}-review-badge`);
  const cardEl = document.getElementById(`${prefix}-card`);
  
  const renderGrid = (container, items, isReview) => {
    if(!container) return; container.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div'); card.className = 'flip-card';
      card.innerHTML = `<div class="flip-card-inner"><div class="flip-front"><strong>${item.verbindung}</strong></div><div class="flip-back flashcard-back-v2" style="padding:12px; gap:4px; justify-content:center;"><div class="fc-section fc-bedeutung" style="text-align:center;"><h3 class="arabic-text" style="font-size:1.2rem;">${item.bedeutung}</h3></div><div class="fc-section fc-synonyme" style="margin-bottom:5px;"><p style="font-size:0.85rem; text-align:center; color:#fff;">${item.synonyme || item.bedeutungDe || ''}</p></div><hr class="fc-divider" style="margin:4px 0;"><div class="fc-section fc-text-beispiel" style="margin:0;"><span class="fc-icon" style="font-size:0.9rem;">📖</span><p style="font-size:0.75rem; line-height:1.2; text-align:left;">${item.beispielText || item.beispiel || ''}</p></div>${!isReview ? '<button class="review-btn" type="button" style="margin-top:auto; min-height:30px;">🔁 Needs Review</button>' : '<button class="learned-btn" type="button" style="margin-top:auto; min-height:30px;">✅ Gelernt</button>'}</div></div>`;
      card.addEventListener('click', (e) => { if(e.target.closest('.review-btn') || e.target.closest('.learned-btn')) return; card.classList.toggle('flipped'); });
      if(!isReview) { card.querySelector('.review-btn').addEventListener('click', e => { e.stopPropagation(); schedule(item); }); } 
      else { card.querySelector('.learned-btn').addEventListener('click', e => { e.stopPropagation(); remove(item); }); }
      container.appendChild(card);
    });
  };

  const updateReview = () => {
    if(!reviewBadge) return;
    const queue = appState[prefix].reviewQueue.map(v => dataArray.find(d => d.verbindung === v)).filter(Boolean);
    reviewBadge.textContent = queue.length;
    if(queue.length === 0) { reviewGrid.innerHTML = '<p class="hint">Keine Karten zur Wiederholung. Super!</p>'; } else { renderGrid(reviewGrid, queue, true); }
  };

  const schedule = (item) => {
    if(!appState[prefix].reviewQueue.includes(item.verbindung)) {
      appState[prefix].reviewQueue.push(item.verbindung);
      const vIndex = dataArray.findIndex(d => d.verbindung === item.verbindung);
      const sIndex = appState[prefix].studyOrder.indexOf(vIndex);
      if(sIndex > -1) { appState[prefix].studyOrder.splice(sIndex, 1); if(appState[prefix].studyPos >= appState[prefix].studyOrder.length) appState[prefix].studyPos = 0; }
      updateReview(); saveGlobalState(); showToast('Hinzugefügt ✅');
    } else { showToast('Bereits in der Liste!'); }
  };
  const remove = (item) => { appState[prefix].reviewQueue = appState[prefix].reviewQueue.filter(v => v !== item.verbindung); updateReview(); saveGlobalState(); showToast('Entfernt 🎉'); };

  const renderStudy = () => {
    if(!cardEl) return;
    const order = appState[prefix].studyOrder; let pos = appState[prefix].studyPos;
    if(order.length === 0) { document.getElementById(`${prefix}-front-text`).textContent = 'Alle gelernt 🎉'; document.getElementById(`${prefix}-back-arabic`).textContent = ''; document.getElementById(`${prefix}-back-synonyme`).textContent = ''; document.getElementById(`${prefix}-back-textbeispiel`).textContent = ''; document.getElementById(`${prefix}-back-neuesbeispiel`).textContent = ''; document.getElementById(`${prefix}-progress-label`).textContent = '0 / 0'; document.getElementById(`${prefix}-progress-fill`).style.width = '100%'; return; }
    if(pos >= order.length) { pos = 0; appState[prefix].studyPos = 0; }
    const item = dataArray[order[pos]];
    cardEl.classList.remove('flipped');
    document.getElementById(`${prefix}-front-text`).textContent = item.verbindung;
    document.getElementById(`${prefix}-back-arabic`).textContent = item.bedeutung;
    document.getElementById(`${prefix}-back-synonyme`).textContent = item.synonyme || item.bedeutungDe || "";
    document.getElementById(`${prefix}-back-textbeispiel`).textContent = item.beispielText || item.beispiel || "";
    document.getElementById(`${prefix}-back-neuesbeispiel`).textContent = item.beispielNeu || "";
    document.getElementById(`${prefix}-progress-label`).textContent = `Karte ${pos + 1} / ${order.length}`;
    document.getElementById(`${prefix}-progress-fill`).style.width = `${((pos + 1) / order.length) * 100}%`;
  };
  window[`renderStudyCard_${prefix}`] = renderStudy;

  if(cardEl) {
    cardEl.addEventListener('click', () => cardEl.classList.toggle('flipped'));
    document.getElementById(`${prefix}-next`).addEventListener('click', () => { if(appState[prefix].studyOrder.length === 0) return; appState[prefix].studyPos = (appState[prefix].studyPos + 1) % appState[prefix].studyOrder.length; saveGlobalState(); renderStudy(); });
    document.getElementById(`${prefix}-prev`).addEventListener('click', () => { if(appState[prefix].studyOrder.length === 0) return; appState[prefix].studyPos = (appState[prefix].studyPos - 1 + appState[prefix].studyOrder.length) % appState[prefix].studyOrder.length; saveGlobalState(); renderStudy(); });
    document.getElementById(`${prefix}-shuffle`).addEventListener('click', () => { appState[prefix].studyOrder = shuffle(appState[prefix].studyOrder); appState[prefix].studyPos = 0; saveGlobalState(); renderStudy(); showToast('Gemischt 🔀'); });
    const studyRevBtn = document.getElementById(`${prefix}-study-review-btn`);
    if(studyRevBtn) { studyRevBtn.addEventListener('click', (e) => { e.stopPropagation(); if(appState[prefix].studyOrder.length === 0) return; schedule(dataArray[appState[prefix].studyOrder[appState[prefix].studyPos]]); document.getElementById(`${prefix}-next`).click(); }); }
    
    let stX = null, stY = null, swiping = false;
    cardEl.addEventListener('pointerdown', e => { stX = e.clientX; stY = e.clientY; swiping = true; });
    cardEl.addEventListener('pointerup', e => { if(!swiping || stX === null) return; const dx = e.clientX - stX, dy = e.clientY - stY; swiping = false; if(Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { if(dx < 0) document.getElementById(`${prefix}-next`).click(); else document.getElementById(`${prefix}-prev`).click(); } stX = stY = null; });
  }

  renderGrid(grid, dataArray, false); updateReview(); renderStudy();
}

function setupTooltips() {
  const tooltip = document.getElementById('custom-tooltip');
  document.addEventListener('click', (e) => {
    const word = e.target.closest('.vocab-word');
    const isTooltipClick = e.target.closest('#custom-tooltip');
    document.querySelectorAll('.vocab-word.active-link').forEach(el => { if(el !== word) el.classList.remove('active-link'); });
    if (word) {
      const groupId = word.dataset.group;
      if (groupId) { document.querySelectorAll(`.vocab-word[data-group="${groupId}"]`).forEach(el => el.classList.add('active-link')); } 
      else { word.classList.add('active-link'); }
      tooltip.innerHTML = word.dataset.meaning.replace(/\n/g, '<br>'); tooltip.classList.remove('hidden');
      const rect = word.getBoundingClientRect(); tooltip.style.left = `${rect.left + rect.width / 2}px`; tooltip.style.top = `${rect.top + window.scrollY - 10}px`;
    } else if (!isTooltipClick) { tooltip.classList.add('hidden'); }
  });
  window.addEventListener('scroll', () => { tooltip.classList.add('hidden'); });
}

/* ============================================================
   3. DATA: KRACH IN DER W.G
   ============================================================ */
const krachData = [
  { verbindung: "die WG", bedeutung: "سكن مشترك", synonyme: "die Wohngemeinschaft", beispielText: "Anne und Elias wohnen seit Kurzem zusammen in einer WG.", beispielNeu: "Während des Studiums ist es günstiger, in einer WG zu leben." },
  { verbindung: "sich verstehen", bedeutung: "يتفاهم / ينسجم", synonyme: "klarkommen, harmonieren", beispielText: "Sie verstehen sich eigentlich ganz gut...", beispielNeu: "Meine Schwester und ich verstehen uns blind." },
  { verbindung: "es kommt zum Streit", bedeutung: "ينشب شجار", synonyme: "sich streiten", beispielText: "...doch immer wieder kommt es zwischen den beiden zum Streit...", beispielNeu: "Wegen Kleinigkeiten kommt es oft zum Streit." },
  { verbindung: "was ... betrifft", bedeutung: "فيما يتعلق بـ", synonyme: "bezüglich, hinsichtlich", beispielText: "...was die Aufgabenverteilung im Haushalt betrifft.", beispielNeu: "Was das Wetter betrifft, haben wir heute wirklich Glück." },
  { verbindung: "die Aufgabenverteilung", bedeutung: "توزيع المهام", synonyme: "die Arbeitsteilung", beispielText: "...was die Aufgabenverteilung im Haushalt betrifft.", beispielNeu: "Eine gerechte Aufgabenverteilung ist wichtig." },
  { verbindung: "wegräumen", bedeutung: "يزيل / يرفع", synonyme: "aufräumen", beispielText: "Aber den ganzen Dreck räumst du dieses Mal alleine weg.", beispielNeu: "Kannst du bitte deine Schuhe wegräumen?" },
  { verbindung: "nicht einsehen", bedeutung: "لا يقتنع / لا يرى مبرراً", synonyme: "nicht akzeptieren", beispielText: "Ich sehe gar nicht ein, dass du hier ständig Party machst...", beispielNeu: "Er sieht nicht ein, dass er sich entschuldigen muss." },
  { verbindung: "runterkommen", bedeutung: "يهدأ", synonyme: "sich beruhigen", beispielText: "Jetzt komm mal wieder runter!", beispielNeu: "Du bist viel zu gestresst, du musst mal runterkommen." },
  { verbindung: "sich kümmern um", bedeutung: "يعتني بـ", synonyme: "sorgen für", beispielText: "Sonst hätte ich mich rechtzeitig darum gekümmert...", beispielNeu: "Ich kümmere mich morgen um die Tickets." },
  { verbindung: "rechtzeitig", bedeutung: "في الوقت المناسب", synonyme: "pünktlich", beispielText: "Sonst hätte ich mich rechtzeitig darum gekümmert...", beispielNeu: "Wir müssen rechtzeitig am Bahnhof sein." },
  { verbindung: "Chaos herrschen", bedeutung: "تسود الفوضى", synonyme: "unordentlich sein", beispielText: "Das ist ja nicht das erste Mal, dass hier so ein Chaos herrscht.", beispielNeu: "Nach der Party herrschte das pure Chaos." },
  { verbindung: "etwas satt haben", bedeutung: "يسأم بـ", synonyme: "die Nase voll haben", beispielText: "Ich habe das jetzt wirklich satt...", beispielNeu: "Ich habe dieses kalte Wetter langsam satt." },
  { verbindung: "unbedingt", bedeutung: "ضروري / حتماً", synonyme: "absolut", beispielText: "...wir müssen unbedingt mal reden.", beispielNeu: "Ich muss dir unbedingt etwas Wichtiges erzählen." },
  { verbindung: "Das ist nicht dein Ernst!", bedeutung: "هل تمزح!", synonyme: "Machst du Witze?", beispielText: "Das ist jetzt echt nicht dein Ernst:", beispielNeu: "Du hast den Zug verpasst? Das ist nicht dein Ernst!" },
  { verbindung: "zu weit gehen", bedeutung: "يتمادى", synonyme: "den Bogen überspannen", beispielText: "Jetzt bist du echt zu weit gegangen.", beispielNeu: "Mit dieser Bemerkung bist du eindeutig zu weit gegangen." },
  { verbindung: "die Privatsphäre", bedeutung: "الخصوصية", synonyme: "der persönliche Raum", beispielText: "Mein Bett, das ist meine absolute Privatsphäre...", beispielNeu: "Man sollte die Privatsphäre anderer Menschen respektieren." },
  { verbindung: "nichts zu suchen haben", bedeutung: "لا شأن له هنا", synonyme: "unerwünscht sein", beispielText: "Da hat niemand was drin zu suchen...", beispielNeu: "Du hast in meinem Zimmer nichts zu suchen!" },
  { verbindung: "ein für alle Mal", bedeutung: "مرة واحدة وإلى الأبد", synonyme: "endgültig", beispielText: "Ich möchte, dass wir jetzt ein für alle Mal ein paar Dinge klären.", beispielNeu: "Wir müssen dieses Problem ein für alle Mal lösen." },
  { verbindung: "klären", bedeutung: "يوضح / يسوي", synonyme: "lösen, besprechen", beispielText: "...ein für alle Mal ein paar Dinge klären.", beispielNeu: "Wir sollten das Missverständnis schnell klären." },
  { verbindung: "ein Drama machen", bedeutung: "يهول الأمر", synonyme: "übertreiben", beispielText: "Aber bitte mach nicht so ein Drama daraus.", beispielNeu: "Es war nur ein kleiner Fehler, mach kein Drama daraus!" },
  { verbindung: "tabu sein", bedeutung: "محظور", synonyme: "verboten", beispielText: "Mein Zimmer bleibt tabu.", beispielNeu: "Das Thema Gehalt ist in dieser Firma tabu." },
  { verbindung: "jemanden erwischen bei", bedeutung: "يضبط متلبساً", synonyme: "ertappen", beispielText: "Wenn ich dich noch einmal dabei erwische...", beispielNeu: "Der Lehrer hat ihn beim Schummeln erwischt." },
  { verbindung: "ausziehen", bedeutung: "يرحل عن المنزل", synonyme: "die Wohnung verlassen", beispielText: "...dann ziehe ich aus.", beispielNeu: "Sie wird nächsten Monat aus der Wohnung ausziehen." },
  { verbindung: "nachvollziehen", bedeutung: "يستوعب", synonyme: "verstehen", beispielText: "Ich verstehe überhaupt nicht, warum du das nicht nachvollziehen kannst.", beispielNeu: "Ich kann deine Entscheidung gut nachvollziehen." },
  { verbindung: "übertreiben", bedeutung: "يبالغ", synonyme: "aufbauschen", beispielText: "Ich finde, du übertreibst da wirklich...", beispielNeu: "Er übertreibt immer, wenn er von seinen Krankheiten erzählt." },
  { verbindung: "sich halten an", bedeutung: "يلتزم بـ", synonyme: "befolgen", beispielText: "...dann halte ich mich in Zukunft daran.", beispielNeu: "Alle Mitarbeiter müssen sich an die Regeln halten." },
  { verbindung: "gnädig", bedeutung: "رؤوف", synonyme: "barmherzig", beispielText: "Das ist aber äußerst gnädig von dir...", beispielNeu: "Der Richter war sehr gnädig." },
  { verbindung: "sich zurückhalten", bedeutung: "يتراجع / يحجم عن", synonyme: "passiv bleiben", beispielText: "...da hältst du dich immer schön zurück.", beispielNeu: "Bei der Diskussion halte ich mich lieber zurück." },
  { verbindung: "in Gesellschaft", bedeutung: "في صُحبة", synonyme: "gemeinsam", beispielText: "Du sagst doch immer, dass du gern in Gesellschaft isst...", beispielNeu: "Ich fühle mich in Gesellschaft meiner Freunde wohl." },
  { verbindung: "einen Vorwurf machen", bedeutung: "يلوم", synonyme: "beschuldigen", beispielText: "Und jetzt machst du mir daraus einen Vorwurf!", beispielNeu: "Du kannst ihr keinen Vorwurf machen." },
  { verbindung: "unfair", bedeutung: "غير عادل", synonyme: "ungerecht", beispielText: "Das ist so was von unfair!", beispielNeu: "Es ist unfair, dass er mehr Geld bekommt." },
  { verbindung: "selbstverständlich", bedeutung: "بديهي", synonyme: "logisch, klar", beispielText: "...aber findest du es nicht selbstverständlich, dass du...", beispielNeu: "Es ist für mich selbstverständlich, dass ich helfe." },
  { verbindung: "beitragen zu", bedeutung: "يساهم في", synonyme: "mitwirken", beispielText: "...dass du auch in irgendeiner Form etwas zu unserem WG-Leben beiträgst?", beispielNeu: "Jeder kann etwas zum Umweltschutz beitragen." },
  { verbindung: "sorgen für", bedeutung: "يتكفل بـ", synonyme: "gewährleisten", beispielText: "Ich sorge für unsere – und deine – sozialen Kontakte.", beispielNeu: "Der Gastgeber sorgte für Getränke." },
  { verbindung: "sich vergraben", bedeutung: "يعزل نفسه", synonyme: "sich isolieren", beispielText: "...würdest du dich doch nur noch in deinem Zimmer vergraben...", beispielNeu: "Nach der Trennung hat sie sich vergraben." },
  { verbindung: "im Augenblick", bedeutung: "في هذه اللحظة", synonyme: "momentan", beispielText: "Das wäre mir im Augenblick auch lieber.", beispielNeu: "Im Augenblick habe ich leider viel Stress." },
  { verbindung: "sich einigen auf", bedeutung: "يتفق على", synonyme: "einen Konsens finden", beispielText: "Wir können uns ja zumindest auf einen Kompromiss einigen:", beispielNeu: "Wir konnten uns auf einen Preis einigen." },
  { verbindung: "der Kompromiss", bedeutung: "حل وسط", synonyme: "die Einigung", beispielText: "Wir können uns ja zumindest auf einen Kompromiss einigen:", beispielNeu: "Bei einer Verhandlung muss man oft Kompromisse schließen." },
  { verbindung: "etwas erlassen", bedeutung: "يعفي شخصاً من", synonyme: "befreien von", beispielText: "Dafür erlasse ich dir auch das Kochen.", beispielNeu: "Aus Kulanz hat der Vermieter uns die letzte Miete erlassen." },
  { verbindung: "Verantwortung übernehmen", bedeutung: "يتحمل المسؤولية", synonyme: "zuständig sein", beispielText: "Irgendeine feste Aufgabe musst du jetzt übernehmen.", beispielNeu: "Der Projektleiter übernimmt die Verantwortung." }
];
const krachTextRaw = `<div class="dialogue-intro"><p>Anne und Elias wohnen seit Kurzem zusammen in einer <span class="vocab-word" data-meaning="سكن مشترك">WG</span>. Sie <span class="vocab-word" data-meaning="يتفاهم / ينسجم">verstehen sich</span> eigentlich ganz gut, doch immer wieder <span class="vocab-word" data-meaning="ينشب شجار" data-group="streit">kommt es</span> zwischen den beiden <span class="vocab-word" data-meaning="ينشب شجار" data-group="streit">zum Streit</span>, <span class="vocab-word" data-meaning="فيما يتعلق بـ" data-group="betrifft">was</span> die <span class="vocab-word" data-meaning="توزيع المهام">Aufgabenverteilung</span> im Haushalt <span class="vocab-word" data-meaning="فيما يتعلق بـ" data-group="betrifft">betrifft</span>.</p></div><div class="dialogue"><div class="msg"><span class="speaker elias">Elias</span> <span class="text">Wie sieht’s denn hier aus? Anne, wo bist du, verdammt noch mal!</span></div><div class="msg"><span class="speaker anne">Anne</span> <span class="text">Hey, Elias! Ich dachte, du kommst erst morgen zurück. Sorry, wir haben hier ein bisschen gefeiert.</span></div><div class="msg"><span class="speaker elias">Elias</span> <span class="text">Ja, das sehe ich. Aber den ganzen Dreck <span class="vocab-word" data-meaning="يزيل / يرفع (الأشياء)" data-group="wegraeumen">räumst</span> du dieses Mal alleine <span class="vocab-word" data-meaning="يزيل / يرفع (الأشياء)" data-group="wegraeumen">weg</span>. Ich <span class="vocab-word" data-meaning="لا يقتنع / لا يرى مبرراً">sehe gar nicht ein</span>, dass du hier ständig Party machst – und aufräumen muss ich dann!</span></div><div class="msg"><span class="speaker anne">Anne</span> <span class="text">Jetzt <span class="vocab-word" data-meaning="يهدأ (لغة دارجة)" data-group="runterkommen">komm</span> mal wieder <span class="vocab-word" data-meaning="يهدأ (لغة دارجة)" data-group="runterkommen">runter</span>! Ich wusste ja nicht, dass du heute schon zurückkommst. Sonst hätte ich mich <span class="vocab-word" data-meaning="في الوقت المناسب">rechtzeitig</span> darum <span class="vocab-word" data-meaning="يعتني بـ / يهتم بـ">gekümmert</span> ...</span></div><div class="msg"><span class="speaker elias">Elias</span> <span class="text">Das glaubst du ja selbst nicht. Das ist ja nicht das erste Mal, dass hier so ein <span class="vocab-word" data-meaning="تسود الفوضى">Chaos herrscht</span>. Ich habe das jetzt wirklich <span class="vocab-word" data-meaning="يسأم / يضيق ذرعاً بـ">satt</span> – wir müssen <span class="vocab-word" data-meaning="ضروري / حتماً">unbedingt</span> mal reden. <br><span class="vocab-word" data-meaning="هل تمزح! / لا يمكن أن تكون جاداً!">Das ist jetzt echt nicht dein Ernst</span>: Hat etwa jemand von deinen Typen in meinem Bett geschlafen?</span></div><div class="msg"><span class="speaker anne">Anne</span> <span class="text">Entschuldige, ich hätte dich vorher fragen sollen ...</span></div><div class="msg"><span class="speaker elias">Elias</span> <span class="text">Jetzt bist du echt <span class="vocab-word" data-meaning="يتمادى / يتجاوز الحدود">zu weit gegangen</span>. Mein Bett, das ist meine absolute <span class="vocab-word" data-meaning="الخصوصية">Privatsphäre</span> – und das weißt du auch! Da hat niemand was drin <span class="vocab-word" data-meaning="لا شأن له هنا / ليس مكانه">zu suchen</span>, und schon gar nicht ein Fremder.</span></div><div class="msg"><span class="speaker anne">Anne</span> <span class="text">Aber das ist doch kein Fremder gewesen, das war doch Jonas, du weißt schon, der ...</span></div><div class="msg"><span class="speaker elias">Elias</span> <span class="text">Hey, das interessiert mich überhaupt nicht, wer das war. Ich möchte, dass wir jetzt <span class="vocab-word" data-meaning="مرة واحدة وإلى الأبد">ein für alle Mal</span> ein paar Dinge <span class="vocab-word" data-meaning="يوضح / يسوي (خلافاً)">klären</span>.</span></div><div class="msg"><span class="speaker anne">Anne</span> <span class="text">Ist ja schon gut ... Aber bitte mach nicht so ein <span class="vocab-word" data-meaning="يهول الأمر / يخلق دراما">Drama daraus</span>.</span></div><div class="msg"><span class="speaker elias">Elias</span> <span class="text">Also erstens: Mein Zimmer bleibt <span class="vocab-word" data-meaning="محظور / ممنوع المساس به">tabu</span>. Für dich und für alle anderen. Wenn ich dich noch einmal dabei <span class="vocab-word" data-meaning="يضبط شخصاً متلبساً">erwische</span>, dass du jemandem erlaubst, in meinem Bett zu übernachten, dann <span class="vocab-word" data-meaning="يرحل عن المنزل / ينتقل" data-group="ausziehen">ziehe</span> ich <span class="vocab-word" data-meaning="يرحل عن المنزل / ينتقل" data-group="ausziehen">aus</span>. Das ist echt so was von eklig! Ich verstehe überhaupt nicht, warum du das nicht <span class="vocab-word" data-meaning="يستوعب / يتفهم">nachvollziehen</span> kannst.</span></div><div class="msg"><span class="speaker anne">Anne</span> <span class="text">Du kannst doch einfach die Bettwäsche wechseln und fertig! Ich kapier' echt nicht, wo da das Problem ist. Ich finde, du <span class="vocab-word" data-meaning="يبالغ">übertreibst</span> da wirklich mit deiner Hygienemanie. Aber, na bitte, wenn es für dich so wichtig ist, dann <span class="vocab-word" data-meaning="يلتزم بـ" data-group="halten_an">halte</span> ich mich in Zukunft <span class="vocab-word" data-meaning="يلتزم بـ" data-group="halten_an">daran</span>.</span></div><div class="msg"><span class="speaker elias">Elias</span> <span class="text">Das ist aber äußerst <span class="vocab-word" data-meaning="رؤوف / متكرم">gnädig</span> von dir ... Zweitens: Wann hast du eigentlich zum letzten Mal eingekauft? Beim Essen bist du gleich dabei, aber wenn es ums Einkaufen und Kochen geht, da <span class="vocab-word" data-meaning="يتراجع / يحجم عن" data-group="zurueckhalten">hältst</span> du dich immer schön <span class="vocab-word" data-meaning="يتراجع / يحجم عن" data-group="zurueckhalten">zurück</span>.</span></div><div class="msg"><span class="speaker anne">Anne</span> <span class="text">Das ist aber jetzt echt gemein von dir! Du sagst doch immer, dass du gern <span class="vocab-word" data-meaning="في صُحبة / مع الآخرين">in Gesellschaft</span> isst und gern für andere kochst. Und jetzt machst du mir daraus einen <span class="vocab-word" data-meaning="يلوم / يوجه عتاباً">Vorwurf</span>! Das ist so was von <span class="vocab-word" data-meaning="غير عادل / غير منصف">unfair</span>!</span></div><div class="msg"><span class="speaker elias">Elias</span> <span class="text">Ich koche auch gern für dich, aber findest du es nicht <span class="vocab-word" data-meaning="بديهي / غني عن البيان">selbstverständlich</span>, dass du auch in irgendeiner Form etwas zu unserem WG-Leben <span class="vocab-word" data-meaning="يساهم في">beiträgst</span>?</span></div><div class="msg"><span class="speaker anne">Anne</span> <span class="text">Das tue ich doch. Ich <span class="vocab-word" data-meaning="يتكفل بـ / يعتني بـ">sorge für</span> unsere – und deine – sozialen Kontakte. Wenn du mich nicht hättest, würdest du dich doch nur noch in deinem Zimmer <span class="vocab-word" data-meaning="يعزل نفسه / يدفن نفسه">vergraben</span> und lernen.</span></div><div class="msg"><span class="speaker elias">Elias</span> <span class="text">Das wäre mir <span class="vocab-word" data-meaning="في هذه اللحظة / حالياً">im Augenblick</span> auch lieber. Wir können uns ja zumindest auf einen <span class="vocab-word" data-meaning="حل وسط / تسوية">Kompromiss</span> <span class="vocab-word" data-meaning="يتفق على">einigen</span>: Du bringst ein paar Leute weniger mit nach Hause und nutzt die gewonnene Zeit dafür, ab und zu mal das Bad zu putzen. Dafür <span class="vocab-word" data-meaning="يعفي شخصاً من شيء">erlasse</span> ich dir auch das Kochen.</span></div><div class="msg"><span class="speaker anne">Anne</span> <span class="text">Und das Abwaschen auch?</span></div><div class="msg"><span class="speaker elias">Elias</span> <span class="text">Wir sind doch hier nicht auf dem Basar! Irgendeine feste Aufgabe im Haushalt musst du jetzt schon mal <span class="vocab-word" data-meaning="يتحمل المسؤولية">übernehmen</span>. Irgendetwas, wofür nur du verantwortlich bist. Such dir was aus ...</span></div><div class="msg"><span class="speaker anne">Anne</span> <span class="text">Okay. Dann übernehme ich das Einkaufen und das Geschirrabwaschen. Und das Bad putzt jeder abwechselnd. Aber jetzt sei mir bitte nicht mehr böse. Ich freu mich so, dass du wieder zurück bist. Ich habe dir so viel zu erzählen, von der Party gestern: Da war so ein toller Typ, du weißt schon, der Bruder von Hannes ...</span></div></div>`;

/* ============================================================
   4. DATA: NEUE HEIMAT
   ============================================================ */
const neueHeimatData = [
  { verbindung: "ein Visum beantragen", bedeutung: "التقدم بطلب للحصول على تأشيرة", synonyme: "ein offizielles Dokument anfordern", beispielText: "Ich musste mich um ein Visum kümmern...", beispielNeu: "Bevor ich reise, muss ich ein Visum beantragen." },
  { verbindung: "Wohnung auflösen", bedeutung: "تصفية أو إخلاء الشقة", synonyme: "Wohnung leeren und Mietvertrag beenden", beispielText: "...meine Wohnung auflösen usw.", beispielNeu: "Weil er ins Ausland geht, muss er seine Wohnung auflösen." },
  { verbindung: "Kontakte knüpfen", bedeutung: "تكوين علاقات", synonyme: "neue Leute kennenlernen", beispielText: "...ich habe schnell viele neue Freunde gefunden.", beispielNeu: "Auf der Konferenz konnte ich Kontakte knüpfen." },
  { verbindung: "sich verabschieden", bedeutung: "توديع شخص", synonyme: "Auf Wiedersehen sagen", beispielText: "Auch der Abschied von Freunden war traurig.", beispielNeu: "Am Flughafen fiel es mir schwer, mich zu verabschieden." },
  { verbindung: "einen Job kündigen", bedeutung: "الاستقالة من العمل", synonyme: "ein Arbeitsverhältnis beenden", beispielText: "...den Job kündigen...", beispielNeu: "Er hat seinen Job gekündigt, um sich selbstständig zu machen." },
  { verbindung: "ein Konto eröffnen", bedeutung: "فتح حساب بنكي", synonyme: "ein Bankkonto einrichten", beispielText: "Man muss viele Dinge im neuen Land erledigen.", beispielNeu: "Um mein Gehalt zu bekommen, muss ich ein Konto eröffnen." },
  { verbindung: "sein Leben aufgeben", bedeutung: "التخلي عن الحياة المعتادة", synonyme: "den normalen Alltag hinter sich lassen", beispielText: "Mein gewohntes Leben aufgeben...", beispielNeu: "Es erfordert viel Mut, sein gewohntes Leben aufzugeben." },
  { verbindung: "neu anfangen", bedeutung: "البدء من جديد", synonyme: "einen neuen Lebensabschnitt beginnen", beispielText: "...und in einem anderen Land komplett neu anfangen?", beispielNeu: "Nach der Trennung hat sie komplett neu angefangen." },
  { verbindung: "etwas wagen", bedeutung: "يجرؤ / يخاطر", synonyme: "den Mut haben, etwas Riskantes zu tun", beispielText: "Ich habe es gewagt!", beispielNeu: "Wer erfolgreich sein will, muss etwas wagen." },
  { verbindung: "auswandern", bedeutung: "يهاجر", synonyme: "Heimatland verlassen", beispielText: "Ich bin spontan nach Australien ausgewandert.", beispielNeu: "Viele junge Menschen wandern nach Kanada aus." },
  { verbindung: "zufällig kennenlernen", bedeutung: "التعرف بالصدفة", synonyme: "eine Person ohne Absicht treffen", beispielText: "...als ich zufällig diesen netten Typen kennengelernt hatte...", beispielNeu: "Ich habe meinen Chef zufällig im Zug kennengelernt." },
  { verbindung: "sich verlieben", bedeutung: "يقع في حب", synonyme: "romantische Gefühle haben", beispielText: "...und mich in David verliebt hatte...", beispielNeu: "Sie hat sich während ihres Urlaubs verliebt." },
  { verbindung: "Leben komplett ändern", bedeutung: "تغيير حياته بالكامل", synonyme: "das Leben völlig anders gestalten", beispielText: "...beschloss ich, mein Leben komplett zu ändern...", beispielNeu: "Nach seiner Krankheit hat er sein Leben geändert." },
  { verbindung: "sich kümmern um", bedeutung: "يعتني بـ / ينجز", synonyme: "Verantwortung übernehmen", beispielText: "Ich musste mich um ein Visum kümmern...", beispielNeu: "Du musst dich um deine Dokumente kümmern." },
  { verbindung: "zufrieden sein", bedeutung: "يكون راضياً عن", synonyme: "glücklich sein", beispielText: "In meinem Job war ich eigentlich zufrieden...", beispielNeu: "Ich bin mit meinen Prüfungsergebnissen zufrieden." },
  { verbindung: "es fällt schwer", bedeutung: "يصعب على", synonyme: "Probleme damit haben", beispielText: "...und es fiel mir nicht leicht zu kündigen.", beispielNeu: "Es fällt ihm schwer, Deutsch zu lernen." },
  { verbindung: "sich freuen auf", bedeutung: "يتطلع إلى / يسعد بـ", synonyme: "Freude empfinden auf ein Ereignis", beispielText: "...habe ich mich aber auf mein neues Leben gefreut.", beispielNeu: "Ich freue mich riesig auf meinen nächsten Urlaub." },
  { verbindung: "Arbeitserlaubnis bekommen", bedeutung: "الحصول على تصريح عمل", synonyme: "Genehmigung erhalten", beispielText: "...eine Arbeitserlaubnis zu bekommen, war schwieriger...", beispielNeu: "Ohne Arbeitserlaubnis darfst du nicht arbeiten." },
  { verbindung: "Heimweh haben", bedeutung: "الحنين إلى الوطن", synonyme: "Traurigkeit, weit weg zu sein", beispielText: "Ich hatte ziemlich großes Heimweh.", beispielNeu: "In den USA hatte ich oft Heimweh." },
  { verbindung: "Zeugnisse übersetzen", bedeutung: "ترجمة الشهادات", synonyme: "Dokumente übertragen lassen", beispielText: "...meine Zeugnisse übersetzen lassen...", beispielNeu: "Um studieren zu können, muss ich Zeugnisse übersetzen lassen." },
  { verbindung: "sich streiten", bedeutung: "يتجادل / يتشاجر", synonyme: "einen Konflikt austragen", beispielText: "Wir haben uns einfach zu oft gestritten.", beispielNeu: "Meine Nachbarn streiten sich fast jeden Tag." },
  { verbindung: "nicht aufgeben", bedeutung: "لا يستسلم", synonyme: "weiterkämpfen", beispielText: "Aber ich habe nicht aufgegeben...", beispielNeu: "Auch wenn du Fehler machst, darfst du nicht aufgeben." },
  { verbindung: "Entscheidung bereuen", bedeutung: "يندم على قرار", synonyme: "denken, dass eine Entscheidung falsch war", beispielText: "Meine Entscheidung habe ich nie bereut.", beispielNeu: "Ich habe meine Entscheidung nie bereut." },
  { verbindung: "die Erfahrung machen", bedeutung: "يمر بتجربة", synonyme: "durch eigenes Erleben feststellen", beispielText: "Ich habe die Erfahrung gemacht, dass man Zeit braucht...", beispielNeu: "Ich habe die Erfahrung gemacht, dass man mit Ehrlichkeit weit kommt." },
  { verbindung: "sich einleben", bedeutung: "يتأقلم", synonyme: "sich an einen Ort gewöhnen", beispielText: "...um sich in einem fremden Land einzuleben.", beispielNeu: "Es dauert Monate, bis man sich eingelebt hat." },
  { verbindung: "Horizont erweitern", bedeutung: "يوسع آفاقه", synonyme: "Blickwinkel vergrößern", beispielText: "So eine Auslandserfahrung erweitert einfach den Horizont.", beispielNeu: "Ein Auslandssemester erweitert den Horizont." },
  { verbindung: "über sich erfahren", bedeutung: "يكتشف الكثير عن نفسه", synonyme: "eigene Persönlichkeit kennenlernen", beispielText: "...und erfährt dadurch auch viel über sich selbst.", beispielNeu: "In schwierigen Situationen kann man viel über sich selbst erfahren." },
  { verbindung: "gestresst sein", bedeutung: "يكون مرهقاً / تحت ضغط", synonyme: "unter Anspannung stehen", beispielText: "Die Leute sind nicht immer so gestresst...", beispielNeu: "Vor Prüfungen sind Studenten sehr gestresst." },
  { verbindung: "sehnsüchtig warten", bedeutung: "ينتظر بشوق", synonyme: "mit Vorfreude warten", beispielText: "Und ich warte seit Monaten sehnsüchtig auf den Besuch...", beispielNeu: "Die Kinder warten sehnsüchtig auf die Ferien." },
  { verbindung: "sich genau ausdrücken", bedeutung: "يعبر عن نفسه بدقة", synonyme: "präzise formulieren", beispielText: "...kann ich trotzdem nicht immer ganz genau das ausdrücken...", beispielNeu: "In einer Fremdsprache ist es schwer, sich genau auszudrücken." }
];
const neueHeimatTextRaw = `<div class="lesetext-title">Mein Glück in der neuen Heimat</div><p style="font-size:0.9rem; color:#888; font-style:italic;">geschrieben am 17. Dezember von Ella Australia</p><p>Soll ich das wirklich riskieren? <span class="vocab-word" data-meaning="التخلي عن الحياة المعتادة">Mein gewohntes Leben aufgeben</span>, <span class="vocab-word" data-meaning="الاستقالة من العمل">den Job kündigen</span>, Familie und Freunde verlassen und in einem anderen Land <span class="vocab-word" data-meaning="البدء من جديد تماماً">komplett neu anfangen</span>? Ich habe es <span class="vocab-word" data-meaning="يجرؤ على شيء / يخاطر">gewagt</span>! Ich bin letztes Jahr aus Liebe ziemlich spontan nach Australien <span class="vocab-word" data-meaning="يهاجر">ausgewandert</span>.</p><p>Eigentlich bin ich gar kein so besonders abenteuerlicher Typ. Aber als ich vor zwei Jahren <span class="vocab-word" data-meaning="التعرف بالصدفة" data-group="kennenzufaellig">zufällig</span> diesen netten Typen während meines Urlaubs <span class="vocab-word" data-meaning="التعرف بالصدفة" data-group="kennenzufaellig">kennengelernt hatte</span> und <span class="vocab-word" data-meaning="يقع في حب (شخص ما)">mich</span> nicht nur in Australien, sondern auch in David <span class="vocab-word" data-meaning="يقع في حب (شخص ما)">verliebt hatte</span>, beschloss ich, <span class="vocab-word" data-meaning="تغيير حياته بالكامل">mein Leben komplett zu ändern</span> und <span class="vocab-word" data-meaning="يهاجر">auszuwandern</span>. Das war ganz schön aufregend. Ich musste so viel erledigen! Ich musste <span class="vocab-word" data-meaning="يعتني بـ / يهتم بـ / ينجز أمراً">mich um</span> ein Visum <span class="vocab-word" data-meaning="يعتني بـ / يهتم بـ / ينجز أمراً">kümmern</span>, meine <span class="vocab-word" data-meaning="ترجمة الشهادات">Zeugnisse übersetzen lassen</span>, <span class="vocab-word" data-meaning="تصفية أو إخلاء الشقة">meine Wohnung auflösen</span> usw. In meinem Job war ich eigentlich <span class="vocab-word" data-meaning="يكون راضياً عن">zufrieden</span> und <span class="vocab-word" data-meaning="يصعب على شخص ما">es fiel mir nicht leicht</span> zu kündigen. Auch der Abschied von Freunden und Familie war natürlich traurig. Als ich dann sechs Monate nach dem Urlaub wieder aufgeregt im Flugzeug saß, habe ich mich aber auf mein neues Leben <span class="vocab-word" data-meaning="يتطلع إلى / يسعد بـ">gefreut</span>.</p><p>Der Anfang in einem neuen Land ist allerdings ganz schön schwierig. Ich kannte niemanden außer David, musste mir eine Arbeit suchen und <span class="vocab-word" data-meaning="الحصول على تصريح عمل">eine Arbeitserlaubnis zu bekommen</span>, war schwieriger, als ich gedacht hatte. Ich hatte ziemlich großes <span class="vocab-word" data-meaning="الشعور بالحنين إلى الوطن">Heimweh</span>. Leider war die Beziehung mit David auch ziemlich schnell wieder zu Ende. Wir haben <span class="vocab-word" data-meaning="يتجادل / يتشاجر">uns</span> einfach zu oft <span class="vocab-word" data-meaning="يتجادل / يتشاجر">gestritten</span>. Aber ich habe <span class="vocab-word" data-meaning="لا (يستسلم)">nicht aufgegeben</span> und zum Glück irgendwann eine Stelle als Grafikerin in einer großen Agentur gefunden und bei der Wohnungssuche hat mir netterweise ein Bekannter geholfen.</p><p><span class="vocab-word" data-meaning="يندم على قرار">Meine Entscheidung habe ich nie bereut</span>. Ich habe <span class="vocab-word" data-meaning="يمر بتجربة أن...">die Erfahrung gemacht, dass</span> man einfach Zeit braucht, um <span class="vocab-word" data-meaning="يتأقلم / يندمج في مكان جديد">sich</span> in einem fremden Land <span class="vocab-word" data-meaning="يتأقلم / يندمج في مكان جديد">einzuleben</span>. Es ist aber ein tolles Gefühl, es zu schaffen. So eine Auslandserfahrung <span class="vocab-word" data-meaning="يوسع آفاقه">erweitert einfach den Horizont</span>. Man lernt die Kultur eines anderen Landes kennen und <span class="vocab-word" data-meaning="يكتشف الكثير عن نفسه">erfährt dadurch auch viel über sich selbst</span> und die eigene Kultur.</p><p>Am Anfang hatte ich trotz vieler Jahre Englischunterricht in der Schule Probleme mit der Sprache, aber mittlerweile ist mein Englisch richtig gut. Außerdem ist das Leben hier wirklich angenehm. Das Wetter, das Meer und die Landschaft sind einfach super. Überraschend war für mich, dass das Leben hier lockerer als in Deutschland ist. Die Leute sind nicht immer so <span class="vocab-word" data-meaning="يكون مرهقاً / تحت ضغط كبير">gestresst</span> und ich habe schnell viele neue Freunde gefunden. In Deutschland dauert das ja oft ein bisschen länger ... Natürlich skype ich auch jetzt noch oft stundenlang mit alten Freunden in Deutschland. Aber es ist besser als am Anfang. Da konnte ich oft an nichts anderes denken und habe täglich mehrere SMS und E-Mails nach Deutschland geschickt, jetzt schreibe ich meinen Eltern einmal pro Woche eine längere E-Mail. Es ist nicht immer einfach, so weit weg zu sein. Und ich warte seit Monaten <span class="vocab-word" data-meaning="ينتظر بشوق / بلهفة">sehnsüchtig auf</span> den Besuch meiner besten Freundin. Auch wenn ich wirklich gut Englisch spreche, kann ich trotzdem nicht immer ganz <span class="vocab-word" data-meaning="يعبر عن نفسه بدقة">genau das ausdrücken</span>, was ich denke oder fühle. Da tut es einfach gut, zwischendurch mal in der eigenen Sprache zu sprechen. 🙂</p>`;

const tekamoloData = [
  { parts: ["Er hat", "seine Wohnung aufgelöst.", "in Berlin", "schnell", "gestern", "wegen des Umzugs"], correct: ["Er hat", "gestern", "wegen des Umzugs", "schnell", "in Berlin", "seine Wohnung aufgelöst."] },
  { parts: ["Sie will", "mutig", "nächstes Jahr", "aus beruflichen Gründen", "auswandern.", "nach Kanada"], correct: ["Sie will", "nächstes Jahr", "aus beruflichen Gründen", "mutig", "nach Kanada", "auswandern."] },
  { parts: ["Wir haben uns", "heute Morgen", "gestritten.", "lautstark", "im Flur", "wegen des Lärms"], correct: ["Wir haben uns", "heute Morgen", "wegen des Lärms", "lautstark", "im Flur", "gestritten."] },
  { parts: ["Ich muss", "unbedingt", "für die Arbeit", "ein Konto eröffnen.", "bei der Bank", "nächste Woche"], correct: ["Ich muss", "nächste Woche", "für die Arbeit", "unbedingt", "bei der Bank", "ein Konto eröffnen."] },
  { parts: ["Er hat", "vor einem Monat", "seinen Job gekündigt.", "sofort", "in der Firma", "wegen des Stresses"], correct: ["Er hat", "vor einem Monat", "wegen des Stresses", "sofort", "in der Firma", "seinen Job gekündigt."] },
  { parts: ["Sie hat", "am Wochenende", "spontan", "aus Zufall", "einen Mann kennengelernt.", "im Park"], correct: ["Sie hat", "am Wochenende", "aus Zufall", "spontan", "im Park", "einen Mann kennengelernt."] },
  { parts: ["Wir müssen", "im Konsulat", "heute", "dringend", "für das Studium", "ein Visum beantragen."], correct: ["Wir müssen", "heute", "für das Studium", "dringend", "im Konsulat", "ein Visum beantragen."] },
  { parts: ["Er hat", "letztes Jahr", "komplett neu angefangen.", "in Australien", "völlig spontan", "aus Liebe"], correct: ["Er hat", "letztes Jahr", "aus Liebe", "völlig spontan", "in Australien", "komplett neu angefangen."] },
  { parts: ["Sie hat", "aus Einsamkeit", "gestern Abend", "Heimweh gehabt.", "sehr stark", "im Hotelzimmer"], correct: ["Sie hat", "gestern Abend", "aus Einsamkeit", "sehr stark", "im Hotelzimmer", "Heimweh gehabt."] },
  { parts: ["Ich muss", "morgen", "beim Amt", "offiziell", "für die Uni", "Zeugnisse übersetzen lassen."], correct: ["Ich muss", "morgen", "für die Uni", "offiziell", "beim Amt", "Zeugnisse übersetzen lassen."] },
  { parts: ["Er hat sich", "im Urlaub", "am Strand", "in sie verliebt.", "schnell", "aus heiterem Himmel"], correct: ["Er hat sich", "im Urlaub", "aus heiterem Himmel", "schnell", "am Strand", "in sie verliebt."] },
  { parts: ["Sie hat sich", "wegen der Dokumente", "vorhin", "intensiv", "um alles gekümmert.", "am Schreibtisch"], correct: ["Sie hat sich", "vorhin", "wegen der Dokumente", "intensiv", "am Schreibtisch", "um alles gekümmert."] },
  { parts: ["Wir haben", "aus Interesse", "in der Pause", "letztes Wochenende", "sehr leicht", "Kontakte geknüpft."], correct: ["Wir haben", "letztes Wochenende", "aus Interesse", "sehr leicht", "in der Pause", "Kontakte geknüpft."] },
  { parts: ["Ich habe", "heute", "die Arbeitserlaubnis bekommen.", "wegen der Zusage", "im Amt", "glücklich"], correct: ["Ich habe", "heute", "wegen der Zusage", "glücklich", "im Amt", "die Arbeitserlaubnis bekommen."] },
  { parts: ["Er hat", "komplett", "sein Leben geändert.", "wegen der Krankheit", "im letzten Monat", "in der Heimat"], correct: ["Er hat", "im letzten Monat", "wegen der Krankheit", "komplett", "in der Heimat", "sein Leben geändert."] },
  { parts: ["Sie hat", "etwas Neues gewagt.", "aus Neugier", "mutig", "gestern", "im Büro"], correct: ["Sie hat", "gestern", "aus Neugier", "mutig", "im Büro", "etwas Neues gewagt."] },
  { parts: ["Ich bin", "sehr glücklich", "in der Uni", "wegen der Noten", "zufrieden gewesen.", "heute"], correct: ["Ich bin", "heute", "wegen der Noten", "sehr glücklich", "in der Uni", "zufrieden gewesen."] },
  { parts: ["Es fällt mir", "wegen der Sprache", "in Deutschland", "ziemlich schwer", "momentan", "zu studieren."], correct: ["Es fällt mir", "momentan", "wegen der Sprache", "ziemlich schwer", "in Deutschland", "zu studieren."] },
  { parts: ["Wir haben uns", "aus Wut", "ziemlich heftig", "gestern", "gestritten.", "im Wohnzimmer"], correct: ["Wir haben uns", "gestern", "aus Wut", "ziemlich heftig", "im Wohnzimmer", "gestritten."] },
  { parts: ["Sie hat", "heute", "ihre Entscheidung bereut.", "leise", "aus Überzeugung", "im Zimmer"], correct: ["Sie hat", "heute", "aus Überzeugung", "leise", "im Zimmer", "ihre Entscheidung bereut."] }
];

function buildTekamolo() {
  const container = document.getElementById('tekamolo-container');
  if(!container) return; container.innerHTML = '';
  tekamoloData.forEach((item, index) => {
    const row = document.createElement('div'); row.className = 'tekamolo-item';
    row.innerHTML = `<p style="font-weight:700; margin-top:0; color:var(--primary-dark);">Satz ${index + 1}:</p>`;
    const chipWrapper = document.createElement('div'); chipWrapper.className = 'tekamolo-chips';
    item.parts.forEach((part) => { const chip = document.createElement('div'); chip.className = 't-chip'; chip.textContent = part; chipWrapper.appendChild(chip); });
    enableMobileSortable(chipWrapper);
    const checkBtn = document.createElement('button'); checkBtn.className = 'primary-btn'; checkBtn.textContent = 'Prüfen';
    const resultDiv = document.createElement('div'); resultDiv.className = 'tekamolo-result';
    checkBtn.addEventListener('click', () => {
      const currentOrder = Array.from(chipWrapper.children).filter(c => !c.classList.contains('t-chip-ghost')).map(c => c.textContent);
      if(JSON.stringify(currentOrder) === JSON.stringify(item.correct)) { resultDiv.textContent = 'Richtig! 🎉 ' + item.correct.join(' '); resultDiv.className = 'tekamolo-result correct'; } 
      else { resultDiv.innerHTML = `Falsch! ❌<br>Korrekt ist:<br><b>${item.correct.join(' ')}</b>`; resultDiv.className = 'tekamolo-result wrong'; }
    });
    row.appendChild(chipWrapper); row.appendChild(checkBtn); row.appendChild(resultDiv); container.appendChild(row);
  });
}
function enableMobileSortable(container) {
  let draggingItem = null, ghost = null, startX = 0, startY = 0, initX = 0, initY = 0;
  container.addEventListener('touchstart', handleStart, {passive: false}); container.addEventListener('mousedown', handleStart);
  function handleStart(e) {
    if(e.target.tagName !== 'DIV' || !e.target.classList.contains('t-chip')) return;
    draggingItem = e.target; const touch = e.touches ? e.touches[0] : e; startX = touch.clientX; startY = touch.clientY;
    const rect = draggingItem.getBoundingClientRect(); initX = rect.left; initY = rect.top;
    ghost = draggingItem.cloneNode(true); ghost.classList.add('t-chip-ghost'); ghost.style.left = initX + 'px'; ghost.style.top = initY + 'px'; ghost.style.width = rect.width + 'px';
    document.body.appendChild(ghost); draggingItem.classList.add('dragging');
    document.addEventListener('touchmove', handleMove, {passive: false}); document.addEventListener('touchend', handleEnd); document.addEventListener('mousemove', handleMove); document.addEventListener('mouseup', handleEnd);
  }
  function handleMove(e) {
    if(!draggingItem) return; e.preventDefault(); const touch = e.touches ? e.touches[0] : e;
    const dx = touch.clientX - startX, dy = touch.clientY - startY; ghost.style.left = (initX + dx) + 'px'; ghost.style.top = (initY + dy) + 'px';
    ghost.style.display = 'none'; const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY); ghost.style.display = 'block';
    if(!elemBelow) return; const targetItem = elemBelow.closest('.t-chip');
    if(targetItem && targetItem !== draggingItem && targetItem.parentElement === container && !targetItem.classList.contains('t-chip-ghost')) {
      const rect = targetItem.getBoundingClientRect(); const next = (touch.clientX - rect.left) / rect.width > 0.5;
      container.insertBefore(draggingItem, next ? targetItem.nextSibling : targetItem);
    }
  }
  function handleEnd() {
    if(!draggingItem) return; draggingItem.classList.remove('dragging'); if(ghost) ghost.remove(); draggingItem = null; ghost = null;
    document.removeEventListener('touchmove', handleMove); document.removeEventListener('touchend', handleEnd); document.removeEventListener('mousemove', handleMove); document.removeEventListener('mouseup', handleEnd);
  }
}

function buildNeueHeimatMCQ() {
  const container = document.getElementById('nh-mcq-container'); if(!container) return; container.innerHTML = '';
  const customMCQs = [
    { s: "Bevor ich reise, muss ich online <b>ein Visum beantragen</b>.", correct: "التقدم بطلب للحصول على تأشيرة", w1: "تجديد جواز السفر", w2: "شراء تذكرة" },
    { s: "Weil er ins Ausland geht, muss er nächste Woche <b>seine Wohnung auflösen</b>.", correct: "تصفية أو إخلاء الشقة", w1: "تنظيف الشقة", w2: "تأجير الشقة" },
    { s: "Auf der Konferenz konnte ich viele nützliche <b>Kontakte knüpfen</b>.", correct: "تكوين علاقات", w1: "إنهاء العلاقات", w2: "تجنب التحدث مع الناس" },
    { s: "Am Flughafen fiel es mir schwer, <b>mich</b> von meiner Familie <b>zu verabschieden</b>.", correct: "توديع شخص", w1: "استقبال شخص", w2: "الانتظار مع" },
    { s: "Er hat <b>seinen Job gekündigt</b>, um sich selbstständig zu machen.", correct: "الاستقالة من العمل", w1: "البحث عن عمل", w2: "الترقية في العمل" },
    { s: "Um mein Gehalt zu bekommen, muss ich <b>ein Konto eröffnen</b>.", correct: "فتح حساب بنكي", w1: "سحب أموال", w2: "إغلاق الحساب" },
    { s: "Es erfordert viel Mut, <b>sein gewohntes Leben aufzugeben</b>.", correct: "التخلي عن الحياة المعتادة", w1: "الحفاظ على الروتين", w2: "الاستمتاع بالحياة" },
    { s: "Nach der Trennung hat sie in einer anderen Stadt <b>komplett neu angefangen</b>.", correct: "البدء من جديد", w1: "العودة للماضي", w2: "التفكير في المستقبل" },
    { s: "Wer erfolgreich sein will, muss manchmal auch <b>etwas wagen</b>.", correct: "يجرؤ / يخاطر", w1: "يتجنب المخاطر", w2: "يعمل بهدوء" },
    { s: "Viele junge Menschen <b>wandern</b> nach Kanada <b>aus</b>.", correct: "يهاجر", w1: "يسافر للسياحة", w2: "يعود إلى وطنه" },
    { s: "Ich habe meinen Chef ganz <b>zufällig kennengelernt</b>.", correct: "التعرف بالصدفة", w1: "التعرف بشكل رسمي", w2: "تجاهل شخص" },
    { s: "Sie hat <b>sich</b> während ihres Urlaubs <b>verliebt</b>.", correct: "يقع في حب", w1: "يتشاجر مع", w2: "ينسى" },
    { s: "Nach seiner Krankheit hat er beschlossen, <b>sein Leben komplett zu ändern</b>.", correct: "تغيير حياته بالكامل", w1: "الحفاظ على صحته", w2: "العمل بجد" },
    { s: "Du musst <b>dich</b> rechtzeitig <b>um</b> deine Tickets <b>kümmern</b>.", correct: "يعتني بـ / ينجز", w1: "ينسى", w2: "يتجاهل" },
    { s: "Ich bin mit meinen Prüfungsergebnissen sehr <b>zufrieden</b>.", correct: "يكون راضياً عن", w1: "غاضب من", w2: "حزين بسبب" },
    { s: "Es <b>fällt</b> ihm <b>schwer</b>, Deutsch zu lernen.", correct: "يصعب على", w1: "يسهل على", w2: "لا يهتم بـ" },
    { s: "Ich <b>freue mich</b> schon riesig <b>auf</b> meinen nächsten Urlaub.", correct: "يتطلع إلى", w1: "يخاف من", w2: "ينسى" },
    { s: "Ich muss noch <b>eine Arbeitserlaubnis bekommen</b>.", correct: "الحصول على تصريح عمل", w1: "الحصول على إجازة", w2: "دفع الضرائب" },
    { s: "In den ersten Monaten in den USA hatte ich oft <b>Heimweh</b>.", correct: "الحنين إلى الوطن", w1: "الشعور بالسعادة", w2: "الرغبة في السفر" },
    { s: "Um studieren zu können, muss ich meine <b>Zeugnisse übersetzen lassen</b>.", correct: "ترجمة الشهادات", w1: "تصديق الشهادات", w2: "نسخ الشهادات" },
    { s: "Meine Nachbarn <b>streiten sich</b> fast jeden Tag.", correct: "يتجادل / يتشاجر", w1: "يتصالح", w2: "يضحك بصوت عالٍ" },
    { s: "Auch wenn du Fehler gemacht hast, darfst du <b>nicht aufgeben</b>.", correct: "لا يستسلم", w1: "يتوقف عن العمل", w2: "يستريح" },
    { s: "Ich habe <b>meine Entscheidung</b> Medizin zu studieren nie <b>bereut</b>.", correct: "يندم على قرار", w1: "يفرح بالقرار", w2: "يؤجل القرار" },
    { s: "Ich habe <b>die Erfahrung gemacht</b>, dass man mit Ehrlichkeit weit kommt.", correct: "يمر بتجربة", w1: "ينسى ما حدث", w2: "يتجاهل النصيحة" },
    { s: "Es dauert oft ein paar Monate, bis man <b>sich</b> in einer neuen Stadt richtig <b>eingelebt hat</b>.", correct: "يتأقلم", w1: "يشعر بالملل", w2: "يضيع" },
    { s: "Ein Auslandssemester ist eine Möglichkeit, den <b>Horizont zu erweitern</b>.", correct: "يوسع آفاقه", w1: "يضيق تفكيره", w2: "يتوقف عن التعلم" },
    { s: "In schwierigen Situationen kann man oft <b>viel über sich selbst erfahren</b>.", correct: "يكتشف الكثير عن نفسه", w1: "ينسى هويته", w2: "يتجاهل مشاعره" },
    { s: "Vor den Abschlussprüfungen sind die meisten Studenten sehr <b>gestresst</b>.", correct: "يكون مرهقاً / تحت ضغط", w1: "يكون هادئاً", w2: "يكون سعيداً" },
    { s: "Die Kinder <b>warten</b> schon <b>sehnsüchtig auf</b> den Beginn der Ferien.", correct: "ينتظر بشوق", w1: "ينسى الموعد", w2: "يتجاهل الحدث" },
    { s: "In einer Fremdsprache ist es manchmal schwer, <b>sich genau auszudrücken</b>.", correct: "يعبر عن نفسه بدقة", w1: "يتحدث بصوت عالٍ", w2: "يكتب بسرعة" }
  ];
  shuffle(customMCQs).forEach((q, qIndex) => {
    const options = shuffle([{t: q.correct, c: true}, {t: q.w1, c: false}, {t: q.w2, c: false}]);
    const item = document.createElement('div'); item.className = 'mcq-item';
    item.innerHTML = `<div class="mcq-question" style="direction:ltr; text-align:left;">${qIndex + 1}. Was bedeutet der markierte Ausdruck?<br><span style="font-weight:500; font-style:italic; color:var(--primary-dark); display:inline-block; margin-top:8px;">"${q.s}"</span></div><div class="mcq-options"></div>`;
    const optionsWrap = item.querySelector('.mcq-options');
    options.forEach(opt => {
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'mcq-option'; btn.textContent = opt.t;
      btn.addEventListener('click', () => {
        optionsWrap.querySelectorAll('.mcq-option').forEach(b => b.classList.add('disabled'));
        if(opt.c){ btn.classList.add('correct'); } else { btn.classList.add('wrong'); optionsWrap.querySelectorAll('.mcq-option').forEach(b => { if(b.textContent === q.correct) b.classList.add('correct'); }); }
      });
      optionsWrap.appendChild(btn);
    });
    container.appendChild(item);
  });
}

/* ============================================================
   5. DATA: UNSERE MUTTERSPRACHE (NEW)
   ============================================================ */
const mutterspracheData = [
  { verbindung: "etwas ausdrücken", bedeutung: "يعبر عن شيء", synonyme: "etwas zum Ausdruck bringen / zeigen", beispielText: "Mit ihr können wir unsere Gefühle am besten ausdrücken.", beispielNeu: "Kinder können ihre Wünsche noch nicht gut ausdrücken." },
  { verbindung: "Teil der Identität sein", bedeutung: "يكون جزءاً من الهوية", synonyme: "zur Identität gehören", beispielText: "Sie ist Heimat und Teil unserer Identität: unsere Muttersprache.", beispielNeu: "Musik ist für viele Jugendliche ein wichtiger Teil ihrer Identität." },
  { verbindung: "jemanden trösten", bedeutung: "يواسي / يعزي شخصاً", synonyme: "jemandem beistehen", beispielText: "Unsere Mütter haben uns in dieser Sprache getröstet.", beispielNeu: "Er hat seine Freundin getröstet, weil sie traurig war." },
  { verbindung: "in dem / in der", bedeutung: "الذي / التي فيه(ا)", synonyme: "wo", beispielText: "ein Land, in dem mehrere Muttersprachen gesprochen werden", beispielNeu: "Das ist die Stadt, in der ich geboren bin." },
  { verbindung: "ein Zusammenschluss", bedeutung: "تكتل / اتحاد", synonyme: "eine Vereinigung", beispielText: "Das bedeutet: ein Zusammenschluss von inzwischen 26 Kantonen.", beispielNeu: "Die EU ist ein Zusammenschluss von 27 Staaten." },
  { verbindung: "jeweils", bedeutung: "لكل واحد / على حدة", synonyme: "für sich genommen", beispielText: "Die Kantone haben z. B. jeweils ein eigenes Parlament.", beispielNeu: "Die drei Kinder bekamen jeweils ein Geschenk." },
  { verbindung: "konfrontiert werden", bedeutung: "يواجه بشيء", synonyme: "in Berührung kommen", beispielText: "... wurde jemand schnell mit einer anderen Sprache konfrontiert.", beispielNeu: "Im Ausland wird man oft mit neuen Kulturen konfrontiert." },
  { verbindung: "die Eliten", bedeutung: "النخب / الطبقة الراقية", synonyme: "die führenden Kreise", beispielText: "Die Eliten in der Schweiz des 17. Jahrhunderts sprachen Latein.", beispielNeu: "Die politischen Eliten trafen sich zu einem Gipfeltreffen." },
  { verbindung: "sich vergrößern", bedeutung: "يكبر / يتوسع", synonyme: "wachsen", beispielText: "Nachdem sich das Land um neue Gebiete vergrößert hatte...", beispielNeu: "Die Stadt hat sich in den letzten Jahren stark vergrößert." },
  { verbindung: "dieselbe Bedeutung haben", bedeutung: "له نفس الأهمية", synonyme: "genauso wichtig sein", beispielText: "... bekamen Französisch und Italienisch dieselbe Bedeutung...", beispielNeu: "Für Firmen hat Kundenservice dieselbe Bedeutung wie Qualität." },
  { verbindung: "als etw. anerkannt werden", bedeutung: "يعترف به كـ", synonyme: "offiziell akzeptiert werden", beispielText: "1848 wurden alle drei Sprachen als offizielle Landessprachen anerkannt.", beispielNeu: "Sein Studium wurde als gleichwertig anerkannt." },
  { verbindung: "dazukommen", bedeutung: "ينضم / يضاف", synonyme: "hinzukommen", beispielText: "1938 kam Rätoromanisch als vierte Sprache dazu.", beispielNeu: "Zum Team kam letzte Woche ein neuer Kollege dazu." },
  { verbindung: "dank (+ Genitiv/Dativ)", bedeutung: "بفضل", synonyme: "aufgrund von", beispielText: "Neben diesen Sprachen werden dank Migration auch andere gesprochen.", beispielNeu: "Dank seiner harten Arbeit hat er die Prüfung bestanden." },
  { verbindung: "zahlreiche", bedeutung: "عديد / كثير", synonyme: "viele", beispielText: "... werden auch zahlreiche andere Sprachen gesprochen.", beispielNeu: "Bei dem Konzert waren zahlreiche Fans anwesend." },
  { verbindung: "die Vielfalt", bedeutung: "التنوع", synonyme: "die Verschiedenheit", beispielText: "Die Vielfalt der Sprachen ist in der Schweiz sehr groß.", beispielNeu: "Die kulturelle Vielfalt in Berlin ist beeindruckend." },
  { verbindung: "zum Alltag gehören", bedeutung: "جزء من الحياة اليومية", synonyme: "normal / üblich sein", beispielText: "Es gehört zum Alltag dazu.", beispielNeu: "Homeoffice gehört heute für viele zum Alltag." },
  { verbindung: "fälschlicherweise", bedeutung: "عن طريق الخطأ", synonyme: "irrtümlich", beispielText: "Manchmal glauben Nicht-Schweizer fälschlicherweise, dass...", beispielNeu: "Er hat fälschlicherweise geglaubt, der Zug fahre um acht." },
  { verbindung: "fließend beherrschen", bedeutung: "يتقن بطلاقة", synonyme: "perfekt sprechen", beispielText: "... dass alle Schweizer vier Sprachen fließend beherrschen.", beispielNeu: "Sie beherrscht drei Fremdsprachen fließend." },
  { verbindung: "jedoch", bedeutung: "لكن / غير أن", synonyme: "aber / allerdings", beispielText: "Die meisten Schweizer leben jedoch in ihrem Sprachgebiet.", beispielNeu: "Das Wetter war schlecht, jedoch blieben wir draußen." },
  { verbindung: "von Anfang an", bedeutung: "منذ البداية", synonyme: "von Beginn an", beispielText: "Die Schweiz war von Anfang an ein vielsprachiges Land.", beispielNeu: "Ich wusste von Anfang an, dass der Plan nicht funktioniert." },
  { verbindung: "innerhalb", bedeutung: "ضمن / داخل", synonyme: "im Bereich von", beispielText: "Die Lehrpläne sind also innerhalb der Schweiz nicht einheitlich.", beispielNeu: "Innerhalb einer Woche muss ich die Arbeit abgeben." },
  { verbindung: "erste Fremdsprache", bedeutung: "لغة أجنبية أولى", synonyme: "zuerst gelernte Fremdsprache", beispielText: "In der Schule lernen die Kinder als erste Fremdsprache Deutsch.", beispielNeu: "An vielen Schulen ist Englisch die erste Fremdsprache." },
  { verbindung: "sowie", bedeutung: "بالإضافة إلى / وكذلك", synonyme: "und auch", beispielText: "... in den übrigen Kantonen sowie im Tessin...", beispielNeu: "Zum Frühstück gab es Brot, Käse sowie frisches Obst." },
  { verbindung: "je nach", bedeutung: "بحسب / تبعاً لـ", synonyme: "abhängig von", beispielText: "... ist die Fremdsprache je nach Sprachregion Deutsch oder...", beispielNeu: "Je nach Wetter machen wir einen Ausflug oder bleiben zu Hause." },
  { verbindung: "nicht einheitlich sein", bedeutung: "غير موحد", synonyme: "unterschiedlich sein", beispielText: "Die Lehrpläne sind also nicht einheitlich.", beispielNeu: "Die Strompreise sind in Deutschland nicht einheitlich." },
  { verbindung: "die übrigen", bedeutung: "الباقون / البقية", synonyme: "die restlichen", beispielText: "... in den übrigen Deutschschweizer Kantonen...", beispielNeu: "Drei Gäste sind da, die übrigen kommen später." },
  { verbindung: "sämtliche", bedeutung: "كافة / جميع", synonyme: "alle (ohne Ausnahme)", beispielText: "... dass sämtliche amtlichen Schriften veröffentlicht werden müssen.", beispielNeu: "Er hat sämtliche Unterlagen mitgebracht." },
  { verbindung: "amtliche Schriften", bedeutung: "الوثائق الرسمية", synonyme: "offizielle Dokumente", beispielText: "... sämtliche amtlichen Schriften in allen Landessprachen...", beispielNeu: "Amtliche Schriften müssen oft beglaubigt werden." },
  { verbindung: "Das gilt für ... genauso", bedeutung: "هذا ينطبق على ... تماماً", synonyme: "das trifft zu für...", beispielText: "Das gilt für Gesetze genauso wie für andere Texte.", beispielNeu: "Die Regel gilt für Schüler genauso wie für Lehrer." },
  { verbindung: "betreffen", bedeutung: "يتعلق بـ / يخص", synonyme: "mit etw. zu tun haben", beispielText: "... andere Texte, die das ganze Land betreffen.", beispielNeu: "Diese Entscheidung betrifft alle Mitarbeiter." },
  { verbindung: "zu Problemen führen", bedeutung: "يؤدي إلى مشاكل", synonyme: "Probleme verursachen", beispielText: "... was bei Produkten zu Platzproblemen führen kann.", beispielNeu: "Zu wenig Schlaf kann zu Problemen führen." },
  { verbindung: "voraussetzen", bedeutung: "يفترض مسبقاً", synonyme: "als Bedingung annehmen", beispielText: "Dabei wird vorausgesetzt, dass man die Sprachen versteht.", beispielNeu: "Der Job setzt gute Englischkenntnisse voraus." },
  { verbindung: "einen Wandel beobachten", bedeutung: "يلاحظ تغيراً", synonyme: "Veränderung feststellen", beispielText: "In letzter Zeit kann man hier einen Wandel beobachten.", beispielNeu: "Forscher beobachten einen Wandel im Konsumverhalten." },
  { verbindung: "immer häufiger", bedeutung: "بشكل متزايد", synonyme: "zunehmend / öfter", beispielText: "Immer häufiger wird das Englische verwendet.", beispielNeu: "Immer häufiger arbeiten Menschen von zu Hause aus." },
  { verbindung: "als gemeinsame Sprache", bedeutung: "كلغة مشتركة", synonyme: "als Verkehrssprache", beispielText: "... wird das Englische als gemeinsame Sprache verwendet.", beispielNeu: "In der EU wird Englisch als gemeinsame Sprache verwendet." },
  { verbindung: "in letzter Zeit", bedeutung: "في الآونة الأخيرة", synonyme: "kürzlich", beispielText: "In letzter Zeit kann man hier einen Wandel beobachten.", beispielNeu: "In letzter Zeit fühle ich mich oft müde." },
  { verbindung: "Man sieht:", bedeutung: "كما نرى / يلاحظ", synonyme: "es zeigt sich, dass", beispielText: "Man sieht: Die Vielfalt der Sprachen ist sehr groß.", beispielNeu: "Man sieht: Ohne Übung lernt man keine Sprache." },
  { verbindung: "bedeuten, dass", bedeutung: "يعني أن", synonyme: "heißen, dass", beispielText: "Das bedeutet: ein Zusammenschluss von 26 Kantonen.", beispielNeu: "Der rote Punkt bedeutet, dass der Platz besetzt ist." },
  { verbindung: "vielsprachig / multikulturell", bedeutung: "متعدد اللغات/الثقافات", synonyme: "mit vielen Sprachen/Kulturen", beispielText: "Die Schweiz war ein vielsprachiges, multikulturelles Land.", beispielNeu: "New York ist eine vielsprachige und multikulturelle Stadt." },
  { verbindung: "Nicht-Schweizer", bedeutung: "غير السويسريين", synonyme: "Menschen nicht aus der Schweiz", beispielText: "Manchmal glauben Nicht-Schweizer fälschlicherweise, dass...", beispielNeu: "Nicht-Muttersprachler machen oft dieselben Fehler." }
];

const mutterspracheTextRaw = `<div class="lesetext-title">Unsere Muttersprache – Ein Stück Heimat</div><p>Sie gibt uns das Gefühl der Vertrautheit und der Sicherheit. Mit ihr können wir unsere Gefühle, aber auch komplexe Sachverhalte am besten <span class="vocab-word" data-meaning="يعبر عن شيء">ausdrücken</span>. Sie ist Heimat und <span class="vocab-word" data-meaning="يكون جزءاً من الهوية">Teil unserer Identität</span>: unsere Muttersprache. „Muttersprache“ – das Wort drückt vieles aus: Unsere Mütter haben uns in dieser Sprache <span class="vocab-word" data-meaning="يواسي / يعزي شخصاً">getröstet</span> und uns in den Schlaf gesungen; unsere ersten Worte formulierten wir <span class="vocab-word" data-meaning="الذي / التي فيه(ا)">in dieser Sprache</span>.</p><p>Die Schweiz war <span class="vocab-word" data-meaning="منذ البداية">von Anfang an</span> ein <span class="vocab-word" data-meaning="متعدد اللغات / متعدد الثقافات">vielsprachiges, multikulturelles</span> Land, <span class="vocab-word" data-meaning="الذي / التي فيه(ا)">in dem</span> mehrere Muttersprachen gesprochen werden, denn die Schweiz ist eine „Eidgenossenschaft“: Das <span class="vocab-word" data-meaning="يعني أن ...">bedeutet,</span> ein <span class="vocab-word" data-meaning="تكتل / اتحاد (من)">Zusammenschluss</span> von inzwischen 26 Kantonen. Die einzelnen Kantone sind politisch sehr selbstständig und haben z. B. <span class="vocab-word" data-meaning="لكل واحد / على حدة">jeweils</span> ein eigenes Parlament und auch unterschiedliche Amtssprachen. Schon im 17. Jahrhundert wurde jemand, der <span class="vocab-word" data-meaning="داخل / ضمن">innerhalb</span> der Schweiz reisen wollte oder musste, schnell <span class="vocab-word" data-meaning="يواجه بشيء">mit einer anderen Sprache konfrontiert</span>. Die <span class="vocab-word" data-meaning="النخب / الطبقة الراقية">Eliten</span> in der Schweiz des 17. Jahrhunderts sprachen Latein und vor allem Französisch. Die Verwaltungssprache war aber Deutsch. Nachdem sich das Land um französisch- und italienischsprachige Gebiete <span class="vocab-word" data-meaning="يكبر / يتوسع">vergrößert</span> hatte, bekamen Französisch und Italienisch <span class="vocab-word" data-meaning="له نفس الأهمية مثل">dieselbe Bedeutung wie</span> Deutsch und 1848 wurden alle drei Sprachen <span class="vocab-word" data-meaning="يعترف به كـ ...">als offizielle Landessprachen anerkannt</span>. 1938 kam Rätoromanisch als vierte Sprache <span class="vocab-word" data-meaning="يضاف / ينضم">dazu</span>. Neben diesen vier Sprachen werden <span class="vocab-word" data-meaning="بفضل">dank</span> Migration auch <span class="vocab-word" data-meaning="عديد / كثير">zahlreiche</span> andere Sprachen gesprochen. <span class="vocab-word" data-meaning="كما نرى / يلاحظ أن ...">Man sieht:</span> Die <span class="vocab-word" data-meaning="التنوع">Vielfalt</span> der Sprachen ist in der Schweiz sehr groß und hat eine lange Tradition. Es <span class="vocab-word" data-meaning="يكون جزءاً من الحياة اليومية">gehört zum Alltag dazu</span>.</p><p>Manchmal glauben <span class="vocab-word" data-meaning="غير السويسريين">Nicht-Schweizer</span> <span class="vocab-word" data-meaning="خطأ / عن طريق الخطأ">fälschlicherweise</span>, dass alle Schweizerinnen und Schweizer vier Sprachen <span class="vocab-word" data-meaning="يتقن شيئاً بطلاقة">fließend beherrschen</span>. Die meisten Schweizer leben <span class="vocab-word" data-meaning="لكن / غير أن">jedoch</span> in ihrem Sprachgebiet und nutzen Medien wie Zeitungen, Radio, Fernsehen usw. in ihrer Muttersprache. In der Schule lernen die Kinder in den französischsprachigen Kantonen <span class="vocab-word" data-meaning="كلغة أجنبية أولى">als erste Fremdsprache</span> Deutsch. In den deutschsprachigen Kantonen der Zentralschweiz und der Ostschweiz ist Englisch die erste Fremdsprache und in den <span class="vocab-word" data-meaning="البقية / الباقون">übrigen</span> Deutschschweizer Kantonen <span class="vocab-word" data-meaning="وكذلك / بالإضافة إلى">sowie</span> im italienischsprachigen Tessin beginnen die Kinder in der Schule mit Französisch. Im großen Kanton Graubünden ist die erste Fremdsprache <span class="vocab-word" data-meaning="بحسب / تبعاً لـ">je nach</span> Sprachregion Deutsch, Italienisch oder Rätoromanisch. Die Lehrpläne sind also innerhalb der Schweiz <span class="vocab-word" data-meaning="غير موحد / مختلف">nicht einheitlich</span>. Diese Sprachenvielfalt bedeutet auch, dass <span class="vocab-word" data-meaning="جميع / كافة">sämtliche</span> <span class="vocab-word" data-meaning="الوثائق والإعلانات الرسمية">amtlichen Schriften und Bekanntmachungen</span> in allen Landessprachen veröffentlicht werden müssen. <span class="vocab-word" data-meaning="ينطبق هذا على ... تماماً كما ...">Das gilt für</span> Gesetze und Berichte <span class="vocab-word" data-meaning="ينطبق هذا على ... تماماً كما ...">genauso wie für</span> andere Texte, die das ganze Land <span class="vocab-word" data-meaning="يخص / يتعلق بـ">betreffen</span>: Webseiten, Broschüren, Flyer, Verkehrsschilder und Schilder in öffentlichen Verkehrsmitteln und Gebäuden. Auch die Verpackungen von Lebensmitteln und anderen Alltagsprodukten sind in mehreren Sprachen beschriftet – was bei kleinen Produkten <span class="vocab-word" data-meaning="يؤدي إلى مشاكل">zu Platzproblemen führen</span> kann. In Geschäftsverhandlungen oder bei Konferenzen und Sitzungen mit Leuten aus verschiedenen Sprachgebieten sprechen oft alle in ihrer Muttersprache. Dabei <span class="vocab-word" data-meaning="يفترض شيئاً مسبقاً">wird vorausgesetzt</span>, dass man die Sprachen der Gesprächspartner versteht. <span class="vocab-word" data-meaning="في الآونة الأخيرة">In letzter Zeit</span> kann man hier <span class="vocab-word" data-meaning="يلاحظ تغيراً">einen Wandel beobachten</span>: <span class="vocab-word" data-meaning="أكثر فأكثر / بشكل متزايد">Immer häufiger</span> wird auch bei schweiz-internen Geschäftsbeziehungen das Englische <span class="vocab-word" data-meaning="يستخدم كلغة مشتركة">als gemeinsame Sprache verwendet</span>.</p>`;

/* ============================================================
   5.5 PRACTICE: MUTTERSPRACHE PASSIV & MCQ
   ============================================================ */
function buildMuttersprachePassiv() {
  const container = document.getElementById('ms-passiv-container'); if(!container) return; container.innerHTML = '';
  const passivData = [
    { t: "Aktiv ➔ Passiv", s: "Die Mütter haben die Kinder in dieser Sprache getröstet.", c: ["Die Kinder sind von den Müttern in dieser Sprache getröstet worden.", "Die Kinder wurden von den Müttern in dieser Sprache getröstet."] },
    { t: "Aktiv ➔ Passiv", s: "Man drückt Gefühle am besten in der Muttersprache aus.", c: ["Gefühle werden am besten in der Muttersprache ausgedrückt.", "Gefühle werden in der Muttersprache am besten ausgedrückt."] },
    { t: "Aktiv ➔ Passiv", s: "Die Eliten im 17. Jahrhundert sprachen Latein.", c: ["Latein wurde im 17. Jahrhundert von den Eliten gesprochen.", "Latein wurde von den Eliten im 17. Jahrhundert gesprochen."] },
    { t: "Aktiv ➔ Passiv", s: "Man erkannte alle drei Sprachen als offiziell an.", c: ["Alle drei Sprachen wurden als offiziell anerkannt."] },
    { t: "Aktiv ➔ Passiv", s: "Migration bringt zahlreiche andere Sprachen.", c: ["Zahlreiche andere Sprachen werden durch Migration gebracht."] },
    { t: "Aktiv ➔ Passiv", s: "Viele Schweizer beherrschen vier Sprachen fließend.", c: ["Vier Sprachen werden von vielen Schweizern fließend beherrscht."] },
    { t: "Aktiv ➔ Passiv", s: "Die Kinder lernen Deutsch als erste Fremdsprache.", c: ["Deutsch wird von den Kindern als erste Fremdsprache gelernt."] },
    { t: "Aktiv ➔ Passiv", s: "Man muss sämtliche Schriften veröffentlichen.", c: ["Sämtliche Schriften müssen veröffentlicht werden."] },
    { t: "Aktiv ➔ Passiv", s: "Man beschriftet die Verpackungen in mehreren Sprachen.", c: ["Die Verpackungen werden in mehreren Sprachen beschriftet."] },
    { t: "Aktiv ➔ Passiv", s: "Man setzt das Verständnis der Sprachen voraus.", c: ["Das Verständnis der Sprachen wird vorausgesetzt."] },
    { t: "Aktiv ➔ Passiv", s: "Man beobachtet einen Wandel.", c: ["Ein Wandel wird beobachtet."] },
    { t: "Aktiv ➔ Passiv", s: "Man verwendet Englisch als gemeinsame Sprache.", c: ["Englisch wird als gemeinsame Sprache verwendet."] },
    { t: "Passiv ➔ Aktiv", s: "Die Sprachen werden von den Menschen gelernt.", c: ["Die Menschen lernen die Sprachen."] },
    { t: "Passiv ➔ Aktiv", s: "Ein Wandel wird in letzter Zeit beobachtet.", c: ["Man beobachtet in letzter Zeit einen Wandel."] },
    { t: "Passiv ➔ Aktiv", s: "Unsere Gefühle können in der Sprache ausgedrückt werden.", c: ["Wir können unsere Gefühle in der Sprache ausdrücken.", "Man kann unsere Gefühle in der Sprache ausdrücken."] },
    { t: "Passiv ➔ Aktiv", s: "Das Land wurde durch neue Gebiete vergrößert.", c: ["Neue Gebiete vergrößerten das Land.", "Man vergrößerte das Land durch neue Gebiete."] },
    { t: "Passiv ➔ Aktiv", s: "Rätoromanisch wurde als vierte Sprache anerkannt.", c: ["Man erkannte Rätoromanisch als vierte Sprache an."] },
    { t: "Passiv ➔ Aktiv", s: "In der Schweiz werden viele Sprachen gesprochen.", c: ["Man spricht in der Schweiz viele Sprachen.", "In der Schweiz spricht man viele Sprachen."] },
    { t: "Passiv ➔ Aktiv", s: "Sämtliche amtlichen Schriften müssen veröffentlicht werden.", c: ["Man muss sämtliche amtlichen Schriften veröffentlichen.", "Sämtliche amtlichen Schriften muss man veröffentlichen."] },
    { t: "Passiv ➔ Aktiv", s: "Das Englische wird als gemeinsame Sprache verwendet.", c: ["Man verwendet das Englische als gemeinsame Sprache."] }
  ];

  passivData.forEach((item, index) => {
    const row = document.createElement('div'); row.className = 'passiv-item';
    row.innerHTML = `<div class="passiv-task">${item.t}</div><div class="passiv-sentence">${index+1}. ${item.s}</div><input type="text" class="passiv-input" placeholder="Schreibe deine Antwort hier...">`;
    const checkBtn = document.createElement('button'); checkBtn.className = 'primary-btn'; checkBtn.textContent = 'Prüfen';
    const showBtn = document.createElement('button'); showBtn.className = 'secondary-btn'; showBtn.textContent = 'Lösung anzeigen';
    const resultDiv = document.createElement('div'); resultDiv.className = 'passiv-result';
    
    checkBtn.addEventListener('click', () => {
      const val = row.querySelector('.passiv-input').value.trim().toLowerCase().replace(/[^a-zäöüß ]/g, '');
      const correctArr = item.c.map(ans => ans.trim().toLowerCase().replace(/[^a-zäöüß ]/g, ''));
      if(correctArr.includes(val) && val.length > 0) { resultDiv.textContent = 'Richtig! 🎉'; resultDiv.className = 'passiv-result correct'; } 
      else { resultDiv.innerHTML = 'Versuch es noch einmal! ❌'; resultDiv.className = 'passiv-result wrong'; }
    });
    
    showBtn.addEventListener('click', () => {
      resultDiv.innerHTML = `<b>Mögliche Lösung:</b><br>${item.c[0]}`; resultDiv.className = 'passiv-result correct';
    });
    
    row.appendChild(checkBtn); row.appendChild(showBtn); row.appendChild(resultDiv); container.appendChild(row);
  });
}

function buildMutterspracheMCQ() {
  const container = document.getElementById('ms-mcq-container'); if(!container) return; container.innerHTML = '';
  const mcqData = mutterspracheData.map(d => ({ s: `Was bedeutet der Ausdruck <b>"${d.verbindung}"</b>?`, correct: d.bedeutung, w1: "", w2: "" }));
  // Generate random wrong options
  mcqData.forEach(item => {
    const pool = mutterspracheData.filter(d => d.bedeutung !== item.correct);
    const shuffledPool = shuffle(pool);
    item.w1 = shuffledPool[0].bedeutung; item.w2 = shuffledPool[1].bedeutung;
  });
  
  shuffle(mcqData).forEach((q, qIndex) => {
    const options = shuffle([{t: q.correct, c: true}, {t: q.w1, c: false}, {t: q.w2, c: false}]);
    const item = document.createElement('div'); item.className = 'mcq-item';
    item.innerHTML = `<div class="mcq-question" style="direction:ltr; text-align:left;">${qIndex + 1}. ${q.s}</div><div class="mcq-options"></div>`;
    const optionsWrap = item.querySelector('.mcq-options');
    options.forEach(opt => {
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'mcq-option'; btn.textContent = opt.t;
      btn.addEventListener('click', () => {
        optionsWrap.querySelectorAll('.mcq-option').forEach(b => b.classList.add('disabled'));
        if(opt.c){ btn.classList.add('correct'); } else { btn.classList.add('wrong'); optionsWrap.querySelectorAll('.mcq-option').forEach(b => { if(b.textContent === q.correct) b.classList.add('correct'); }); }
      });
      optionsWrap.appendChild(btn);
    });
    container.appendChild(item);
  });
}
