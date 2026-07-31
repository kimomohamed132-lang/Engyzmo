/* ============================================================
   0. SPLASH SCREEN (شاشة البداية)
   ============================================================ */
window.addEventListener('load', () => {
  const splash = document.getElementById('splash-screen');
  
  // تأخير لمدة 2.5 ثانية (2500 ملي ثانية) ثم إخفاء الشاشة
  setTimeout(() => {
    splash.classList.add('hidden');
    
    // إزالة العنصر تماماً من الـ HTML بعد انتهاء أنيميشن الاختفاء (لتخفيف الصفحة)
    setTimeout(() => {
      splash.remove();
    }, 600);
    
  }, 2500); 
});
/* ============================================================
   1. DATA
   ============================================================ */
const vocabData = [
  { verbindung: "sich ausruhen (von + Dat.)", bedeutungDe: "sich entspannen, pausieren", bedeutung: "يستريح من", beispiel: "Am Wochenende wird lange geschlafen, um sich von der anstrengenden Arbeitswoche auszuruhen." },
  { verbindung: "einen Ausgleich finden (zu + Dat.)", bedeutungDe: "eine Balance finden", bedeutung: "يجد توازناً / متنفساً لـ", beispiel: "Das ist ein Hobby, das mir hilft, einen Ausgleich zum Stress zu finden." },
  { verbindung: "zur Ruhe kommen", bedeutungDe: "ruhig werden, entspannen", bedeutung: "يهدأ / يرتاح", beispiel: "Ich höre abends gerne Musik, damit ich nach der Arbeit endlich zur Ruhe komme." },
  { verbindung: "die Seele baumeln lassen", bedeutungDe: "sich völlig entspannen", bedeutung: "يريح أعصابه / يسترخي تماماً", beispiel: "Ich fahre oft ans Meer, um einfach mal die Seele baumeln zu lassen." },
  { verbindung: "Abstand gewinnen (von + Dat.)", bedeutungDe: "sich distanzieren von", bedeutung: "يبتعد عن (الضغوط) / يفصل نفسه", beispiel: "Der Urlaub wird von vielen genutzt, um Abstand vom Alltag zu gewinnen." },
  { verbindung: "sich entspannen", bedeutungDe: "relaxen, ausruhen", bedeutung: "يسترخي", beispiel: "Ein gutes Buch wird oft gelesen, damit man sich auf dem Sofa entspannen kann." },
  { verbindung: "den Kopf frei bekommen", bedeutungDe: "klare Gedanken fassen", bedeutung: "يصفي ذهنه", beispiel: "Ich gehe nach einem langen Tag joggen, um den Kopf frei zu bekommen." },
  { verbindung: "sich erholen (von + Dat.)", bedeutungDe: "neue Kraft sammeln", bedeutung: "يتعافى / يستجم (من)", beispiel: "Der Sonntag ist da, damit wir uns von unseren Pflichten erholen." },
  { verbindung: "abschalten (können)", bedeutungDe: "aufhören an Arbeit zu denken", bedeutung: "يفصل ذهنياً / يتوقف عن التفكير", beispiel: "Spaziergänge, die im Wald gemacht werden, helfen mir beim Abschalten." },
  { verbindung: "auf andere Gedanken kommen", bedeutungDe: "sich ablenken", bedeutung: "يغير جو / يجدد أفكاره", beispiel: "Ich treffe meine Freunde, um bei Problemen auf andere Gedanken zu kommen." },
  { verbindung: "einem Hobby nachgehen", bedeutungDe: "ein Hobby ausüben", bedeutung: "يمارس هواية", beispiel: "Es ist wichtig, einem Hobby nachzugehen, das einem wirklich Spaß macht." },
  { verbindung: "Sport treiben", bedeutungDe: "sich sportlich betätigen", bedeutung: "يمارس الرياضة", beispiel: "Es muss regelmäßig Sport getrieben werden, damit der Körper gesund bleibt." },
  { verbindung: "die Freizeit gestalten", bedeutungDe: "freie Zeit planen", bedeutung: "ينظم / يقضي وقت الفراغ", beispiel: "Es gibt viele tolle Möglichkeiten, wie die Freizeit kreativ gestaltet werden kann." },
  { verbindung: "an einem Kurs teilnehmen", bedeutungDe: "einen Kurs besuchen", bedeutung: "يشارك في دورة / كورس", beispiel: "Ich nehme an einem Sprachkurs teil, der von der Schule organisiert wird." },
  { verbindung: "einen Ausflug machen", bedeutungDe: "verreisen (kurz)", bedeutung: "يقوم بنزهة / رحلة قصيرة", beispiel: "Wir machen am Samstag einen Ausflug, um die schöne Natur zu genießen." },
  { verbindung: "etwas Spannendes unternehmen", bedeutungDe: "etwas Interessantes machen", bedeutung: "يقوم بشيء مشوق / ممتع", beispiel: "Am Wochenende wird oft etwas Spannendes unternommen, damit keine Langeweile aufkommt." },
  { verbindung: "Zeit verbringen (mit + Dat.)", bedeutungDe: "Zeit nutzen mit", bedeutung: "يقضي وقتاً (مع)", beispiel: "Das ist das Spiel, mit dem wir am liebsten unsere Zeit verbringen." },
  { verbindung: "sich die Zeit vertreiben (mit + Dat.)", bedeutungDe: "Langeweile vermeiden", bedeutung: "يسلي نفسه / يضيع الوقت (في)", beispiel: "Ich lese oft, um mir auf langen Zugfahrten die Zeit zu vertreiben." },
  { verbindung: "im Freien sein", bedeutungDe: "draußen in der Natur sein", bedeutung: "يتواجد في الهواء الطلق", beispiel: "Ich liebe sportliche Aktivitäten, die im Freien gemacht werden." },
  { verbindung: "in Form bleiben", bedeutungDe: "fit bleiben", bedeutung: "يحافظ على لياقته البدنية", beispiel: "Ich schwimme zweimal pro Woche, um auch im Alter in Form zu bleiben." },
  { verbindung: "ins Kino / Theater gehen", bedeutungDe: "Filme/Stücke ansehen", bedeutung: "يذهب إلى السينما / المسرح", beispiel: "Das Theaterstück, das gestern Abend aufgeführt wurde, war fantastisch." },
  { verbindung: "Kontakte pflegen", bedeutungDe: "Beziehungen aufrechterhalten", bedeutung: "يحافظ على علاقاته", beispiel: "Man sollte sich oft mit Bekannten treffen, um seine Kontakte zu pflegen." },
  { verbindung: "Freundschaften schließen", bedeutungDe: "neue Freunde finden", bedeutung: "يكون صداقات", beispiel: "Ich bin in einem Verein, damit ich neue Freundschaften schließe." },
  { verbindung: "sich verabreden (mit + Dat.)", bedeutungDe: "ein Treffen vereinbaren", bedeutung: "يتواعد / يتفق على لقاء مع", beispiel: "Das ist der Kollege, mit dem ich mich für heute Abend verabredet habe." },
  { verbindung: "Rücksicht nehmen (auf + Akk.)", bedeutungDe: "andere respektieren", bedeutung: "يراعي / يأخذ في الاعتبار", beispiel: "Bei Mannschaftssportarten muss immer auf die anderen Rücksicht genommen werden." },
  { verbindung: "Mitglied sein (in + Dat.)", bedeutungDe: "Teil einer Gruppe sein", bedeutung: "يكون عضواً في", beispiel: "Er ist Mitglied in einem Verein, der schon vor über 100 Jahren gegründet wurde." },
  { verbindung: "sich engagieren (für + Akk.)", bedeutungDe: "sich aktiv einsetzen", bedeutung: "يتطوع / يكرس نفسه لـ", beispiel: "Viele Menschen suchen ein Projekt, um sich ehrenamtlich zu engagieren." },
  { verbindung: "Interesse wecken (für + Akk.)", bedeutungDe: "Neugier erzeugen", bedeutung: "يثير الاهتمام بـ", beispiel: "Es werden kostenlose Kurse angeboten, um das Interesse für Kunst zu wecken." },
  { verbindung: "im Mittelpunkt stehen", bedeutungDe: "das Wichtigste sein", bedeutung: "يكون في بؤرة الاهتمام", beispiel: "In meiner Freizeit stehen Aktivitäten im Mittelpunkt, die mir neue Energie geben." },
  { verbindung: "zur Verfügung stehen", bedeutungDe: "nutzbar sein", bedeutung: "يكون متاحاً / متوفراً", beispiel: "Die wenigen Stunden, die mir zur Verfügung stehen, nutze ich zum Lesen." },
  { verbindung: "Wert legen (auf + Akk.)", bedeutungDe: "für wichtig halten", bedeutung: "يهتم بـ / يعطي قيمة لـ", beispiel: "Ich lege großen Wert auf Hobbys, durch die ich etwas Neues lerne." },
  { verbindung: "eine Rolle spielen", bedeutungDe: "wichtig sein", bedeutung: "يلعب دوراً", beispiel: "Genug Freizeit spielt eine große Rolle, damit wir auf Dauer nicht krank werden." },
  { verbindung: "sich (einer Sache) widmen", bedeutungDe: "sich intensiv beschäftigen mit", bedeutung: "يكرس نفسه لشيء", beispiel: "Am Abend widme ich mich meinem Garten, der im Sommer viel Pflege braucht." },
  { verbindung: "in Anspruch nehmen", bedeutungDe: "Zeit/Kraft erfordern", bedeutung: "يستغرق / يتطلب وقتاً أو جهداً", beispiel: "Mein neues Hobby, das sehr viel Zeit in Anspruch nimmt, ist das Fotografieren." },
  { verbindung: "sich begeistern (für + Akk.)", bedeutungDe: "großes Interesse haben an", bedeutung: "يتحمس (لـ) / يُعجب بـ", beispiel: "Ich suche noch einen Sport, für den ich mich richtig begeistern kann." },
  { verbindung: "Erfahrungen sammeln", bedeutungDe: "Neues lernen / erleben", bedeutung: "يكتسب خبرات", beispiel: "Reisen ist eine tolle Möglichkeit, um neue Erfahrungen im Ausland zu sammeln." },
  { verbindung: "Vergnügen bereiten", bedeutungDe: "Freude machen", bedeutung: "يجلب المتعة / يُسعد", beispiel: "Es müssen Hobbys gefunden werden, die uns im Alltag Vergnügen bereiten." },
  { verbindung: "Zeit investieren (in + Akk.)", bedeutungDe: "Zeit für etwas aufwenden", bedeutung: "يستثمر الوقت في", beispiel: "Es wird viel Zeit in das Training investiert, um das Turnier am Ende zu gewinnen." },
  { verbindung: "Ausdauer erfordern", bedeutungDe: "Geduld/Kraft brauchen", bedeutung: "يتطلب الصبر والمثابرة", beispiel: "Ich mache eine Sportart, die sehr viel Ausdauer und mentale Geduld erfordert." },
  { verbindung: "Spaß haben (an + Dat.)", bedeutungDe: "sich erfreuen an", bedeutung: "يستمتع (بـ)", beispiel: "Das Wichtigste ist, dass Aktivitäten gewählt werden, an denen man Spaß hat." }
];

const text1Raw = `Die Art und Weise, wie die Freizeit gestaltet wird, ist für unsere Gesundheit und unser Wohlbefinden enorm wichtig. In den wenigen Stunden, die uns nach der Arbeit zur Verfügung stehen, zieht es viele Menschen nach draußen, um einen Ausgleich zum oft sehr stressigen Berufsalltag zu finden. Ich persönlich liebe es, im Freien zu sein und die historische Architektur meiner Umgebung zu erkunden. Am Wochenende wird regelmäßig durch die alten Straßen und Gassen spaziert, damit ich fit und in Form bleibe. Solche langen Spaziergänge, die oft stundenlang dauern und viel Ausdauer erfordern, helfen mir dabei sehr, die Details der historischen Gebäude und Paläste in Ruhe zu bewundern. Es muss zwar viel Zeit in diese langen Ausflüge investiert werden, aber es lohnt sich immer, wenn man die faszinierende Geschichte der Stadt entdeckt.
Nach einem langen Weg ist es wichtig, dass man sich ausruht, um sich von der körperlichen Anstrengung zu erholen. Viele Menschen setzen sich dann gerne in ein traditionelles Café, damit sie endlich zur Ruhe kommen und bei einem warmen Minztee die Seele baumeln lassen können. Solche Kurztrips durch die Stadt werden oft gemacht, um Abstand von den alltäglichen Sorgen zu gewinnen und sich richtig zu entspannen. Wenn man viel Stress im Job hat, hilft oft schon der Blick auf ein altes Gebäude, um den Kopf frei zu bekommen.
Es ist von großer Bedeutung, dass abends wirklich abgeschaltet wird, damit man auf andere Gedanken kommt und nicht mehr an die Arbeit denkt. An freien Tagen wird manchmal auch ein Ausflug zu weiter entfernten historischen Stätten gemacht, oder es wird etwas Spannendes unternommen, wie zum Beispiel eine detaillierte Stadtführung. Am wertvollsten ist für mich jedoch die Zeit, die ich ganz entspannt mit meiner Familie in diesen wunderschönen, alten Vierteln verbringe.`;

const text2Raw = `In meinem Leben steht nicht nur die Geschichte im Mittelpunkt, sondern vor allem auch die Kunst. Es tut psychologisch unglaublich gut, einem Hobby nachzugehen, das einen tief inspiriert und kreativ erfüllt. Kürzlich wurde ich von einem befreundeten Künstler überzeugt, an einem speziellen Workshop für traditionelle Malerei teilzunehmen, um mein Interesse für neue Techniken und Farben zu wecken. Als jemand, der sehr visuell denkt, konnte ich mich schon immer für ästhetische Dinge begeistern.
Abends widme ich mich daher oft meinen eigenen Zeichnungen und Skizzen. Diese kreative Arbeit, die sehr viel Konzentration und Zeit in Anspruch nimmt, ist für mich absolut kein Stress. Im Gegenteil, sie wird immer als etwas empfunden, das mir großes Vergnügen bereitet. Man sollte stets Dinge tun, an denen man wirklich Spaß hat, damit man schöne, neue Erfahrungen sammelt und sich als Person weiterentwickelt. Wenn man aber regelmäßig malt und viel sitzt, merkt man schnell, dass aktiv Sport getrieben werden muss, damit der Rücken bei der Arbeit an der Leinwand nicht wehtut.
Darüber hinaus wird am Wochenende oft ins Kino oder Theater gegangen, um sich die Zeit auf angenehme und kulturelle Weise zu vertreiben. Für mich als Mensch, der Kunst liebt, ist es zudem essenziell, sich mit anderen auszutauschen, Kontakte zu pflegen und neue Freundschaften zu schließen. Letzte Woche habe ich mich mit einem Galeristen verabredet, der bald eine neue Ausstellung plant. Bei solchen professionellen und privaten Treffen muss natürlich immer Rücksicht auf die Ideen und Wünsche des anderen genommen werden.
Viele Kreative, die Mitglied in einem Kunstverein sind, nutzen ihre Energie auch, um sich ehrenamtlich für die kulturelle Bildung in der Gesellschaft zu engagieren. Ich persönlich lege großen Wert auf ein aktives Sozialleben in der Kunstszene, da eine gute, unterstützende Gemeinschaft eine sehr wichtige Rolle für unseren kreativen Erfolg spielt.`;

const highlightPhrases = [
  { text: "die Freizeit gestaltet", ref: 12 },
  { text: "zur Verfügung stehen", ref: 29 },
  { text: "einen Ausgleich zum oft sehr stressigen Berufsalltag zu finden", ref: 1 },
  { text: "im Freien zu sein", ref: 18 },
  { text: "fit und in Form bleibe", ref: 19 },
  { text: "viel Ausdauer erfordern", ref: 38 },
  { text: "viel Zeit in diese langen Ausflüge investiert", ref: 37 },
  { text: "sich ausruht", ref: 0 },
  { text: "zu erholen", ref: 7 },
  { text: "endlich zur Ruhe kommen", ref: 2 },
  { text: "die Seele baumeln lassen", ref: 3 },
  { text: "Abstand von den alltäglichen Sorgen zu gewinnen", ref: 4 },
  { text: "sich richtig zu entspannen", ref: 5 },
  { text: "den Kopf frei zu bekommen", ref: 6 },
  { text: "wirklich abgeschaltet wird", ref: 8 },
  { text: "auf andere Gedanken kommt", ref: 9 },
  { text: "ein Ausflug zu weiter entfernten historischen Stätten gemacht", ref: 14 },
  { text: "etwas Spannendes unternommen", ref: 15 },
  { text: "meiner Familie in diesen wunderschönen, alten Vierteln verbringe", ref: 16 },
  { text: "im Mittelpunkt", ref: 28 },
  { text: "einem Hobby nachzugehen", ref: 10 },
  { text: "teilzunehmen", ref: 13 },
  { text: "mein Interesse für neue Techniken und Farben zu wecken", ref: 27 },
  { text: "mich schon immer für ästhetische Dinge begeistern", ref: 34 },
  { text: "widme ich mich", ref: 32 },
  { text: "Zeit in Anspruch nimmt", ref: 33 },
  { text: "großes Vergnügen bereitet", ref: 36 },
  { text: "man wirklich Spaß hat", ref: 39 },
  { text: "neue Erfahrungen sammelt", ref: 35 },
  { text: "Sport getrieben werden", ref: 11 },
  { text: "ins Kino oder Theater gegangen", ref: 20 },
  { text: "die Zeit auf angenehme und kulturelle Weise zu vertreiben", ref: 17 },
  { text: "Kontakte zu pflegen", ref: 21 },
  { text: "neue Freundschaften zu schließen", ref: 22 },
  { text: "verabredet", ref: 23 },
  { text: "Rücksicht auf die Ideen und Wünsche des anderen genommen", ref: 24 },
  { text: "Mitglied in einem Kunstverein", ref: 25 },
  { text: "sich ehrenamtlich für die kulturelle Bildung in der Gesellschaft zu engagieren", ref: 26 },
  { text: "lege großen Wert auf", ref: 30 },
  { text: "wichtige Rolle für unseren kreativen Erfolg spielt", ref: 31 }
];

const dragDropData = [
  { noun: "einen Ausgleich", prep: "zu + Dat.", verb: "finden" },
  { noun: "zur Ruhe", prep: "", verb: "kommen" },
  { noun: "die Seele", prep: "", verb: "baumeln lassen" },
  { noun: "Abstand", prep: "von + Dat.", verb: "gewinnen" },
  { noun: "den Kopf frei", prep: "", verb: "bekommen" },
  { noun: "auf andere Gedanken", prep: "", verb: "kommen" },
  { noun: "einem Hobby", prep: "", verb: "nachgehen" },
  { noun: "Sport", prep: "", verb: "treiben" },
  { noun: "die Freizeit", prep: "", verb: "gestalten" },
  { noun: "an einem Kurs", prep: "", verb: "teilnehmen" },
  { noun: "einen Ausflug", prep: "", verb: "machen" },
  { noun: "etwas Spannendes", prep: "", verb: "unternehmen" },
  { noun: "Zeit", prep: "mit + Dat.", verb: "verbringen" },
  { noun: "sich die Zeit", prep: "mit + Dat.", verb: "vertreiben" },
  { noun: "im Freien", prep: "", verb: "sein" },
  { noun: "in Form", prep: "", verb: "bleiben" },
  { noun: "ins Kino / Theater", prep: "", verb: "gehen" },
  { noun: "Kontakte", prep: "", verb: "pflegen" },
  { noun: "Freundschaften", prep: "", verb: "schließen" },
  { noun: "Rücksicht", prep: "auf + Akk.", verb: "nehmen" },
  { noun: "Mitglied", prep: "in + Dat.", verb: "sein" },
  { noun: "Interesse", prep: "für + Akk.", verb: "wecken" },
  { noun: "im Mittelpunkt", prep: "", verb: "stehen" },
  { noun: "zur Verfügung", prep: "", verb: "stehen" },
  { noun: "Wert", prep: "auf + Akk.", verb: "legen" },
  { noun: "eine Rolle", prep: "", verb: "spielen" },
  { noun: "in Anspruch", prep: "", verb: "nehmen" },
  { noun: "Erfahrungen", prep: "", verb: "sammeln" },
  { noun: "Vergnügen", prep: "", verb: "bereiten" },
  { noun: "Zeit", prep: "in + Akk.", verb: "investieren" },
  { noun: "Ausdauer", prep: "", verb: "erfordern" },
  { noun: "Spaß", prep: "an + Dat.", verb: "haben" }
];

const fillBlankData = [
  { sentence: "Am Wochenende wird lange geschlafen, um sich von der anstrengenden Arbeitswoche ___.", answer: "auszuruhen" },
  { sentence: "Das ist ein Hobby, das mir hilft, einen ___ zum Stress zu finden.", answer: "Ausgleich" },
  { sentence: "Ich höre abends gerne Musik, damit ich nach der Arbeit endlich zur ___ komme.", answer: "Ruhe" },
  { sentence: "Ich fahre oft ans Meer, um einfach mal die Seele ___ zu lassen.", answer: "baumeln" },
  { sentence: "Der Urlaub wird von vielen genutzt, um ___ vom Alltag zu gewinnen.", answer: "Abstand" },
  { sentence: "Ein gutes Buch wird oft gelesen, damit man sich auf dem Sofa ___ kann.", answer: "entspannen" },
  { sentence: "Ich gehe nach einem langen Tag joggen, um den Kopf frei zu ___.", answer: "bekommen" },
  { sentence: "Der Sonntag ist da, damit wir uns von unseren Pflichten ___.", answer: "erholen" },
  { sentence: "Spaziergänge, die im Wald gemacht werden, helfen mir beim ___.", answer: "Abschalten" },
  { sentence: "Ich treffe meine Freunde, um bei Problemen auf andere ___ zu kommen.", answer: "Gedanken" },
  { sentence: "Es ist wichtig, einem Hobby ___, das einem wirklich Spaß macht.", answer: "nachzugehen" },
  { sentence: "Es muss regelmäßig Sport ___ werden, damit der Körper gesund bleibt.", answer: "getrieben" },
  { sentence: "Es gibt viele tolle Möglichkeiten, wie die Freizeit kreativ ___ werden kann.", answer: "gestaltet" },
  { sentence: "Ich nehme an einem Sprachkurs ___, der von der Schule organisiert wird.", answer: "teil" },
  { sentence: "Wir machen am Samstag einen ___, um die schöne Natur zu genießen.", answer: "Ausflug" },
  { sentence: "Am Wochenende wird oft etwas ___ unternommen, damit keine Langeweile aufkommt.", answer: "Spannendes" },
  { sentence: "Das ist das Spiel, mit dem wir am liebsten unsere Zeit ___.", answer: "verbringen" },
  { sentence: "Ich lese oft, um mir auf langen Zugfahrten die Zeit zu ___.", answer: "vertreiben" },
  { sentence: "Ich liebe sportliche Aktivitäten, die im ___ gemacht werden.", answer: "Freien" },
  { sentence: "Ich schwimme zweimal pro Woche, um auch im Alter in ___ zu bleiben.", answer: "Form" },
  { sentence: "Am Freitagabend möchte ich unbedingt ins ___ gehen.", answer: "Kino" },
  { sentence: "Man sollte sich oft mit Bekannten treffen, um seine Kontakte zu ___.", answer: "pflegen" },
  { sentence: "Ich bin in einem Verein, damit ich neue Freundschaften ___.", answer: "schließe" },
  { sentence: "Das ist der Kollege, mit dem ich mich für heute Abend ___ habe.", answer: "verabredet" },
  { sentence: "Bei Mannschaftssportarten muss immer auf die anderen ___ genommen werden.", answer: "Rücksicht" },
  { sentence: "Ich bin ___ in einem Sportverein, der schon lange existiert.", answer: "Mitglied" },
  { sentence: "Viele Menschen suchen ein Projekt, um sich ehrenamtlich zu ___.", answer: "engagieren" },
  { sentence: "Es werden kostenlose Kurse angeboten, um das Interesse für Kunst zu ___.", answer: "wecken" },
  { sentence: "In meiner Freizeit stehen Aktivitäten im ___, die mir neue Energie geben.", answer: "Mittelpunkt" },
  { sentence: "Die wenigen Stunden, die mir zur ___ stehen, nutze ich zum Lesen.", answer: "Verfügung" },
  { sentence: "Ich lege großen ___ auf Hobbys, durch die ich etwas Neues lerne.", answer: "Wert" },
  { sentence: "Genug Freizeit spielt eine große ___, damit wir auf Dauer nicht krank werden.", answer: "Rolle" },
  { sentence: "Am Abend ___ ich mich meinem Garten, der im Sommer viel Pflege braucht.", answer: "widme" },
  { sentence: "Mein neues Hobby, das sehr viel Zeit in ___ nimmt, ist das Fotografieren.", answer: "Anspruch" },
  { sentence: "Ich suche noch einen Sport, für den ich mich richtig ___ kann.", answer: "begeistern" },
  { sentence: "Reisen ist eine tolle Möglichkeit, um neue ___ im Ausland zu sammeln.", answer: "Erfahrungen" },
  { sentence: "Es müssen Hobbys gefunden werden, die uns im Alltag ___ bereiten.", answer: "Vergnügen" },
  { sentence: "Es wird viel Zeit in das Training ___, um das Turnier am Ende zu gewinnen.", answer: "investiert" },
  { sentence: "Ich mache eine Sportart, die sehr viel ___ und mentale Geduld erfordert.", answer: "Ausdauer" },
  { sentence: "Das Wichtigste ist, dass Aktivitäten gewählt werden, an denen man ___ hat.", answer: "Spaß" }
];

/* ============================================================
   2. STATE
   ============================================================ */
let reviewQueue = [];

/* ============================================================
   3. TOP-LEVEL NAVIGATION
   ============================================================ */
const navStudy = document.getElementById('nav-study');
const navPractice = document.getElementById('nav-practice');
const studySection = document.getElementById('study-section');
const practiceSection = document.getElementById('practice-section');

navStudy.addEventListener('click', () => switchView(studySection, navStudy, navPractice));
navPractice.addEventListener('click', () => switchView(practiceSection, navPractice, navStudy));

function switchView(showSection, activeBtn, inactiveBtn){
  studySection.classList.remove('active');
  practiceSection.classList.remove('active');
  showSection.classList.add('active');
  activeBtn.classList.add('active');
  inactiveBtn.classList.remove('active');
}

document.querySelectorAll('.sub-nav').forEach(navGroup => {
  navGroup.querySelectorAll('.sub-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parentSection = navGroup.parentElement;
      navGroup.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      parentSection.querySelectorAll('.sub-view').forEach(v => v.classList.remove('active'));
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });
});

/* Flashcards internal toggle: Überblick / Lernmodus / Review */
document.querySelectorAll('.fc-toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fc-toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.fc-view').forEach(v => v.classList.remove('active'));
    document.getElementById(btn.dataset.fcview).classList.add('active');
    if (btn.dataset.fcview === 'study-view') renderStudyCard();
  });
});

/* ============================================================
   4. READING + HIGHLIGHTING (Mobile friendly)
   ============================================================ */
function escapeRegex(str){
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(raw){
  let html = raw
    .split('\n')
    .map(p => `<span style="display:block; margin:0 0 16px 0;">${p}</span>`)
    .join('');

  const sorted = [...highlightPhrases].sort((a,b) => b.text.length - a.text.length);

  sorted.forEach(item => {
    const item2 = vocabData[item.ref];
    const regex = new RegExp(escapeRegex(item.text), 'i');
    html = html.replace(regex, (match) =>
      `<mark data-meaning="${item2.verbindung} — ${item2.bedeutung}">${match}</mark>`
    );
  });

  return html;
}

document.getElementById('text1').innerHTML = highlightText(text1Raw);
document.getElementById('text2').innerHTML = highlightText(text2Raw);

document.querySelectorAll('mark').forEach(mark => {
  mark.addEventListener('click', () => {
    showToast(mark.dataset.meaning);
  });
});

/* ============================================================
   5. FLASHCARDS — OVERVIEW & REVIEW QUEUE
   ============================================================ */
const flashcardGrid = document.getElementById('flashcard-grid');
const reviewBadge = document.getElementById('review-badge');
const reviewGrid = document.getElementById('review-grid');

function renderFlashcards(){
  flashcardGrid.innerHTML = '';
  vocabData.forEach((item, index) => {
    const card = buildFlashcard(item, index);
    flashcardGrid.appendChild(card);
  });
}

function buildFlashcard(item, index, isReviewCard = false){
  const card = document.createElement('div');
  card.className = 'flip-card';
  card.dataset.index = index;

  card.innerHTML = `
    <div class="flip-card-inner">
      <div class="flip-front">
        <strong>${item.verbindung}</strong>
      </div>
      <div class="flip-back">
        <div class="arabic">${item.bedeutung}</div>
        <div class="example">${item.beispiel}</div>
        ${!isReviewCard ? '<button class="review-btn" type="button">🔁 Needs Review</button>' : ''}
      </div>
    </div>
  `;

  card.addEventListener('click', (e) => {
    if (e.target.closest('.review-btn')) return;
    card.classList.toggle('flipped');
  });

  if (!isReviewCard) {
    card.querySelector('.review-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      scheduleReview(item);
    });
  }

  return card;
}

function updateReviewQueueUI() {
  reviewBadge.textContent = reviewQueue.length;
  reviewGrid.innerHTML = '';
  
  if (reviewQueue.length === 0) {
    reviewGrid.innerHTML = '<p class="hint">Keine Karten zur Wiederholung.</p>';
    return;
  }
  
  reviewQueue.forEach(item => {
    const card = buildFlashcard(item, -1, true); // true = isReviewCard
    reviewGrid.appendChild(card);
  });
}

function scheduleReview(item){
  if (!reviewQueue.some(q => q.verbindung === item.verbindung)) {
    reviewQueue.push(item);
    updateReviewQueueUI();
    showToast('Karten zur Wiederholung hinzugefügt ✅');
  } else {
    showToast('Ist bereits in der Wiederholungs-Liste!');
  }
}

renderFlashcards();
updateReviewQueueUI();

/* ============================================================
   6. FLASHCARDS — SINGLE-CARD STUDY MODE
   ============================================================ */
let studyOrder = shuffle(vocabData.map((_, i) => i));
let studyPos = 0;

const studyCardEl = document.getElementById('study-card');
const studyFrontText = document.getElementById('study-front-text');
const studyBackGerman = document.getElementById('study-back-german');
const studyBackArabic = document.getElementById('study-back-arabic');
const studyBackExample = document.getElementById('study-back-example');
const studyProgressLabel = document.getElementById('study-progress-label');
const studyProgressFill = document.getElementById('study-progress-fill');

function renderStudyCard(){
  if(studyOrder.length === 0) return;
  if(studyPos >= studyOrder.length) studyPos = 0;
  const vocabIndex = studyOrder[studyPos];
  const item = vocabData[vocabIndex];

  studyCardEl.classList.remove('flipped');
  studyFrontText.textContent = item.verbindung;
  studyBackGerman.textContent = item.bedeutungDe || "";
  studyBackArabic.textContent = item.bedeutung;
  studyBackExample.textContent = item.beispiel;
  studyProgressLabel.textContent = `Karte ${studyPos + 1} / ${studyOrder.length}`;
  studyProgressFill.style.width = `${((studyPos + 1) / studyOrder.length) * 100}%`;
}

studyCardEl.addEventListener('click', () => {
  studyCardEl.classList.toggle('flipped');
});

document.getElementById('study-next').addEventListener('click', () => {
  if(studyOrder.length === 0) return;
  studyPos = (studyPos + 1) % studyOrder.length;
  renderStudyCard();
});

document.getElementById('study-prev').addEventListener('click', () => {
  if(studyOrder.length === 0) return;
  studyPos = (studyPos - 1 + studyOrder.length) % studyOrder.length;
  renderStudyCard();
});

document.getElementById('study-shuffle').addEventListener('click', () => {
  studyOrder = shuffle(studyOrder);
  studyPos = 0;
  renderStudyCard();
  showToast('Karten gemischt 🔀');
});

document.getElementById('study-review-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  if(studyOrder.length === 0) return;
  const vocabIndex = studyOrder[studyPos];
  scheduleReview(vocabData[vocabIndex]);
  document.getElementById('study-next').click();
});

/* Swipe gestures for study card */
(function enableStudySwipe(){
  let startX = null, startY = null, isSwiping = false;

  studyCardEl.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
    isSwiping = true;
  });

  studyCardEl.addEventListener('pointerup', (e) => {
    if(!isSwiping || startX === null) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    isSwiping = false;
    if(Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)){
      if(dx < 0){
        document.getElementById('study-next').click();
      } else {
        document.getElementById('study-prev').click();
      }
    }
    startX = null;
    startY = null;
  });
})();

renderStudyCard();

/* ============================================================
   7. TOAST HELPER
   ============================================================ */
let toastTimer;
function showToast(msg){
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ============================================================
   8. SHARED SHUFFLE HELPER
   ============================================================ */
function shuffle(arr){
  const a = [...arr];
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ============================================================
   9. EXERCISE 1 — MULTIPLE CHOICE
   ============================================================ */
let mcqCorrectCount = 0;
let mcqAnswered = 0;

function buildMCQ(){
  const container = document.getElementById('mcq-container');
  container.innerHTML = '';
  mcqCorrectCount = 0;
  mcqAnswered = 0;
  document.getElementById('mcq-score').textContent = '';

  const questions = shuffle(vocabData).slice(0, 25);

  questions.forEach((q, qIndex) => {
    const wrongPool = vocabData.filter(v => v.verbindung !== q.verbindung);
    const options = shuffle([q, ...shuffle(wrongPool).slice(0, 3)]);

    const item = document.createElement('div');
    item.className = 'mcq-item';
    item.innerHTML = `
      <div class="mcq-question">${qIndex + 1}. ${q.bedeutung}</div>
      <div class="mcq-options"></div>
    `;

    const optionsWrap = item.querySelector('.mcq-options');
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mcq-option';
      btn.textContent = opt.verbindung;
      btn.addEventListener('click', () => {
        const allBtns = optionsWrap.querySelectorAll('.mcq-option');
        allBtns.forEach(b => b.classList.add('disabled'));

        if(opt.verbindung === q.verbindung){
          btn.classList.add('correct');
          mcqCorrectCount++;
        } else {
          btn.classList.add('wrong');
          allBtns.forEach(b => {
            if(b.textContent === q.verbindung) b.classList.add('correct');
          });
        }
        mcqAnswered++;
        document.getElementById('mcq-score').textContent =
          `Punkte: ${mcqCorrectCount} / ${mcqAnswered}`;
      });
      optionsWrap.appendChild(btn);
    });

    container.appendChild(item);
  });
}

buildMCQ();

/* ============================================================
   10. EXERCISE 2 — DRAG AND DROP (Instant Feedback)
   ============================================================ */
function buildDragDrop(){
  const dropZonesEl = document.getElementById('drop-zones');
  const verbBankEl = document.getElementById('verb-bank');
  dropZonesEl.innerHTML = '';
  verbBankEl.innerHTML = '';

  dragDropData.forEach((pair, index) => {
    const row = document.createElement('div');
    row.className = 'drop-row';
    row.innerHTML = `
      <span class="noun">${pair.noun}</span>
      ${pair.prep ? `<span style="color:var(--muted); font-size:0.85rem;">(${pair.prep})</span>` : ''}
      <div class="drop-zone" data-answer="${pair.verb}" data-index="${index}">Verb hier ablegen</div>
    `;
    dropZonesEl.appendChild(row);

    const zone = row.querySelector('.drop-zone');
    zone.addEventListener('click', () => {
      if(zone.dataset.filled === 'true'){
        resetZone(zone);
      }
    });
  });

  const shuffledForBank = shuffle(dragDropData);
  shuffledForBank.forEach((pair, i) => {
    const chip = document.createElement('div');
    chip.className = 'verb-chip';
    chip.id = `verb-chip-${i}`;
    chip.textContent = pair.verb;
    makeChipDraggable(chip, pair.verb);
    verbBankEl.appendChild(chip);
  });
}

function resetZone(zone){
  const chip = document.getElementById(zone.dataset.chipId);
  if(chip) chip.classList.remove('used');
  zone.textContent = 'Verb hier ablegen';
  zone.classList.remove('correct', 'wrong');
  delete zone.dataset.filled;
  delete zone.dataset.given;
  delete zone.dataset.chipId;
}

function makeChipDraggable(chip, verb){
  chip.addEventListener('pointerdown', (e) => {
    if(chip.classList.contains('used')) return;
    e.preventDefault();

    const rect = chip.getBoundingClientRect();
    const ghost = chip.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.style.width = rect.width + 'px';
    document.body.appendChild(ghost);

    function moveGhost(x, y){
      ghost.style.left = (x - rect.width / 2) + 'px';
      ghost.style.top = (y - rect.height / 2) + 'px';
    }
    moveGhost(e.clientX, e.clientY);
    chip.style.opacity = '0.35';

    function clearOverStates(){
      document.querySelectorAll('.drop-zone.over').forEach(z => z.classList.remove('over'));
    }

    function onMove(ev){
      moveGhost(ev.clientX, ev.clientY);
      clearOverStates();
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const zone = el && el.closest && el.closest('.drop-zone');
      if(zone && zone.dataset.filled !== 'true') zone.classList.add('over');
    }

    function onUp(ev){
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const zone = el && el.closest && el.closest('.drop-zone');
      clearOverStates();

      if(zone && zone.dataset.filled !== 'true'){
        zone.textContent = verb;
        zone.dataset.filled = 'true';
        zone.dataset.given = verb;
        zone.dataset.chipId = chip.id;
        chip.classList.add('used');

        // INSTANT CHECK LOGIC
        if(verb.toLowerCase() === zone.dataset.answer.toLowerCase()){
          zone.classList.add('correct');
          zone.classList.remove('wrong');
        } else {
          zone.classList.add('wrong');
          zone.classList.remove('correct');
        }
      }

      chip.style.opacity = '';
      ghost.remove();
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  });
}

document.getElementById('reset-dnd').addEventListener('click', buildDragDrop);

buildDragDrop();

/* ============================================================
   11. EXERCISE 3 — FILL IN THE BLANKS (Instant Feedback)
   ============================================================ */
function buildFillBlank(){
  const container = document.getElementById('fillblank-container');
  container.innerHTML = '';

  fillBlankData.forEach((item, index) => {
    const parts = item.sentence.split('___');
    const div = document.createElement('div');
    div.className = 'fb-item';
    div.innerHTML = `
      ${index + 1}. ${parts[0]}
      <input type="text" data-answer="${item.answer}" autocomplete="off">
      ${parts[1] || ''}
    `;
    container.appendChild(div);

    // INSTANT CHECK ON CHANGE
    const input = div.querySelector('input');
    input.addEventListener('change', () => {
      const given = input.value.trim().toLowerCase();
      const answer = input.dataset.answer.toLowerCase();
      if(given === answer){
        input.classList.add('correct');
        input.classList.remove('wrong');
      } else {
        input.classList.add('wrong');
        input.classList.remove('correct');
      }
    });
  });
}

buildFillBlank();