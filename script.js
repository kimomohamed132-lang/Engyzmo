/* ============================================================
   0. CORE NAVIGATION & SETUP
   ============================================================ */
window.addEventListener('load', () => {
  const splash = document.getElementById('splash-screen');
  setTimeout(() => {
    splash.classList.add('hidden');
    setTimeout(() => splash.remove(), 600);
  }, 2500); 
  
  loadGlobalState(); 
  
  // تشغيل الأقسام باستخدام الدالة الذكية
  initTopic('krach', krachData, krachTextRaw);
  initTopic('neueheimat', neueHeimatData, neueHeimatTextRaw);
  
  // بناء تدريبات Neue Heimat
  buildTekamolo();
  buildNeueHeimatMCQ();
  
  // تفعيل الـ Tooltips للنصوص
  setupTooltips();
});

function openPage(pageId) {
  document.querySelectorAll('.page-view').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  window.scrollTo(0, 0);
}

// دالة تنقل الـ Tabs للدروس (Lesetext vs Flashcards vs Übungen)
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

// دالة تنقل التدريبات (TEKAMOLO vs MCQ)
function switchPracticeTab(prefix, tabName, btnElement) {
  const parent = btnElement.parentElement;
  parent.querySelectorAll('.fc-toggle-btn').forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');
  
  const container = document.getElementById(`${prefix}-practice`);
  container.querySelectorAll('.practice-tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(`${prefix}-${tabName}`).classList.add('active');
}

// دالة تنقل الـ Tabs داخل الفلاش كاردز (Überblick / Lernmodus / Review)
document.querySelectorAll('.fc-toggle-btn').forEach(btn => {
  if(btn.hasAttribute('onclick')) return; // ignore practice buttons
  btn.addEventListener('click', () => {
    const parentContainer = btn.closest('.sub-view');
    parentContainer.querySelectorAll('.fc-toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    parentContainer.querySelectorAll('.fc-view').forEach(v => v.classList.remove('active'));
    
    const targetId = btn.dataset.fcview;
    document.getElementById(targetId).classList.add('active');
    
    // إعادة رسم الكارت عند الدخول لوضع المذاكرة
    if (targetId.includes('-study-view')) {
      const prefix = targetId.split('-study-view')[0];
      if(window[`renderStudyCard_${prefix}`]) window[`renderStudyCard_${prefix}`]();
    }
  });
});

/* ============================================================
   1. GLOBAL STATE & LOCALSTORAGE
   ============================================================ */
let appState = {
  krach: { reviewQueue: [], studyOrder: [], studyPos: 0 },
  neueheimat: { reviewQueue: [], studyOrder: [], studyPos: 0 }
};

function loadGlobalState() {
  const saved = localStorage.getItem('engyzmo_state_v8'); 
  if (saved) {
    const parsed = JSON.parse(saved);
    appState.krach = parsed.krach || appState.krach;
    appState.neueheimat = parsed.neueheimat || appState.neueheimat;
  }
}

function saveGlobalState() {
  localStorage.setItem('engyzmo_state_v8', JSON.stringify(appState));
}

function shuffle(arr){
  const a = [...arr];
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let toastTimer;
function showToast(msg){
  const toast = document.getElementById('toast');
  toast.textContent = msg; toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ============================================================
   2. THE MAGIC FUNCTION (دالة توليد الدروس التلقائية)
   ============================================================ */
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
    if(!container) return;
    container.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'flip-card';
      card.innerHTML = `
        <div class="flip-card-inner">
          <div class="flip-front"><strong>${item.verbindung}</strong></div>
          <div class="flip-back flashcard-back-v2" style="padding:12px; gap:4px; justify-content:center;">
            <div class="fc-section fc-bedeutung" style="text-align:center;">
              <h3 class="arabic-text" style="font-size:1.2rem;">${item.bedeutung}</h3>
            </div>
            <div class="fc-section fc-synonyme" style="margin-bottom:5px;">
              <p style="font-size:0.85rem; text-align:center; color:#fff;">${item.synonyme || item.bedeutungDe || ''}</p>
            </div>
            <hr class="fc-divider" style="margin:4px 0;">
            <div class="fc-section fc-text-beispiel" style="margin:0;">
              <span class="fc-icon" style="font-size:0.9rem;">📖</span>
              <p style="font-size:0.75rem; line-height:1.2; text-align:left;">${item.beispielText || item.beispiel || ''}</p>
            </div>
            ${!isReview 
              ? '<button class="review-btn" type="button" style="margin-top:auto; min-height:30px;">🔁 Needs Review</button>' 
              : '<button class="learned-btn" type="button" style="margin-top:auto; min-height:30px;">✅ Gelernt</button>'}
          </div>
        </div>
      `;
      card.addEventListener('click', (e) => {
        if(e.target.closest('.review-btn') || e.target.closest('.learned-btn')) return;
        card.classList.toggle('flipped');
      });
      if(!isReview) {
        card.querySelector('.review-btn').addEventListener('click', e => { e.stopPropagation(); schedule(item); });
      } else {
        card.querySelector('.learned-btn').addEventListener('click', e => { e.stopPropagation(); remove(item); });
      }
      container.appendChild(card);
    });
  };

  const updateReview = () => {
    if(!reviewBadge) return;
    const queue = appState[prefix].reviewQueue.map(v => dataArray.find(d => d.verbindung === v)).filter(Boolean);
    reviewBadge.textContent = queue.length;
    if(queue.length === 0) { reviewGrid.innerHTML = '<p class="hint">Keine Karten zur Wiederholung. Super!</p>'; }
    else { renderGrid(reviewGrid, queue, true); }
  };

  const schedule = (item) => {
    if(!appState[prefix].reviewQueue.includes(item.verbindung)) {
      appState[prefix].reviewQueue.push(item.verbindung);
      const vIndex = dataArray.findIndex(d => d.verbindung === item.verbindung);
      const sIndex = appState[prefix].studyOrder.indexOf(vIndex);
      if(sIndex > -1) {
        appState[prefix].studyOrder.splice(sIndex, 1);
        if(appState[prefix].studyPos >= appState[prefix].studyOrder.length) appState[prefix].studyPos = 0;
      }
      updateReview(); saveGlobalState(); showToast('Hinzugefügt ✅');
    } else { showToast('Bereits in der Liste!'); }
  };
  
  const remove = (item) => {
    appState[prefix].reviewQueue = appState[prefix].reviewQueue.filter(v => v !== item.verbindung);
    updateReview(); saveGlobalState(); showToast('Entfernt 🎉');
  };

  const renderStudy = () => {
    if(!cardEl) return;
    const order = appState[prefix].studyOrder;
    let pos = appState[prefix].studyPos;
    
    if(order.length === 0) {
      document.getElementById(`${prefix}-front-text`).textContent = 'Alle gelernt 🎉';
      document.getElementById(`${prefix}-back-arabic`).textContent = '';
      document.getElementById(`${prefix}-back-synonyme`).textContent = '';
      document.getElementById(`${prefix}-back-textbeispiel`).textContent = '';
      document.getElementById(`${prefix}-back-neuesbeispiel`).textContent = '';
      document.getElementById(`${prefix}-progress-label`).textContent = '0 / 0';
      document.getElementById(`${prefix}-progress-fill`).style.width = '100%';
      return;
    }
    
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
    document.getElementById(`${prefix}-next`).addEventListener('click', () => {
      if(appState[prefix].studyOrder.length === 0) return;
      appState[prefix].studyPos = (appState[prefix].studyPos + 1) % appState[prefix].studyOrder.length;
      saveGlobalState(); renderStudy();
    });
    document.getElementById(`${prefix}-prev`).addEventListener('click', () => {
      if(appState[prefix].studyOrder.length === 0) return;
      appState[prefix].studyPos = (appState[prefix].studyPos - 1 + appState[prefix].studyOrder.length) % appState[prefix].studyOrder.length;
      saveGlobalState(); renderStudy();
    });
    document.getElementById(`${prefix}-shuffle`).addEventListener('click', () => {
      appState[prefix].studyOrder = shuffle(appState[prefix].studyOrder);
      appState[prefix].studyPos = 0;
      saveGlobalState(); renderStudy(); showToast('Gemischt 🔀');
    });
    
    const studyRevBtn = document.getElementById(`${prefix}-study-review-btn`);
    if(studyRevBtn) {
      studyRevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if(appState[prefix].studyOrder.length === 0) return;
        schedule(dataArray[appState[prefix].studyOrder[appState[prefix].studyPos]]);
        document.getElementById(`${prefix}-next`).click();
      });
    }
    
    let stX = null, stY = null, swiping = false;
    cardEl.addEventListener('pointerdown', e => { stX = e.clientX; stY = e.clientY; swiping = true; });
    cardEl.addEventListener('pointerup', e => {
      if(!swiping || stX === null) return;
      const dx = e.clientX - stX, dy = e.clientY - stY; swiping = false;
      if(Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if(dx < 0) document.getElementById(`${prefix}-next`).click();
        else document.getElementById(`${prefix}-prev`).click();
      }
      stX = stY = null;
    });
  }

  renderGrid(grid, dataArray, false);
  updateReview();
  renderStudy();
}

/* ============================================================
   3. DATA & CONFIG: NEUE HEIMAT
   ============================================================ */
const neueHeimatData = [
  { verbindung: "ein Visum beantragen", bedeutung: "التقدم بطلب للحصول على تأشيرة", synonyme: "ein offizielles Dokument für die Einreise anfordern", beispielText: "„Ich musste mich um ein Visum kümmern...“", beispielNeu: "Bevor ich nach Australien reise, muss ich online ein Visum beantragen." },
  { verbindung: "eine Wohnung auflösen", bedeutung: "تصفية أو إخلاء الشقة", synonyme: "Wohnung leeren und Mietvertrag beenden", beispielText: "„...meine Wohnung auflösen usw.“", beispielNeu: "Weil er ins Ausland geht, muss er nächste Woche seine Wohnung auflösen." },
  { verbindung: "Kontakte knüpfen", bedeutung: "تكوين علاقات / التعرف على أشخاص جدد", synonyme: "neue Leute kennenlernen; ein Netzwerk aufbauen", beispielText: "„...ich habe schnell viele neue Freunde gefunden.“", beispielNeu: "Auf der internationalen Konferenz konnte ich viele nützliche Kontakte knüpfen." },
  { verbindung: "sich verabschieden (von + Dat.)", bedeutung: "توديع (شخص ما)", synonyme: "„Auf Wiedersehen“ sagen, bevor man geht", beispielText: "„Auch der Abschied von Freunden und Familie war natürlich traurig.“", beispielNeu: "Am Flughafen fiel es mir sehr schwer, mich von meiner Familie zu verabschieden." },
  { verbindung: "einen Job kündigen", bedeutung: "الاستقالة من العمل", synonyme: "ein Arbeitsverhältnis offiziell beenden", beispielText: "„...den Job kündigen...“", beispielNeu: "Er hat seinen Job gekündigt, um sich selbstständig zu machen." },
  { verbindung: "ein Konto eröffnen", bedeutung: "فتح حساب بنكي", synonyme: "bei einer Bank ein Bankkonto einrichten", beispielText: "Man muss viele Dinge im neuen Land erledigen.", beispielNeu: "Um mein erstes Gehalt zu bekommen, muss ich sofort ein Konto eröffnen." },
  { verbindung: "sein gewohntes Leben aufgeben", bedeutung: "التخلي عن الحياة المعتادة", synonyme: "den normalen Alltag hinter sich lassen", beispielText: "„Mein gewohntes Leben aufgeben...“", beispielNeu: "Es erfordert viel Mut, sein gewohntes Leben aufzugeben und wegzuziehen." },
  { verbindung: "komplett neu anfangen", bedeutung: "البدء من جديد تماماً", synonyme: "einen völlig neuen Lebensabschnitt beginnen", beispielText: "„...und in einem anderen Land komplett neu anfangen?“", beispielNeu: "Nach der Trennung hat sie in einer anderen Stadt komplett neu angefangen." },
  { verbindung: "etwas wagen", bedeutung: "يجرؤ على شيء / يخاطر", synonyme: "den Mut haben, etwas Riskantes zu tun", beispielText: "„Ich habe es gewagt!“", beispielNeu: "Wer beruflich erfolgreich sein will, muss manchmal auch etwas wagen." },
  { verbindung: "auswandern (nach + Dat.)", bedeutung: "يهاجر", synonyme: "Heimatland verlassen, um in einem anderen Land zu leben", beispielText: "„Ich bin letztes Jahr ziemlich spontan nach Australien ausgewandert.“", beispielNeu: "Viele junge Menschen wandern nach Kanada aus, um dort zu arbeiten." },
  { verbindung: "jemanden zufällig kennenlernen", bedeutung: "التعرف على شخص بالصدفة", synonyme: "eine Person ohne Absicht treffen", beispielText: "„...als ich vor zwei Jahren zufällig diesen netten Typen kennengelernt hatte...“", beispielNeu: "Ich habe meinen heutigen Chef ganz zufällig im Zug kennengelernt." },
  { verbindung: "sich verlieben (in + Akk.)", bedeutung: "يقع في حب (شخص ما)", synonyme: "anfangen, romantische Gefühle zu haben", beispielText: "„...und mich in David verliebt hatte...“", beispielNeu: "Sie hat sich während ihres Sommerurlaubs in ihren Reiseleiter verliebt." },
  { verbindung: "sein Leben komplett ändern", bedeutung: "تغيير حياته بالكامل", synonyme: "das Leben völlig anders gestalten", beispielText: "„...beschloss ich, mein Leben komplett zu ändern...“", beispielNeu: "Nach seiner schweren Krankheit hat er beschlossen, sein Leben komplett zu ändern." },
  { verbindung: "sich kümmern (um + Akk.)", bedeutung: "يعتني بـ / ينجز أمراً", synonyme: "Verantwortung für eine Aufgabe übernehmen", beispielText: "„Ich musste mich um ein Visum kümmern...“", beispielNeu: "Du musst dich rechtzeitig um deine Flugtickets kümmern." },
  { verbindung: "zufrieden sein", bedeutung: "يكون راضياً عن", synonyme: "keine weiteren Wünsche haben, glücklich sein", beispielText: "„In meinem Job war ich eigentlich zufrieden...“", beispielNeu: "Ich bin mit meinen Prüfungsergebnissen in diesem Semester sehr zufrieden." },
  { verbindung: "es fällt schwer / leicht", bedeutung: "يصعب / يسهل على شخص ما", synonyme: "Probleme (oder keine) damit haben, etwas zu tun", beispielText: "„...und es fiel mir nicht leicht zu kündigen.“", beispielNeu: "Es fällt ihm schwer, Deutsch zu lernen, weil die Grammatik kompliziert ist." },
  { verbindung: "sich freuen (auf + Akk.)", bedeutung: "يتطلع إلى / يسعد بـ", synonyme: "Freude empfinden auf ein zukünftiges Ereignis", beispielText: "„...habe ich mich aber auf mein neues Leben gefreut.“", beispielNeu: "Ich freue mich schon riesig auf meinen nächsten Urlaub in Spanien." },
  { verbindung: "eine Arbeitserlaubnis bekommen", bedeutung: "الحصول على تصريح عمل", synonyme: "Genehmigung erhalten, arbeiten zu dürfen", beispielText: "„...und eine Arbeitserlaubnis zu bekommen, war schwieriger...“", beispielNeu: "Ohne eine gültige Arbeitserlaubnis darfst du in Deutschland nicht arbeiten." },
  { verbindung: "Heimweh haben", bedeutung: "الشعور بالحنين إلى الوطن", synonyme: "Traurigkeit, weit weg von der Heimat zu sein", beispielText: "„Ich hatte ziemlich großes Heimweh.“", beispielNeu: "In den ersten Monaten in den USA hatte ich abends oft schreckliches Heimweh." },
  { verbindung: "Zeugnisse übersetzen lassen", bedeutung: "ترجمة الشهادات", synonyme: "Übersetzer beauftragen, Dokumente zu übertragen", beispielText: "„...meine Zeugnisse übersetzen lassen...“", beispielNeu: "Um an der Uni studieren zu können, muss ich meine Zeugnisse übersetzen lassen." },
  { verbindung: "sich streiten (mit + Dat.)", bedeutung: "يتجادل / يتشاجر", synonyme: "einen Konflikt austragen", beispielText: "„Wir haben uns einfach zu oft gestritten.“", beispielNeu: "Meine Nachbarn streiten sich fast jeden Tag lautstark über Kleinigkeiten." },
  { verbindung: "nicht aufgeben", bedeutung: "لا يستسلم", synonyme: "nicht kapitulieren; weiterkämpfen", beispielText: "„Aber ich habe nicht aufgegeben...“", beispielNeu: "Auch wenn du gestern einen Fehler gemacht hast, darfst du heute nicht aufgeben." },
  { verbindung: "eine Entscheidung bereuen", bedeutung: "يندم على قرار", synonyme: "denken, dass eine Entscheidung falsch war", beispielText: "„Meine Entscheidung habe ich nie bereut.“", beispielNeu: "Ich habe meine Entscheidung, Medizin zu studieren, bis heute nie bereut." },
  { verbindung: "die Erfahrung machen", bedeutung: "يمر بتجربة / يكتشف بالتجربة", synonyme: "durch eigenes Erleben etwas feststellen", beispielText: "„Ich habe die Erfahrung gemacht, dass man Zeit braucht...“", beispielNeu: "Ich habe die Erfahrung gemacht, dass man mit Ehrlichkeit am weitesten kommt." },
  { verbindung: "sich einleben (in + Dat.)", bedeutung: "يتأقلم / يندمج", synonyme: "sich an einen neuen Ort gewöhnen", beispielText: "„...um sich in einem fremden Land einzuleben.“", beispielNeu: "Es dauert oft ein paar Monate, bis man sich in einer neuen Stadt richtig eingelebt hat." },
  { verbindung: "den Horizont erweitern", bedeutung: "يوسع آفاقه", synonyme: "seinen Blickwinkel vergrößern", beispielText: "„So eine Auslandserfahrung erweitert einfach den Horizont.“", beispielNeu: "Ein Auslandssemester ist eine großartige Möglichkeit, den Horizont zu erweitern." },
  { verbindung: "viel über sich selbst erfahren", bedeutung: "يكتشف الكثير عن نفسه", synonyme: "eigene Persönlichkeit besser kennenlernen", beispielText: "„...und erfährt dadurch auch viel über sich selbst.“", beispielNeu: "In sehr schwierigen Situationen kann man oft viel über sich selbst erfahren." },
  { verbindung: "gestresst sein", bedeutung: "يكون مرهقاً / تحت ضغط", synonyme: "unter großer Anspannung stehen", beispielText: "„Die Leute sind nicht immer so gestresst...“", beispielNeu: "Vor den Abschlussprüfungen sind die meisten Studenten sehr gestresst." },
  { verbindung: "sehnsüchtig warten (auf + Akk.)", bedeutung: "ينتظر بشوق / بلهفة", synonyme: "mit Vorfreude warten", beispielText: "„Und ich warte seit Monaten sehnsüchtig auf den Besuch...“", beispielNeu: "Die Kinder warten schon sehnsüchtig auf den Beginn der Sommerferien." },
  { verbindung: "sich genau ausdrücken", bedeutung: "يعبر عن نفسه بدقة", synonyme: "präzise formulieren, was man denkt", beispielText: "„...kann ich trotzdem nicht immer ganz genau das ausdrücken...“", beispielNeu: "In einer Fremdsprache ist es manchmal schwer, sich wirklich genau auszudrücken." }
];

const neueHeimatTextRaw = `
<div class="lesetext-title">Mein Glück in der neuen Heimat</div>
<p style="font-size:0.9rem; color:#888; font-style:italic;">geschrieben am 17. Dezember von Ella Australia</p>
<p>Soll ich das wirklich riskieren? <span class="vocab-word" data-meaning="التخلي عن الحياة المعتادة / التنازل عنها">Mein gewohntes Leben aufgeben</span>, <span class="vocab-word" data-meaning="الاستقالة من العمل / فسخ العقد">den Job kündigen</span>, Familie und Freunde verlassen und in einem anderen Land <span class="vocab-word" data-meaning="البدء من جديد تماماً">komplett neu anfangen</span>? Ich habe es <span class="vocab-word" data-meaning="يجرؤ على شيء / يخاطر">gewagt</span>! Ich bin letztes Jahr aus Liebe ziemlich spontan nach Australien <span class="vocab-word" data-meaning="يهاجر">ausgewandert</span>.</p>
<p>Eigentlich bin ich gar kein so besonders abenteuerlicher Typ. Aber als ich vor zwei Jahren <span class="vocab-word" data-meaning="التعرف على شخص بالصدفة" data-group="kennenzufaellig">zufällig</span> diesen netten Typen während meines Urlaubs <span class="vocab-word" data-meaning="التعرف على شخص بالصدفة" data-group="kennenzufaellig">kennengelernt hatte</span> und <span class="vocab-word" data-meaning="يقع في حب (شخص ما)">mich</span> nicht nur in Australien, sondern auch in David <span class="vocab-word" data-meaning="يقع في حب (شخص ما)">verliebt hatte</span>, beschloss ich, <span class="vocab-word" data-meaning="تغيير حياته بالكامل">mein Leben komplett zu ändern</span> und <span class="vocab-word" data-meaning="يهاجر">auszuwandern</span>. Das war ganz schön aufregend. Ich musste so viel erledigen! Ich musste <span class="vocab-word" data-meaning="يعتني بـ / يهتم بـ / ينجز أمراً">mich um</span> ein Visum <span class="vocab-word" data-meaning="يعتني بـ / يهتم بـ / ينجز أمراً">kümmern</span>, meine <span class="vocab-word" data-meaning="ترجمة الشهادات (بواسطة مترجم)">Zeugnisse übersetzen lassen</span>, <span class="vocab-word" data-meaning="تصفية أو إخلاء الشقة">meine Wohnung auflösen</span> usw. In meinem Job war ich eigentlich <span class="vocab-word" data-meaning="يكون راضياً عن">zufrieden</span> und <span class="vocab-word" data-meaning="يصعب / يسهل على شخص ما">es fiel mir nicht leicht</span> zu kündigen. Auch der Abschied von Freunden und Familie war natürlich traurig. Als ich dann sechs Monate nach dem Urlaub wieder aufgeregt im Flugzeug saß, habe ich mich aber auf mein neues Leben <span class="vocab-word" data-meaning="يتطلع إلى / يسعد بـ (شيء في المستقبل)">gefreut</span>.</p>
<p>Der Anfang in einem neuen Land ist allerdings ganz schön schwierig. Ich kannte niemanden außer David, musste mir eine Arbeit suchen und <span class="vocab-word" data-meaning="الحصول على تصريح عمل">eine Arbeitserlaubnis zu bekommen</span>, war schwieriger, als ich gedacht hatte. Ich hatte ziemlich großes <span class="vocab-word" data-meaning="الشعور بالحنين إلى الوطن">Heimweh</span>. Leider war die Beziehung mit David auch ziemlich schnell wieder zu Ende. Wir haben <span class="vocab-word" data-meaning="يتجادل / يتشاجر (مع)">uns</span> einfach zu oft <span class="vocab-word" data-meaning="يتجادل / يتشاجر (مع)">gestritten</span>. Aber ich habe <span class="vocab-word" data-meaning="لا (يستسلم)">nicht aufgegeben</span> und zum Glück irgendwann eine Stelle als Grafikerin in einer großen Agentur gefunden und bei der Wohnungssuche hat mir netterweise ein Bekannter geholfen.</p>
<p><span class="vocab-word" data-meaning="يندم على قرار">Meine Entscheidung habe ich nie bereut</span>. Ich habe <span class="vocab-word" data-meaning="يمر بتجربة أن... / يكتشف بالتجربة أن...">die Erfahrung gemacht, dass</span> man einfach Zeit braucht, um <span class="vocab-word" data-meaning="يتأقلم / يندمج في مكان جديد">sich</span> in einem fremden Land <span class="vocab-word" data-meaning="يتأقلم / يندمج في مكان جديد">einzuleben</span>. Es ist aber ein tolles Gefühl, es zu schaffen. So eine Auslandserfahrung <span class="vocab-word" data-meaning="يوسع آفاقه (مداركه)">erweitert einfach den Horizont</span>. Man lernt die Kultur eines anderen Landes kennen und <span class="vocab-word" data-meaning="يكتشف الكثير عن نفسه">erfährt dadurch auch viel über sich selbst</span> und die eigene Kultur.</p>
<p>Am Anfang hatte ich trotz vieler Jahre Englischunterricht in der Schule Probleme mit der Sprache, aber mittlerweile ist mein Englisch richtig gut. Außerdem ist das Leben hier wirklich angenehm. Das Wetter, das Meer und die Landschaft sind einfach super. Überraschend war für mich, dass das Leben hier lockerer als in Deutschland ist. Die Leute sind nicht immer so <span class="vocab-word" data-meaning="يكون مرهقاً / تحت ضغط كبير">gestresst</span> und ich habe schnell viele neue Freunde gefunden. In Deutschland dauert das ja oft ein bisschen länger ... Natürlich skype ich auch jetzt noch oft stundenlang mit alten Freunden in Deutschland. Aber es ist besser als am Anfang. Da konnte ich oft an nichts anderes denken und habe täglich mehrere SMS und E-Mails nach Deutschland geschickt, jetzt schreibe ich meinen Eltern einmal pro Woche eine längere E-Mail. Es ist nicht immer einfach, so weit weg zu sein. Und ich warte seit Monaten <span class="vocab-word" data-meaning="ينتظر بشوق / بلهفة">sehnsüchtig auf</span> den Besuch meiner besten Freundin. Auch wenn ich wirklich gut Englisch spreche, kann ich trotzdem nicht immer ganz <span class="vocab-word" data-meaning="يعبر عن نفسه بدقة">genau das ausdrücken</span>, was ich denke oder fühle. Da tut es einfach gut, zwischendurch mal in der eigenen Sprache zu sprechen. 🙂</p>
`;

/* ============================================================
   3.5 PRACTICE DATA & LOGIC: NEUE HEIMAT
   ============================================================ */
// TEKAMOLO Sentences (Mobile Drag and Drop)
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
  if(!container) return;
  container.innerHTML = '';
  
  tekamoloData.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'tekamolo-item';
    row.innerHTML = `<p style="font-weight:700; margin-top:0; color:var(--primary-dark);">Satz ${index + 1}:</p>`;
    
    const chipWrapper = document.createElement('div');
    chipWrapper.className = 'tekamolo-chips';
    
    item.parts.forEach((part, i) => {
      const chip = document.createElement('div');
      chip.className = 't-chip';
      chip.textContent = part;
      chipWrapper.appendChild(chip);
    });
    
    enableMobileSortable(chipWrapper);
    
    const checkBtn = document.createElement('button');
    checkBtn.className = 'primary-btn';
    checkBtn.textContent = 'Prüfen';
    
    const resultDiv = document.createElement('div');
    resultDiv.className = 'tekamolo-result';
    
    checkBtn.addEventListener('click', () => {
      const currentOrder = Array.from(chipWrapper.children).filter(c => !c.classList.contains('t-chip-ghost')).map(c => c.textContent);
      if(JSON.stringify(currentOrder) === JSON.stringify(item.correct)) {
        resultDiv.textContent = 'Richtig! 🎉 ' + item.correct.join(' ');
        resultDiv.className = 'tekamolo-result correct';
      } else {
        resultDiv.innerHTML = `Falsch! ❌<br>Korrekt ist:<br><b>${item.correct.join(' ')}</b>`;
        resultDiv.className = 'tekamolo-result wrong';
      }
    });
    
    row.appendChild(chipWrapper);
    row.appendChild(checkBtn);
    row.appendChild(resultDiv);
    container.appendChild(row);
  });
}

function enableMobileSortable(container) {
  let draggingItem = null;
  let ghost = null;
  let startX = 0, startY = 0;
  let initX = 0, initY = 0;

  container.addEventListener('touchstart', handleStart, {passive: false});
  container.addEventListener('mousedown', handleStart);

  function handleStart(e) {
    if(e.target.tagName !== 'DIV' || !e.target.classList.contains('t-chip')) return;
    draggingItem = e.target;
    
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX; startY = touch.clientY;
    
    const rect = draggingItem.getBoundingClientRect();
    initX = rect.left; initY = rect.top;

    ghost = draggingItem.cloneNode(true);
    ghost.classList.add('t-chip-ghost');
    ghost.style.left = initX + 'px';
    ghost.style.top = initY + 'px';
    ghost.style.width = rect.width + 'px';
    
    document.body.appendChild(ghost);
    draggingItem.classList.add('dragging');

    document.addEventListener('touchmove', handleMove, {passive: false});
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
  }

  function handleMove(e) {
    if(!draggingItem) return;
    e.preventDefault(); 
    const touch = e.touches ? e.touches[0] : e;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    ghost.style.left = (initX + dx) + 'px';
    ghost.style.top = (initY + dy) + 'px';

    ghost.style.display = 'none';
    const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    ghost.style.display = 'block';

    if(!elemBelow) return;
    const targetItem = elemBelow.closest('.t-chip');
    if(targetItem && targetItem !== draggingItem && targetItem.parentElement === container && !targetItem.classList.contains('t-chip-ghost')) {
      const rect = targetItem.getBoundingClientRect();
      const next = (touch.clientX - rect.left) / rect.width > 0.5;
      container.insertBefore(draggingItem, next ? targetItem.nextSibling : targetItem);
    }
  }

  function handleEnd() {
    if(!draggingItem) return;
    draggingItem.classList.remove('dragging');
    if(ghost) ghost.remove();
    draggingItem = null; ghost = null;
    
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('touchend', handleEnd);
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
  }
}

// 30 Custom MCQ Questions based on Neue Heimat Data
function buildNeueHeimatMCQ() {
  const container = document.getElementById('nh-mcq-container');
  if(!container) return;
  container.innerHTML = '';
  
  const customMCQs = [
    { s: "Bevor ich nach Australien reise, muss ich online <b>ein Visum beantragen</b>.", correct: "التقدم بطلب للحصول على تأشيرة", w1: "تجديد جواز السفر", w2: "شراء تذكرة طيران" },
    { s: "Weil er ins Ausland geht, muss er nächste Woche <b>seine Wohnung auflösen</b>.", correct: "تصفية أو إخلاء الشقة", w1: "تنظيف الشقة", w2: "تأجير الشقة" },
    { s: "Auf der internationalen Konferenz konnte ich viele nützliche <b>Kontakte knüpfen</b>.", correct: "تكوين علاقات / التعرف على أشخاص جدد", w1: "إنهاء العلاقات", w2: "تجنب التحدث مع الناس" },
    { s: "Am Flughafen fiel es mir sehr schwer, <b>mich</b> von meiner Familie <b>zu verabschieden</b>.", correct: "توديع (شخص ما)", w1: "استقبال (شخص ما)", w2: "الانتظار مع" },
    { s: "Er hat <b>seinen Job gekündigt</b>, um sich selbstständig zu machen.", correct: "الاستقالة من العمل", w1: "البحث عن عمل", w2: "الترقية في العمل" },
    { s: "Um mein erstes Gehalt zu bekommen, muss ich sofort <b>ein Konto eröffnen</b>.", correct: "فتح حساب بنكي", w1: "سحب أموال", w2: "إغلاق الحساب" },
    { s: "Es erfordert viel Mut, <b>sein gewohntes Leben aufzugeben</b> und wegzuziehen.", correct: "التخلي عن الحياة المعتادة", w1: "الحفاظ على الروتين", w2: "الاستمتاع بالحياة" },
    { s: "Nach der Trennung hat sie in einer anderen Stadt <b>komplett neu angefangen</b>.", correct: "البدء من جديد تماماً", w1: "العودة للماضي", w2: "التفكير في المستقبل" },
    { s: "Wer beruflich erfolgreich sein will, muss manchmal auch <b>etwas wagen</b>.", correct: "يجرؤ على شيء / يخاطر", w1: "يتجنب المخاطر", w2: "يعمل بهدوء" },
    { s: "Viele junge Menschen <b>wandern</b> nach Kanada <b>aus</b>, um dort zu arbeiten.", correct: "يهاجر", w1: "يسافر للسياحة", w2: "يعود إلى وطنه" },
    { s: "Ich habe meinen heutigen Chef ganz <b>zufällig kennengelernt</b>.", correct: "التعرف على شخص بالصدفة", w1: "التعرف بشكل رسمي", w2: "تجاهل شخص ما" },
    { s: "Sie hat <b>sich</b> während ihres Sommerurlaubs in ihren Reiseleiter <b>verliebt</b>.", correct: "يقع في حب (شخص ما)", w1: "يتشاجر مع", w2: "ينسى" },
    { s: "Nach seiner schweren Krankheit hat er beschlossen, <b>sein Leben komplett zu ändern</b>.", correct: "تغيير حياته بالكامل", w1: "الحفاظ على صحته", w2: "العمل بجد" },
    { s: "Du musst <b>dich</b> rechtzeitig <b>um</b> deine Flugtickets <b>kümmern</b>.", correct: "يعتني بـ / ينجز أمراً", w1: "ينسى", w2: "يتجاهل" },
    { s: "Ich bin mit meinen Prüfungsergebnissen in diesem Semester sehr <b>zufrieden</b>.", correct: "يكون راضياً عن", w1: "غاضب من", w2: "حزين بسبب" },
    { s: "Es <b>fällt</b> ihm <b>schwer</b>, Deutsch zu lernen, weil die Grammatik kompliziert ist.", correct: "يصعب على شخص ما", w1: "يسهل على شخص ما", w2: "لا يهتم بـ" },
    { s: "Ich <b>freue mich</b> schon riesig <b>auf</b> meinen nächsten Urlaub in Spanien.", correct: "يتطلع إلى / يسعد بـ", w1: "يخاف من", w2: "ينسى" },
    { s: "Ich muss noch <b>eine Arbeitserlaubnis bekommen</b>, bevor ich starte.", correct: "الحصول على تصريح عمل", w1: "الحصول على إجازة", w2: "دفع الضرائب" },
    { s: "In den ersten Monaten in den USA hatte ich abends oft schreckliches <b>Heimweh</b>.", correct: "الشعور بالحنين إلى الوطن", w1: "الشعور بالسعادة", w2: "الرغبة في السفر" },
    { s: "Um an der Uni studieren zu können, muss ich meine <b>Zeugnisse übersetzen lassen</b>.", correct: "ترجمة الشهادات", w1: "تصديق الشهادات", w2: "نسخ الشهادات" },
    { s: "Meine Nachbarn <b>streiten sich</b> fast jeden Tag lautstark über Kleinigkeiten.", correct: "يتجادل / يتشاجر", w1: "يتصالح", w2: "يضحك بصوت عالٍ" },
    { s: "Auch wenn du gestern einen Fehler gemacht hast, darfst du heute <b>nicht aufgeben</b>.", correct: "لا يستسلم", w1: "يتوقف عن العمل", w2: "يستريح طويلاً" },
    { s: "Ich habe <b>meine Entscheidung</b>, Medizin zu studieren, bis heute nie <b>bereut</b>.", correct: "يندم على قرار", w1: "يفرح بالقرار", w2: "يؤجل القرار" },
    { s: "Ich habe <b>die Erfahrung gemacht</b>, dass man mit Ehrlichkeit am weitesten kommt.", correct: "يمر بتجربة / يكتشف بالتجربة", w1: "ينسى ما حدث", w2: "يتجاهل النصيحة" },
    { s: "Es dauert oft ein paar Monate, bis man <b>sich</b> in einer neuen Stadt richtig <b>eingelebt hat</b>.", correct: "يتأقلم / يندمج", w1: "يشعر بالملل", w2: "يضيع في الزحام" },
    { s: "Ein Auslandssemester ist eine großartige Möglichkeit, den eigenen <b>Horizont zu erweitern</b>.", correct: "يوسع آفاقه", w1: "يضيق تفكيره", w2: "يتوقف عن التعلم" },
    { s: "In sehr schwierigen Situationen kann man oft <b>viel über sich selbst erfahren</b>.", correct: "يكتشف الكثير عن نفسه", w1: "ينسى هويته", w2: "يتجاهل مشاعره" },
    { s: "Vor den Abschlussprüfungen sind die meisten Studenten sehr <b>gestresst</b>.", correct: "يكون مرهقاً / تحت ضغط", w1: "يكون هادئاً", w2: "يكون سعيداً" },
    { s: "Die Kinder <b>warten</b> schon <b>sehnsüchtig auf</b> den Beginn der Sommerferien.", correct: "ينتظر بشوق / بلهفة", w1: "ينسى الموعد", w2: "يتجاهل الحدث" },
    { s: "In einer Fremdsprache ist es manchmal schwer, <b>sich</b> wirklich <b>genau auszudrücken</b>.", correct: "يعبر عن نفسه بدقة", w1: "يتحدث بصوت عالٍ", w2: "يكتب بسرعة" }
  ];

  const shuffledQuestions = shuffle(customMCQs);
  
  shuffledQuestions.forEach((q, qIndex) => {
    const options = shuffle([{t: q.correct, c: true}, {t: q.w1, c: false}, {t: q.w2, c: false}]);
    
    const item = document.createElement('div');
    item.className = 'mcq-item';
    
    item.innerHTML = `
      <div class="mcq-question" style="direction:ltr; text-align:left;">
        ${qIndex + 1}. Was bedeutet der markierte Ausdruck?<br>
        <span style="font-weight:500; font-style:italic; color:var(--primary-dark); display:inline-block; margin-top:8px;">"${q.s}"</span>
      </div>
      <div class="mcq-options"></div>
    `;
    
    const optionsWrap = item.querySelector('.mcq-options');
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'mcq-option'; 
      btn.textContent = opt.t;
      
      btn.addEventListener('click', () => {
        const allBtns = optionsWrap.querySelectorAll('.mcq-option');
        allBtns.forEach(b => b.classList.add('disabled'));
        if(opt.c){ btn.classList.add('correct'); } 
        else {
          btn.classList.add('wrong');
          allBtns.forEach(b => { if(b.textContent === q.correct) b.classList.add('correct'); });
        }
      });
      optionsWrap.appendChild(btn);
    });
    container.appendChild(item);
  });
}

/* ============================================================
   4. DATA: KRACH IN DER W.G
   ============================================================ */
const krachData = [
  { verbindung: "die WG (Wohngemeinschaft)", bedeutung: "سكن مشترك", synonyme: "die Wohngemeinschaft", beispielText: "„Anne und Elias wohnen seit Kurzem zusammen in einer WG.“", beispielNeu: "Während des Studiums ist es günstiger, in einer WG zu leben." },
  { verbindung: "sich verstehen", bedeutung: "يتفاهم / ينسجم", synonyme: "klarkommen, harmonieren", beispielText: "„Sie verstehen sich eigentlich ganz gut...“", beispielNeu: "Meine Schwester und ich verstehen uns blind." },
  { verbindung: "es kommt zum Streit", bedeutung: "ينشب شجار", synonyme: "sich streiten, aneinandergeraten", beispielText: "„...doch immer wieder kommt es zwischen den beiden zum Streit...“", beispielNeu: "Wegen Kleinigkeiten kommt es oft zum Streit." },
  { verbindung: "was ... betrifft", bedeutung: "فيما يتعلق بـ", synonyme: "bezüglich, hinsichtlich", beispielText: "„...was die Aufgabenverteilung im Haushalt betrifft.“", beispielNeu: "Was das Wetter betrifft, haben wir heute wirklich Glück." },
  { verbindung: "die Aufgabenverteilung", bedeutung: "توزيع المهام", synonyme: "die Arbeitsteilung", beispielText: "„...was die Aufgabenverteilung im Haushalt betrifft.“", beispielNeu: "Eine gerechte Aufgabenverteilung ist wichtig für den Frieden." },
  { verbindung: "wegräumen", bedeutung: "يزيل / يرفع (الأشياء)", synonyme: "aufräumen, beseitigen", beispielText: "„Aber den ganzen Dreck räumst du dieses Mal alleine weg.“", beispielNeu: "Kannst du bitte deine Schuhe aus dem Flur wegräumen?" },
  { verbindung: "nicht einsehen", bedeutung: "لا يقتنع / لا يرى مبرراً", synonyme: "nicht akzeptieren, ablehnen", beispielText: "„Ich sehe gar nicht ein, dass du hier ständig Party machst...“", beispielNeu: "Er sieht nicht ein, dass er sich entschuldigen muss." },
  { verbindung: "runterkommen", bedeutung: "يهدأ (لغة دارجة)", synonyme: "sich beruhigen, entspannen", beispielText: "„Jetzt komm mal wieder runter!“", beispielNeu: "Du bist viel zu gestresst, du musst mal runterkommen." },
  { verbindung: "sich kümmern um", bedeutung: "يعتني بـ / يهتم بـ", synonyme: "sorgen für, übernehmen", beispielText: "„Sonst hätte ich mich rechtzeitig darum gekümmert...“", beispielNeu: "Ich kümmere mich morgen um die Tickets." },
  { verbindung: "rechtzeitig", bedeutung: "في الوقت المناسب", synonyme: "pünktlich, frühzeitig", beispielText: "„Sonst hätte ich mich rechtzeitig darum gekümmert...“", beispielNeu: "Wir müssen rechtzeitig am Bahnhof sein." },
  { verbindung: "Chaos herrschen", bedeutung: "تسود الفوضى", synonyme: "unordentlich sein", beispielText: "„Das ist ja nicht das erste Mal, dass hier so ein Chaos herrscht.“", beispielNeu: "Nach der Party herrschte im Wohnzimmer das pure Chaos." },
  { verbindung: "etwas satt haben", bedeutung: "يسأم / يضيق ذرعاً بـ", synonyme: "die Nase voll haben", beispielText: "„Ich habe das jetzt wirklich satt...“", beispielNeu: "Ich habe dieses kalte Wetter langsam satt." },
  { verbindung: "unbedingt", bedeutung: "ضروري / حتماً", synonyme: "absolut, auf jeden Fall", beispielText: "„...wir müssen unbedingt mal reden.“", beispielNeu: "Ich muss dir unbedingt etwas Wichtiges erzählen." },
  { verbindung: "Das ist nicht dein Ernst!", bedeutung: "هل تمزح! / لا يمكن أن تكون جاداً!", synonyme: "Machst du Witze?, Das darf nicht wahr sein!", beispielText: "„Das ist jetzt echt nicht dein Ernst:“", beispielNeu: "Du hast den Zug verpasst? Das ist nicht dein Ernst!" },
  { verbindung: "zu weit gehen", bedeutung: "يتمادى / يتجاوز الحدود", synonyme: "maßlos sein, den Bogen überspannen", beispielText: "„Jetzt bist du echt zu weit gegangen.“", beispielNeu: "Mit dieser Bemerkung bist du eindeutig zu weit gegangen." },
  { verbindung: "die Privatsphäre", bedeutung: "الخصوصية", synonyme: "der persönliche Raum", beispielText: "„Mein Bett, das ist meine absolute Privatsphäre...“", beispielNeu: "Man sollte die Privatsphäre anderer Menschen respektieren." },
  { verbindung: "nichts zu suchen haben", bedeutung: "لا شأن له هنا / ليس مكانه", synonyme: "unerwünscht sein", beispielText: "„Da hat niemand was drin zu suchen...“", beispielNeu: "Du hast in meinem Zimmer nichts zu suchen!" },
  { verbindung: "ein für alle Mal", bedeutung: "مرة واحدة وإلى الأبد", synonyme: "endgültig, definitiv", beispielText: "„Ich möchte, dass wir jetzt ein für alle Mal ein paar Dinge klären.“", beispielNeu: "Wir müssen dieses Problem ein für alle Mal lösen." },
  { verbindung: "klären", bedeutung: "يوضح / يسوي (خلافاً)", synonyme: "lösen, bereinigen, besprechen", beispielText: "„...ein für alle Mal ein paar Dinge klären.“", beispielNeu: "Wir sollten das Missverständnis schnell klären." },
  { verbindung: "ein Drama aus etwas machen", bedeutung: "يهول الأمر / يخلق دراما", synonyme: "übertreiben, aufbauschen", beispielText: "„Aber bitte mach nicht so ein Drama daraus.“", beispielNeu: "Es war nur ein kleiner Fehler, mach kein Drama daraus!" },
  { verbindung: "tabu sein / bleiben", bedeutung: "محظور / ممنوع المساس به", synonyme: "verboten, unantastbar", beispielText: "„Mein Zimmer bleibt tabu.“", beispielNeu: "Das Thema Gehalt ist in dieser Firma tabu." },
  { verbindung: "jemanden erwischen bei", bedeutung: "يضبط شخصاً متلبساً", synonyme: "ertappen", beispielText: "„Wenn ich dich noch einmal dabei erwische, dass du...“", beispielNeu: "Der Lehrer hat ihn beim Schummeln erwischt." },
  { verbindung: "ausziehen", bedeutung: "يرحل عن المنزل / ينتقل", synonyme: "umziehen, die Wohnung verlassen", beispielText: "„...dann ziehe ich aus.“", beispielNeu: "Sie wird nächsten Monat aus der gemeinsamen Wohnung ausziehen." },
  { verbindung: "nachvollziehen", bedeutung: "يستوعب / يتفهم", synonyme: "verstehen, begreifen", beispielText: "„Ich verstehe überhaupt nicht, warum du das nicht nachvollziehen kannst.“", beispielNeu: "Ich kann deine Entscheidung gut nachvollziehen." },
  { verbindung: "übertreiben", bedeutung: "يبالغ", synonyme: "aufbauschen, zu weit gehen", beispielText: "„Ich finde, du übertreibst da wirklich...“", beispielNeu: "Er übertreibt immer, wenn er von seinen Krankheiten erzählt." },
  { verbindung: "sich halten an", bedeutung: "يلتزم بـ", synonyme: "befolgen, respektieren", beispielText: "„...dann halte ich mich in Zukunft daran.“", beispielNeu: "Alle Mitarbeiter müssen sich an die Sicherheitsregeln halten." },
  { verbindung: "gnädig", bedeutung: "رؤوف / متكرم", synonyme: "barmherzig, wohlwollend", beispielText: "„Das ist aber äußerst gnädig von dir...“", beispielNeu: "Der Richter war sehr gnädig und verhängte nur eine milde Strafe." },
  { verbindung: "sich zurückhalten", bedeutung: "يتراجع / يحجم عن", synonyme: "passiv bleiben, zögern", beispielText: "„...da hältst du dich immer schön zurück.“", beispielNeu: "Bei der Diskussion über Politik halte ich mich lieber zurück." },
  { verbindung: "in Gesellschaft", bedeutung: "في صُحبة / مع الآخرين", synonyme: "gemeinsam, mit anderen", beispielText: "„Du sagst doch immer, dass du gern in Gesellschaft isst...“", beispielNeu: "Ich fühle mich in Gesellschaft meiner Freunde sehr wohl." },
  { verbindung: "jemandem einen Vorwurf machen", bedeutung: "يلوم / يوجه عتاباً", synonyme: "beschuldigen, tadeln", beispielText: "„Und jetzt machst du mir daraus einen Vorwurf!“", beispielNeu: "Du kannst ihr keinen Vorwurf machen, sie wusste es nicht besser." },
  { verbindung: "unfair", bedeutung: "غير عادل / غير منصف", synonyme: "ungerecht", beispielText: "„Das ist so was von unfair!“", beispielNeu: "Es ist unfair, dass er mehr Geld bekommt als ich." },
  { verbindung: "selbstverständlich", bedeutung: "بديهي / غني عن البيان", synonyme: "natürlich, logisch, klar", beispielText: "„...aber findest du es nicht selbstverständlich, dass du...“", beispielNeu: "Es ist für mich selbstverständlich, dass ich dir bei dem Umzug helfe." },
  { verbindung: "beitragen zu", bedeutung: "يساهم في", synonyme: "mitwirken, sich beteiligen", beispielText: "„...dass du auch in irgendeiner Form etwas zu unserem WG-Leben beiträgst?“", beispielNeu: "Jeder kann etwas zum Umweltschutz beitragen." },
  { verbindung: "sorgen für", bedeutung: "يتكفل بـ / يعتني بـ", synonyme: "kümmern um, gewährleisten", beispielText: "„Ich sorge für unsere – und deine – sozialen Kontakte.“", beispielNeu: "Der Gastgeber sorgte für ausreichend Getränke." },
  { verbindung: "sich vergraben", bedeutung: "يعزل نفسه / يدفن نفسه", synonyme: "sich isolieren, sich zurückziehen", beispielText: "„...würdest du dich doch nur noch in deinem Zimmer vergraben und lernen.“", beispielNeu: "Nach der Trennung hat sie sich wochenlang zu Hause vergraben." },
  { verbindung: "im Augenblick", bedeutung: "في هذه اللحظة / حالياً", synonyme: "momentan, gerade, zurzeit", beispielText: "„Das wäre mir im Augenblick auch lieber.“", beispielNeu: "Im Augenblick habe ich leider sehr viel Stress im Büro." },
  { verbindung: "sich einigen auf", bedeutung: "يتفق على", synonyme: "einen Konsens finden, übereinkommen", beispielText: "„Wir können uns ja zumindest auf einen Kompromiss einigen:“", beispielNeu: "Wir konnten uns schließlich auf einen Preis einigen." },
  { verbindung: "der Kompromiss", bedeutung: "حل وسط / تسوية", synonyme: "die Einigung, die Lösung", beispielText: "„Wir können uns ja zumindest auf einen Kompromiss einigen:“", beispielNeu: "Bei einer Verhandlung muss man oft Kompromisse schließen." },
  { verbindung: "jemandem etwas erlassen", bedeutung: "يعفي شخصاً من شيء", synonyme: "befreien von, streichen", beispielText: "„Dafür erlasse ich dir auch das Kochen.“", beispielNeu: "Aus Kulanz hat der Vermieter uns die letzte Miete erlassen." },
  { verbindung: "Verantwortung übernehmen", bedeutung: "يتحمل المسؤولية", synonyme: "zuständig sein, haften", beispielText: "„Irgendeine feste Aufgabe im Haushalt musst du jetzt schon mal übernehmen.“", beispielNeu: "Der Projektleiter übernimmt die Verantwortung für das Team." }
];

const krachTextRaw = `
<div class="dialogue-intro"><p>Anne und Elias wohnen seit Kurzem zusammen in einer <span class="vocab-word" data-meaning="سكن مشترك">WG</span>. Sie <span class="vocab-word" data-meaning="يتفاهم / ينسجم">verstehen sich</span> eigentlich ganz gut, doch immer wieder <span class="vocab-word" data-meaning="ينشب شجار" data-group="streit">kommt es</span> zwischen den beiden <span class="vocab-word" data-meaning="ينشب شجار" data-group="streit">zum Streit</span>, <span class="vocab-word" data-meaning="فيما يتعلق بـ" data-group="betrifft">was</span> die <span class="vocab-word" data-meaning="توزيع المهام">Aufgabenverteilung</span> im Haushalt <span class="vocab-word" data-meaning="فيما يتعلق بـ" data-group="betrifft">betrifft</span>.</p></div>
<div class="dialogue">
  <div class="msg"><span class="speaker elias">Elias</span> <span class="text">Wie sieht’s denn hier aus? Anne, wo bist du, verdammt noch mal!</span></div>
  <div class="msg"><span class="speaker anne">Anne</span> <span class="text">Hey, Elias! Ich dachte, du kommst erst morgen zurück. Sorry, wir haben hier ein bisschen gefeiert.</span></div>
  <div class="msg"><span class="speaker elias">Elias</span> <span class="text">Ja, das sehe ich. Aber den ganzen Dreck <span class="vocab-word" data-meaning="يزيل / يرفع (الأشياء)" data-group="wegraeumen">räumst</span> du dieses Mal alleine <span class="vocab-word" data-meaning="يزيل / يرفع (الأشياء)" data-group="wegraeumen">weg</span>. Ich <span class="vocab-word" data-meaning="لا يقتنع / لا يرى مبرراً">sehe gar nicht ein</span>, dass du hier ständig Party machst – und aufräumen muss ich dann!</span></div>
  <div class="msg"><span class="speaker anne">Anne</span> <span class="text">Jetzt <span class="vocab-word" data-meaning="يهدأ (لغة دارجة)" data-group="runterkommen">komm</span> mal wieder <span class="vocab-word" data-meaning="يهدأ (لغة دارجة)" data-group="runterkommen">runter</span>! Ich wusste ja nicht, dass du heute schon zurückkommst. Sonst hätte ich mich <span class="vocab-word" data-meaning="في الوقت المناسب">rechtzeitig</span> darum <span class="vocab-word" data-meaning="يعتني بـ / يهتم بـ">gekümmert</span> ...</span></div>
  <div class="msg"><span class="speaker elias">Elias</span> <span class="text">Das glaubst du ja selbst nicht. Das ist ja nicht das erste Mal, dass hier so ein <span class="vocab-word" data-meaning="تسود الفوضى">Chaos herrscht</span>. Ich habe das jetzt wirklich <span class="vocab-word" data-meaning="يسأم / يضيق ذرعاً بـ">satt</span> – wir müssen <span class="vocab-word" data-meaning="ضروري / حتماً">unbedingt</span> mal reden. <br><span class="vocab-word" data-meaning="هل تمزح! / لا يمكن أن تكون جاداً!">Das ist jetzt echt nicht dein Ernst</span>: Hat etwa jemand von deinen Typen in meinem Bett geschlafen?</span></div>
  <div class="msg"><span class="speaker anne">Anne</span> <span class="text">Entschuldige, ich hätte dich vorher fragen sollen ...</span></div>
  <div class="msg"><span class="speaker elias">Elias</span> <span class="text">Jetzt bist du echt <span class="vocab-word" data-meaning="يتمادى / يتجاوز الحدود">zu weit gegangen</span>. Mein Bett, das ist meine absolute <span class="vocab-word" data-meaning="الخصوصية">Privatsphäre</span> – und das weißt du auch! Da hat niemand was drin <span class="vocab-word" data-meaning="لا شأن له هنا / ليس مكانه">zu suchen</span>, und schon gar nicht ein Fremder.</span></div>
  <div class="msg"><span class="speaker anne">Anne</span> <span class="text">Aber das ist doch kein Fremder gewesen, das war doch Jonas, du weißt schon, der ...</span></div>
  <div class="msg"><span class="speaker elias">Elias</span> <span class="text">Hey, das interessiert mich überhaupt nicht, wer das war. Ich möchte, dass wir jetzt <span class="vocab-word" data-meaning="مرة واحدة وإلى الأبد">ein für alle Mal</span> ein paar Dinge <span class="vocab-word" data-meaning="يوضح / يسوي (خلافاً)">klären</span>.</span></div>
  <div class="msg"><span class="speaker anne">Anne</span> <span class="text">Ist ja schon gut ... Aber bitte mach nicht so ein <span class="vocab-word" data-meaning="يهول الأمر / يخلق دراما">Drama daraus</span>.</span></div>
  <div class="msg"><span class="speaker elias">Elias</span> <span class="text">Also erstens: Mein Zimmer bleibt <span class="vocab-word" data-meaning="محظور / ممنوع المساس به">tabu</span>. Für dich und für alle anderen. Wenn ich dich noch einmal dabei <span class="vocab-word" data-meaning="يضبط شخصاً متلبساً">erwische</span>, dass du jemandem erlaubst, in meinem Bett zu übernachten, dann <span class="vocab-word" data-meaning="يرحل عن المنزل / ينتقل" data-group="ausziehen">ziehe</span> ich <span class="vocab-word" data-meaning="يرحل عن المنزل / ينتقل" data-group="ausziehen">aus</span>. Das ist echt so was von eklig! Ich verstehe überhaupt nicht, warum du das nicht <span class="vocab-word" data-meaning="يستوعب / يتفهم">nachvollziehen</span> kannst.</span></div>
  <div class="msg"><span class="speaker anne">Anne</span> <span class="text">Du kannst doch einfach die Bettwäsche wechseln und fertig! Ich kapier' echt nicht, wo da das Problem ist. Ich finde, du <span class="vocab-word" data-meaning="يبالغ">übertreibst</span> da wirklich mit deiner Hygienemanie. Aber, na bitte, wenn es für dich so wichtig ist, dann <span class="vocab-word" data-meaning="يلتزم بـ" data-group="halten_an">halte</span> ich mich in Zukunft <span class="vocab-word" data-meaning="يلتزم بـ" data-group="halten_an">daran</span>.</span></div>
  <div class="msg"><span class="speaker elias">Elias</span> <span class="text">Das ist aber äußerst <span class="vocab-word" data-meaning="رؤوف / متكرم">gnädig</span> von dir ... Zweitens: Wann hast du eigentlich zum letzten Mal eingekauft? Beim Essen bist du gleich dabei, aber wenn es ums Einkaufen und Kochen geht, da <span class="vocab-word" data-meaning="يتراجع / يحجم عن" data-group="zurueckhalten">hältst</span> du dich immer schön <span class="vocab-word" data-meaning="يتراجع / يحجم عن" data-group="zurueckhalten">zurück</span>.</span></div>
  <div class="msg"><span class="speaker anne">Anne</span> <span class="text">Das ist aber jetzt echt gemein von dir! Du sagst doch immer, dass du gern <span class="vocab-word" data-meaning="في صُحبة / مع الآخرين">in Gesellschaft</span> isst und gern für andere kochst. Und jetzt machst du mir daraus einen <span class="vocab-word" data-meaning="يلوم / يوجه عتاباً">Vorwurf</span>! Das ist so was von <span class="vocab-word" data-meaning="غير عادل / غير منصف">unfair</span>!</span></div>
  <div class="msg"><span class="speaker elias">Elias</span> <span class="text">Ich koche auch gern für dich, aber findest du es nicht <span class="vocab-word" data-meaning="بديهي / غني عن البيان">selbstverständlich</span>, dass du auch in irgendeiner Form etwas zu unserem WG-Leben <span class="vocab-word" data-meaning="يساهم في">beiträgst</span>?</span></div>
  <div class="msg"><span class="speaker anne">Anne</span> <span class="text">Das tue ich doch. Ich <span class="vocab-word" data-meaning="يتكفل بـ / يعتني بـ">sorge für</span> unsere – und deine – sozialen Kontakte. Wenn du mich nicht hättest, würdest du dich doch nur noch in deinem Zimmer <span class="vocab-word" data-meaning="يعزل نفسه / يدفن نفسه">vergraben</span> und lernen.</span></div>
  <div class="msg"><span class="speaker elias">Elias</span> <span class="text">Das wäre mir <span class="vocab-word" data-meaning="في هذه اللحظة / حالياً">im Augenblick</span> auch lieber. Wir können uns ja zumindest auf einen <span class="vocab-word" data-meaning="حل وسط / تسوية">Kompromiss</span> <span class="vocab-word" data-meaning="يتفق على">einigen</span>: Du bringst ein paar Leute weniger mit nach Hause und nutzt die gewonnene Zeit dafür, ab und zu mal das Bad zu putzen. Dafür <span class="vocab-word" data-meaning="يعفي شخصاً من شيء">erlasse</span> ich dir auch das Kochen.</span></div>
  <div class="msg"><span class="speaker anne">Anne</span> <span class="text">Und das Abwaschen auch?</span></div>
  <div class="msg"><span class="speaker elias">Elias</span> <span class="text">Wir sind doch hier nicht auf dem Basar! Irgendeine feste Aufgabe im Haushalt musst du jetzt schon mal <span class="vocab-word" data-meaning="يتحمل المسؤولية">übernehmen</span>. Irgendetwas, wofür nur du verantwortlich bist. Such dir was aus ...</span></div>
  <div class="msg"><span class="speaker anne">Anne</span> <span class="text">Okay. Dann übernehme ich das Einkaufen und das Geschirrabwaschen. Und das Bad putzt jeder abwechselnd. Aber jetzt sei mir bitte nicht mehr böse. Ich freu mich so, dass du wieder zurück bist. Ich habe dir so viel zu erzählen, von der Party gestern: Da war so ein toller Typ, du weißt schon, der Bruder von Hannes ...</span></div>
</div>
`;

/* ============================================================
   5. TOOLTIP LOGIC (Robust for Mobile / Touch)
   ============================================================ */
function setupTooltips() {
  const tooltip = document.getElementById('custom-tooltip');
  
  document.addEventListener('click', (e) => {
    const word = e.target.closest('.vocab-word');
    const isTooltipClick = e.target.closest('#custom-tooltip');
    
    document.querySelectorAll('.vocab-word.active-link').forEach(el => {
      if(el !== word) el.classList.remove('active-link');
    });

    if (word) {
      const groupId = word.dataset.group;
      if (groupId) { 
        document.querySelectorAll(`.vocab-word[data-group="${groupId}"]`).forEach(el => el.classList.add('active-link')); 
      } else { 
        word.classList.add('active-link'); 
      }
      
      tooltip.innerHTML = word.dataset.meaning.replace(/\n/g, '<br>');
      tooltip.classList.remove('hidden');
      
      const rect = word.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.top = `${rect.top + window.scrollY - 10}px`;
    } else if (!isTooltipClick) {
      tooltip.classList.add('hidden');
    }
  });

  window.addEventListener('scroll', () => { tooltip.classList.add('hidden'); });
}
