/* ============================================================
   0. SPLASH SCREEN & NAVIGATION
   ============================================================ */
window.addEventListener('load', () => {
  const splash = document.getElementById('splash-screen');
  setTimeout(() => {
    splash.classList.add('hidden');
    setTimeout(() => { splash.remove(); }, 600);
  }, 2500); 
  
  loadFlashcardState(); 
  
  // Render Freizeit
  renderFlashcards();
  updateReviewQueueUI();
  renderStudyCard();
  
  // Render Krach
  renderKrachFlashcards();
  updateKrachReviewQueueUI();
  renderKrachStudyCard();
  
  setupTooltips();
});

function openPage(pageId) {
  document.querySelectorAll('.page-view').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  window.scrollTo(0, 0);
}

function switchKrachTab(tabName, btnElement) {
  const parent = btnElement.parentElement;
  parent.querySelectorAll('.sub-btn').forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');
  document.getElementById('krach-lesetext').classList.remove('active');
  document.getElementById('krach-flashcards').classList.remove('active');
  document.getElementById(`krach-${tabName}`).classList.add('active');
}

/* ============================================================
   1. DATA: FREIZEIT
   ============================================================ */
const vocabData = [
  { verbindung: "sich ausruhen (von + Dat.)", bedeutungDe: "", bedeutung: "يستريح من", beispiel: "Am Wochenende wird lange geschlafen, um sich von der anstrengenden Arbeitswoche auszuruhen." },
  { verbindung: "einen Ausgleich finden (zu + Dat.)", bedeutungDe: "", bedeutung: "يجد توازناً / متنفساً لـ", beispiel: "Das ist ein Hobby, das mir hilft, einen Ausgleich zum Stress zu finden." },
  { verbindung: "zur Ruhe kommen", bedeutungDe: "", bedeutung: "يهدأ / يرتاح", beispiel: "Ich höre abends gerne Musik, damit ich nach der Arbeit endlich zur Ruhe komme." },
  { verbindung: "die Seele baumeln lassen", bedeutungDe: "", bedeutung: "يريح أعصابه / يسترخي تماماً", beispiel: "Ich fahre oft ans Meer, um einfach mal die Seele baumeln zu lassen." },
  { verbindung: "Abstand gewinnen (von + Dat.)", bedeutungDe: "", bedeutung: "يبتعد عن (الضغوط) / يفصل نفسه", beispiel: "Der Urlaub wird von vielen genutzt, um Abstand vom Alltag zu gewinnen." },
  { verbindung: "sich entspannen", bedeutungDe: "", bedeutung: "يسترخي", beispiel: "Ein gutes Buch wird oft gelesen, damit man sich auf dem Sofa entspannen kann." },
  { verbindung: "den Kopf frei bekommen", bedeutungDe: "", bedeutung: "يصفي ذهنه", beispiel: "Ich gehe nach einem langen Tag joggen, um den Kopf frei zu bekommen." },
  { verbindung: "sich erholen (von + Dat.)", bedeutungDe: "", bedeutung: "يتعافى / يستجم (من)", beispiel: "Der Sonntag ist da, damit wir uns von unseren Pflichten erholen." },
  { verbindung: "abschalten (können)", bedeutungDe: "", bedeutung: "يفصل ذهنياً / يتوقف عن التفكير", beispiel: "Spaziergänge, die im Wald gemacht werden, helfen mir beim Abschalten." },
  { verbindung: "auf andere Gedanken kommen", bedeutungDe: "", bedeutung: "يغير جو / يجدد أفكاره", beispiel: "Ich treffe meine Freunde, um bei Problemen auf andere Gedanken zu kommen." },
  { verbindung: "einem Hobby nachgehen", bedeutungDe: "", bedeutung: "يمارس هواية", beispiel: "Es ist wichtig, einem Hobby nachzugehen, das einem wirklich Spaß macht." },
  { verbindung: "Sport treiben", bedeutungDe: "", bedeutung: "يمارس الرياضة", beispiel: "Es muss regelmäßig Sport getrieben werden, damit der Körper gesund bleibt." },
  { verbindung: "die Freizeit gestalten", bedeutungDe: "", bedeutung: "ينظم / يقضي وقت الفراغ", beispiel: "Es gibt viele tolle Möglichkeiten, wie die Freizeit kreativ gestaltet werden kann." },
  { verbindung: "an einem Kurs teilnehmen", bedeutungDe: "", bedeutung: "يشارك في دورة / كورس", beispiel: "Ich nehme an einem Sprachkurs teil, der von der Schule organisiert wird." },
  { verbindung: "einen Ausflug machen", bedeutungDe: "", bedeutung: "يقوم بنزهة / رحلة قصيرة", beispiel: "Wir machen am Samstag einen Ausflug, um die schöne Natur zu genießen." },
  { verbindung: "etwas Spannendes unternehmen", bedeutungDe: "", bedeutung: "يقوم بشيء مشوق / ممتع", beispiel: "Am Wochenende wird oft etwas Spannendes unternommen, damit keine Langeweile aufkommt." },
  { verbindung: "Zeit verbringen (mit + Dat.)", bedeutungDe: "", bedeutung: "يقضي وقتاً (مع)", beispiel: "Das ist das Spiel, mit dem wir am liebsten unsere Zeit verbringen." },
  { verbindung: "sich die Zeit vertreiben (mit + Dat.)", bedeutungDe: "", bedeutung: "يسلي نفسه / يضيع الوقت (في)", beispiel: "Ich lese oft, um mir auf langen Zugfahrten die Zeit zu vertreiben." },
  { verbindung: "im Freien sein", bedeutungDe: "", bedeutung: "يتواجد في الهواء الطلق", beispiel: "Ich liebe sportliche Aktivitäten, die im Freien gemacht werden." },
  { verbindung: "in Form bleiben", bedeutungDe: "", bedeutung: "يحافظ على لياقته البدنية", beispiel: "Ich schwimme zweimal pro Woche, um auch im Alter in Form zu bleiben." },
  { verbindung: "ins Kino / Theater gehen", bedeutungDe: "", bedeutung: "يذهب إلى السينما / المسرح", beispiel: "Das Theaterstück, das gestern Abend aufgeführt wurde, war fantastisch." },
  { verbindung: "Kontakte pflegen", bedeutungDe: "", bedeutung: "يحافظ على علاقاته", beispiel: "Man sollte sich oft mit Bekannten treffen, um seine Kontakte zu pflegen." },
  { verbindung: "Freundschaften schließen", bedeutungDe: "", bedeutung: "يكون صداقات", beispiel: "Ich bin in einem Verein, damit ich neue Freundschaften schließe." },
  { verbindung: "sich verabreden (mit + Dat.)", bedeutungDe: "", bedeutung: "يتواعد / يتفق على لقاء مع", beispiel: "Das ist der Kollege, mit dem ich mich für heute Abend verabredet habe." },
  { verbindung: "Rücksicht nehmen (auf + Akk.)", bedeutungDe: "", bedeutung: "يراعي / يأخذ في الاعتبار", beispiel: "Bei Mannschaftssportarten muss immer auf die anderen Rücksicht genommen werden." },
  { verbindung: "Mitglied sein (in + Dat.)", bedeutungDe: "", bedeutung: "يكون عضواً في", beispiel: "Er ist Mitglied in einem Verein, der schon vor über 100 Jahren gegründet wurde." },
  { verbindung: "sich engagieren (für + Akk.)", bedeutungDe: "", bedeutung: "يتطوع / يكرس نفسه لـ", beispiel: "Viele Menschen suchen ein Projekt, um sich ehrenamtlich zu engagieren." },
  { verbindung: "Interesse wecken (für + Akk.)", bedeutungDe: "", bedeutung: "يثير الاهتمام بـ", beispiel: "Es werden kostenlose Kurse angeboten, um das Interesse für Kunst zu wecken." },
  { verbindung: "im Mittelpunkt stehen", bedeutungDe: "", bedeutung: "يكون في بؤرة الاهتمام", beispiel: "In meiner Freizeit stehen Aktivitäten im Mittelpunkt, die mir neue Energie geben." },
  { verbindung: "zur Verfügung stehen", bedeutungDe: "", bedeutung: "يكون متاحاً / متوفراً", beispiel: "Die wenigen Stunden, die mir zur Verfügung stehen, nutze ich zum Lesen." },
  { verbindung: "Wert legen (auf + Akk.)", bedeutungDe: "", bedeutung: "يهتم بـ / يعطي قيمة لـ", beispiel: "Ich lege großen Wert auf Hobbys, durch die ich etwas Neues lerne." },
  { verbindung: "eine Rolle spielen", bedeutungDe: "", bedeutung: "يلعب دوراً", beispiel: "Genug Freizeit spielt eine große Rolle, damit wir auf Dauer nicht krank werden." },
  { verbindung: "sich (einer Sache) widmen", bedeutungDe: "", bedeutung: "يكرس نفسه لشيء", beispiel: "Am Abend widme ich mich meinem Garten, der im Sommer viel Pflege braucht." },
  { verbindung: "in Anspruch nehmen", bedeutungDe: "", bedeutung: "يستغرق / يتطلب وقتاً أو جهداً", beispiel: "Mein neues Hobby, das sehr viel Zeit in Anspruch nimmt, ist das Fotografieren." },
  { verbindung: "sich begeistern (für + Akk.)", bedeutungDe: "", bedeutung: "يتحمس (لـ) / يُعجب بـ", beispiel: "Ich suche noch einen Sport, für den ich mich richtig begeistern kann." },
  { verbindung: "Erfahrungen sammeln", bedeutungDe: "", bedeutung: "يكتسب خبرات", beispiel: "Reisen ist eine tolle Möglichkeit, um neue Erfahrungen im Ausland zu sammeln." },
  { verbindung: "Vergnügen bereiten", bedeutungDe: "", bedeutung: "يجلب المتعة / يُسعد", beispiel: "Es müssen Hobbys gefunden werden, die uns im Alltag Vergnügen bereiten." },
  { verbindung: "Zeit investieren (in + Akk.)", bedeutungDe: "", bedeutung: "يستثمر الوقت في", beispiel: "Es wird viel Zeit in das Training investiert, um das Turnier am Ende zu gewinnen." },
  { verbindung: "Ausdauer erfordern", bedeutungDe: "", bedeutung: "يتطلب الصبر والمثابرة", beispiel: "Ich mache eine Sportart, die sehr viel Ausdauer und mentale Geduld erfordert." },
  { verbindung: "Spaß haben (an + Dat.)", bedeutungDe: "", bedeutung: "يستمتع (بـ)", beispiel: "Das Wichtigste ist, dass Aktivitäten gewählt werden, an denen man Spaß hat." }
];

const text1Raw = `Die Art und Weise, wie die <span class="vocab-word" data-meaning="ينظم وقت الفراغ">Freizeit gestaltet</span> wird, ist für unsere Gesundheit und unser Wohlbefinden enorm wichtig. In den wenigen Stunden, die uns nach der Arbeit <span class="vocab-word" data-meaning="متاحاً / متوفراً">zur Verfügung stehen</span>, zieht es viele Menschen nach draußen, um <span class="vocab-word" data-meaning="توازناً / متنفساً">einen Ausgleich</span> zum oft sehr stressigen Berufsalltag <span class="vocab-word" data-meaning="توازناً / متنفساً">zu finden</span>. Ich persönlich liebe es, <span class="vocab-word" data-meaning="يتواجد في الهواء الطلق">im Freien zu sein</span> und die historische Architektur meiner Umgebung zu erkunden. Am Wochenende wird regelmäßig durch die alten Straßen und Gassen spaziert, damit ich fit und <span class="vocab-word" data-meaning="يحافظ على لياقته">in Form bleibe</span>. Solche langen Spaziergänge, die oft stundenlang dauern und viel <span class="vocab-word" data-meaning="يتطلب الصبر والمثابرة">Ausdauer erfordern</span>, helfen mir dabei sehr, die Details der historischen Gebäude und Paläste in Ruhe zu bewundern. Es muss zwar viel <span class="vocab-word" data-meaning="يستثمر الوقت">Zeit in diese langen Ausflüge investiert</span> werden, aber es lohnt sich immer, wenn man die faszinierende Geschichte der Stadt entdeckt.
Nach einem langen Weg ist es wichtig, dass man <span class="vocab-word" data-meaning="يستريح">sich ausruht</span>, um sich von der körperlichen Anstrengung <span class="vocab-word" data-meaning="يتعافى / يستجم">zu erholen</span>. Viele Menschen setzen sich dann gerne in ein traditionelles Café, damit sie endlich <span class="vocab-word" data-meaning="يهدأ / يرتاح">zur Ruhe kommen</span> und bei einem warmen Minztee <span class="vocab-word" data-meaning="يسترخي تماماً">die Seele baumeln lassen</span> können. Solche Kurztrips durch die Stadt werden oft gemacht, um <span class="vocab-word" data-meaning="يبتعد عن الضغوط">Abstand von den alltäglichen Sorgen zu gewinnen</span> und sich richtig <span class="vocab-word" data-meaning="يسترخي">zu entspannen</span>. Wenn man viel Stress im Job hat, hilft oft schon der Blick auf ein altes Gebäude, um <span class="vocab-word" data-meaning="يصفي ذهنه">den Kopf frei zu bekommen</span>.
Es ist von großer Bedeutung, dass abends wirklich <span class="vocab-word" data-meaning="يفصل ذهنياً">abgeschaltet wird</span>, damit man <span class="vocab-word" data-meaning="يغير جو / يجدد أفكاره">auf andere Gedanken kommt</span> und nicht mehr an die Arbeit denkt. An freien Tagen wird manchmal auch <span class="vocab-word" data-meaning="نزهة / رحلة">ein Ausflug</span> zu weiter entfernten historischen Stätten <span class="vocab-word" data-meaning="نزهة / رحلة">gemacht</span>, oder es wird <span class="vocab-word" data-meaning="يقوم بشيء ممتع">etwas Spannendes unternommen</span>, wie zum Beispiel eine detaillierte Stadtführung. Am wertvollsten ist für mich jedoch die Zeit, die ich ganz entspannt mit meiner Familie in diesen wunderschönen, alten Vierteln <span class="vocab-word" data-meaning="يقضي وقتاً">verbringe</span>.`;

const text2Raw = `In meinem Leben steht nicht nur die Geschichte <span class="vocab-word" data-meaning="في بؤرة الاهتمام">im Mittelpunkt</span>, sondern vor allem auch die Kunst. Es tut psychologisch unglaublich gut, <span class="vocab-word" data-meaning="يمارس هواية">einem Hobby nachzugehen</span>, das einen tief inspiriert und kreativ erfüllt. Kürzlich wurde ich von einem befreundeten Künstler überzeugt, <span class="vocab-word" data-meaning="يشارك في">an einem speziellen Workshop</span> für traditionelle Malerei <span class="vocab-word" data-meaning="يشارك في">teilzunehmen</span>, um <span class="vocab-word" data-meaning="يثير الاهتمام">mein Interesse</span> für neue Techniken und Farben <span class="vocab-word" data-meaning="يثير الاهتمام">zu wecken</span>. Als jemand, der sehr visuell denkt, konnte ich <span class="vocab-word" data-meaning="يتحمس / يُعجب">mich schon immer für ästhetische Dinge begeistern</span>.
Abends <span class="vocab-word" data-meaning="يكرس نفسه لشيء">widme ich mich</span> daher oft meinen eigenen Zeichnungen und Skizzen. Diese kreative Arbeit, die sehr viel <span class="vocab-word" data-meaning="يستغرق وقتاً / جهداً">Zeit in Anspruch nimmt</span>, ist für mich absolut kein Stress. Im Gegenteil, sie wird immer als etwas empfunden, das mir <span class="vocab-word" data-meaning="يجلب المتعة">großes Vergnügen bereitet</span>. Man sollte stets Dinge tun, an denen <span class="vocab-word" data-meaning="يستمتع">man wirklich Spaß hat</span>, damit man schöne, <span class="vocab-word" data-meaning="يكتسب خبرات">neue Erfahrungen sammelt</span> und sich als Person weiterentwickelt. Wenn man aber regelmäßig malt und viel sitzt, merkt man schnell, dass aktiv <span class="vocab-word" data-meaning="يمارس الرياضة">Sport getrieben werden</span> muss, damit der Rücken bei der Arbeit an der Leinwand nicht wehtut.
Darüber hinaus wird am Wochenende oft <span class="vocab-word" data-meaning="يذهب للسينما/المسرح">ins Kino oder Theater gegangen</span>, um <span class="vocab-word" data-meaning="يسلي نفسه / يضيع الوقت">sich die Zeit auf angenehme und kulturelle Weise zu vertreiben</span>. Für mich als Mensch, der Kunst liebt, ist es zudem essenziell, sich mit anderen auszutauschen, <span class="vocab-word" data-meaning="يحافظ على علاقاته">Kontakte zu pflegen</span> und <span class="vocab-word" data-meaning="يكون صداقات">neue Freundschaften zu schließen</span>. Letzte Woche habe ich <span class="vocab-word" data-meaning="يتواعد / يتفق على لقاء">mich</span> mit einem Galeristen <span class="vocab-word" data-meaning="يتواعد / يتفق على لقاء">verabredet</span>, der bald eine neue Ausstellung plant. Bei solchen professionellen und privaten Treffen muss natürlich immer <span class="vocab-word" data-meaning="يراعي">Rücksicht auf</span> die Ideen und Wünsche des anderen <span class="vocab-word" data-meaning="يراعي">genommen</span> werden.
Viele Kreative, die <span class="vocab-word" data-meaning="يكون عضواً في">Mitglied in</span> einem Kunstverein <span class="vocab-word" data-meaning="يكون عضواً في">sind</span>, nutzen ihre Energie auch, um <span class="vocab-word" data-meaning="يتطوع / يكرس نفسه لـ">sich ehrenamtlich für die kulturelle Bildung in der Gesellschaft zu engagieren</span>. Ich persönlich <span class="vocab-word" data-meaning="يهتم بـ / يعطي قيمة">lege großen Wert auf</span> ein aktives Sozialleben in der Kunstszene, da eine gute, unterstützende Gemeinschaft <span class="vocab-word" data-meaning="يلعب دوراً">eine sehr wichtige Rolle</span> für unseren kreativen Erfolg <span class="vocab-word" data-meaning="يلعب دوراً">spielt</span>.`;

const dragDropData = [
  { noun: "einen Ausgleich", prep: "zu + Dat.", verb: "finden" }, { noun: "zur Ruhe", prep: "", verb: "kommen" }, { noun: "die Seele", prep: "", verb: "baumeln lassen" }, { noun: "Abstand", prep: "von + Dat.", verb: "gewinnen" }, { noun: "den Kopf frei", prep: "", verb: "bekommen" }, { noun: "auf andere Gedanken", prep: "", verb: "kommen" }, { noun: "einem Hobby", prep: "", verb: "nachgehen" }, { noun: "Sport", prep: "", verb: "treiben" }, { noun: "die Freizeit", prep: "", verb: "gestalten" }, { noun: "an einem Kurs", prep: "", verb: "teilnehmen" }, { noun: "einen Ausflug", prep: "", verb: "machen" }, { noun: "etwas Spannendes", prep: "", verb: "unternehmen" }, { noun: "Zeit", prep: "mit + Dat.", verb: "verbringen" }, { noun: "sich die Zeit", prep: "mit + Dat.", verb: "vertreiben" }, { noun: "im Freien", prep: "", verb: "sein" }, { noun: "in Form", prep: "", verb: "bleiben" }, { noun: "ins Kino / Theater", prep: "", verb: "gehen" }, { noun: "Kontakte", prep: "", verb: "pflegen" }, { noun: "Freundschaften", prep: "", verb: "schließen" }, { noun: "Rücksicht", prep: "auf + Akk.", verb: "nehmen" }, { noun: "Mitglied", prep: "in + Dat.", verb: "sein" }, { noun: "Interesse", prep: "für + Akk.", verb: "wecken" }, { noun: "im Mittelpunkt", prep: "", verb: "stehen" }, { noun: "zur Verfügung", prep: "", verb: "stehen" }, { noun: "Wert", prep: "auf + Akk.", verb: "legen" }, { noun: "eine Rolle", prep: "", verb: "spielen" }, { noun: "in Anspruch", prep: "", verb: "nehmen" }, { noun: "Erfahrungen", prep: "", verb: "sammeln" }, { noun: "Vergnügen", prep: "", verb: "bereiten" }, { noun: "Zeit", prep: "in + Akk.", verb: "investieren" }, { noun: "Ausdauer", prep: "", verb: "erfordern" }, { noun: "Spaß", prep: "an + Dat.", verb: "haben" }
];

const fillBlankData = [
  { sentence: "Am Wochenende wird lange geschlafen, um sich von der anstrengenden Arbeitswoche ___.", answer: "auszuruhen" }, { sentence: "Das ist ein Hobby, das mir hilft, einen ___ zum Stress zu finden.", answer: "Ausgleich" }, { sentence: "Ich höre abends gerne Musik, damit ich nach der Arbeit endlich zur ___ komme.", answer: "Ruhe" }, { sentence: "Ich fahre oft ans Meer, um einfach mal die Seele ___ zu lassen.", answer: "baumeln" }, { sentence: "Der Urlaub wird von vielen genutzt, um ___ vom Alltag zu gewinnen.", answer: "Abstand" }, { sentence: "Ein gutes Buch wird oft gelesen, damit man sich auf dem Sofa ___ kann.", answer: "entspannen" }, { sentence: "Ich gehe nach einem langen Tag joggen, um den Kopf frei zu ___.", answer: "bekommen" }, { sentence: "Der Sonntag ist da, damit wir uns von unseren Pflichten ___.", answer: "erholen" }, { sentence: "Spaziergänge, die im Wald gemacht werden, helfen mir beim ___.", answer: "Abschalten" }, { sentence: "Ich treffe meine Freunde, um bei Problemen auf andere ___ zu kommen.", answer: "Gedanken" }, { sentence: "Es ist wichtig, einem Hobby ___, das einem wirklich Spaß macht.", answer: "nachzugehen" }, { sentence: "Es muss regelmäßig Sport ___ werden, damit der Körper gesund bleibt.", answer: "getrieben" }, { sentence: "Es gibt viele tolle Möglichkeiten, wie die Freizeit kreativ ___ werden kann.", answer: "gestaltet" }, { sentence: "Ich nehme an einem Sprachkurs ___, der von der Schule organisiert wird.", answer: "teil" }, { sentence: "Wir machen am Samstag einen ___, um die schöne Natur zu genießen.", answer: "Ausflug" }, { sentence: "Am Wochenende wird oft etwas ___ unternommen, damit keine Langeweile aufkommt.", answer: "Spannendes" }, { sentence: "Das ist das Spiel, mit dem wir am liebsten unsere Zeit ___.", answer: "verbringen" }, { sentence: "Ich lese oft, um mir auf langen Zugfahrten die Zeit zu ___.", answer: "vertreiben" }, { sentence: "Ich liebe sportliche Aktivitäten, die im ___ gemacht werden.", answer: "Freien" }, { sentence: "Ich schwimme zweimal pro Woche, um auch im Alter in ___ zu bleiben.", answer: "Form" }, { sentence: "Am Freitagabend möchte ich unbedingt ins ___ gehen.", answer: "Kino" }, { sentence: "Man sollte sich oft mit Bekannten treffen, um seine Kontakte zu ___.", answer: "pflegen" }, { sentence: "Ich bin in einem Verein, damit ich neue Freundschaften ___.", answer: "schließe" }, { sentence: "Das ist der Kollege, mit dem ich mich für heute Abend ___ habe.", answer: "verabredet" }, { sentence: "Bei Mannschaftssportarten muss immer auf die anderen ___ genommen werden.", answer: "Rücksicht" }, { sentence: "Ich bin ___ in einem Sportverein, der schon lange existiert.", answer: "Mitglied" }, { sentence: "Viele Menschen suchen ein Projekt, um sich ehrenamtlich zu ___.", answer: "engagieren" }, { sentence: "Es werden kostenlose Kurse angeboten, um das Interesse für Kunst zu ___.", answer: "wecken" }, { sentence: "In meiner Freizeit stehen Aktivitäten im ___, die mir neue Energie geben.", answer: "Mittelpunkt" }, { sentence: "Die wenigen Stunden, die mir zur ___ stehen, nutze ich zum Lesen.", answer: "Verfügung" }, { sentence: "Ich lege großen ___ auf Hobbys, durch die ich etwas Neues lerne.", answer: "Wert" }, { sentence: "Genug Freizeit spielt eine große ___, damit wir auf Dauer nicht krank werden.", answer: "Rolle" }, { sentence: "Am Abend ___ ich mich meinem Garten, der im Sommer viel Pflege braucht.", answer: "widme" }, { sentence: "Mein neues Hobby, das sehr viel Zeit in ___ nimmt, ist das Fotografieren.", answer: "Anspruch" }, { sentence: "Ich suche noch einen Sport, für den ich mich richtig ___ kann.", answer: "begeistern" }, { sentence: "Reisen ist eine tolle Möglichkeit, um neue ___ im Ausland zu sammeln.", answer: "Erfahrungen" }, { sentence: "Es müssen Hobbys gefunden werden, die uns im Alltag ___ bereiten.", answer: "Vergnügen" }, { sentence: "Es wird viel Zeit in das Training ___, um das Turnier am Ende zu gewinnen.", answer: "investiert" }, { sentence: "Ich mache eine Sportart, die sehr viel ___ und mentale Geduld erfordert.", answer: "Ausdauer" }, { sentence: "Das Wichtigste ist, dass Aktivitäten gewählt werden, an denen man ___ hat.", answer: "Spaß" }
];


/* ============================================================
   2. DATA: KRACH IN DER W.G
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
<div class="dialogue-intro">
  <p>Anne und Elias wohnen seit Kurzem zusammen in einer <span class="vocab-word" data-meaning="سكن مشترك">WG</span>. Sie <span class="vocab-word" data-meaning="يتفاهم / ينسجم">verstehen sich</span> eigentlich ganz gut, doch immer wieder <span class="vocab-word" data-meaning="ينشب شجار" data-group="streit">kommt es</span> zwischen den beiden <span class="vocab-word" data-meaning="ينشب شجار" data-group="streit">zum Streit</span>, <span class="vocab-word" data-meaning="فيما يتعلق بـ" data-group="betrifft">was</span> die <span class="vocab-word" data-meaning="توزيع المهام">Aufgabenverteilung</span> im Haushalt <span class="vocab-word" data-meaning="فيما يتعلق بـ" data-group="betrifft">betrifft</span>.</p>
</div>
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

if(document.getElementById('krach-text-container')) {
  document.getElementById('krach-text-container').innerHTML = krachTextRaw;
}

if(document.getElementById('text1')) document.getElementById('text1').innerHTML = text1Raw;
if(document.getElementById('text2')) document.getElementById('text2').innerHTML = text2Raw;


/* ============================================================
   3. TOOLTIP & LINKED VERBS LOGIC
   ============================================================ */
function setupTooltips() {
  const tooltip = document.getElementById('custom-tooltip');
  
  document.addEventListener('click', (e) => {
    const word = e.target.closest('.vocab-word');
    document.querySelectorAll('.vocab-word.active-link').forEach(el => el.classList.remove('active-link'));
    
    if (word) {
      const groupId = word.dataset.group;
      if (groupId) {
        document.querySelectorAll(`.vocab-word[data-group="${groupId}"]`).forEach(el => el.classList.add('active-link'));
      } else {
        word.classList.add('active-link');
      }
      tooltip.textContent = word.dataset.meaning;
      tooltip.classList.remove('hidden');
      const rect = word.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.top = `${rect.top + window.scrollY - 10}px`;
    } else {
      tooltip.classList.add('hidden');
    }
  });

  window.addEventListener('scroll', () => { tooltip.classList.add('hidden'); });
}

/* ============================================================
   4. STATE & LOCALSTORAGE (FIXED CACHE VERSION)
   ============================================================ */
let reviewQueue = [];
let studyOrder = []; let studyPos = 0;

let krachReviewQueue = [];
let krachStudyOrder = []; let krachStudyPos = 0;

function loadFlashcardState() {
  const saved = localStorage.getItem('engyzmo_fc_state_v3');
  if (saved) {
    const state = JSON.parse(saved);
    reviewQueue = state.reviewQueue.map(verb => vocabData.find(item => item.verbindung === verb)).filter(Boolean);
    studyOrder = state.studyOrder || []; studyPos = state.studyPos || 0;
    
    krachReviewQueue = state.krachReviewQueue ? state.krachReviewQueue.map(verb => krachData.find(item => item.verbindung === verb)).filter(Boolean) : [];
    krachStudyOrder = state.krachStudyOrder || []; krachStudyPos = state.krachStudyPos || 0;
  } 
  
  if (studyOrder.length === 0) { studyOrder = shuffle(vocabData.map((_, i) => i)); studyPos = 0; }
  if (krachStudyOrder.length === 0) { krachStudyOrder = shuffle(krachData.map((_, i) => i)); krachStudyPos = 0; }
}

function saveFlashcardState() {
  const state = {
    reviewQueue: reviewQueue.map(item => item.verbindung),
    studyOrder: studyOrder, studyPos: studyPos,
    krachReviewQueue: krachReviewQueue.map(item => item.verbindung),
    krachStudyOrder: krachStudyOrder, krachStudyPos: krachStudyPos
  };
  localStorage.setItem('engyzmo_fc_state_v3', JSON.stringify(state));
}

/* ============================================================
   5. FLASHCARDS - FREIZEIT
   ============================================================ */
const flashcardGrid = document.getElementById('flashcard-grid');
const reviewBadge = document.getElementById('review-badge');
const reviewGrid = document.getElementById('review-grid');
const studyCardEl = document.getElementById('study-card');

function renderFlashcards(){
  if(!flashcardGrid) return;
  flashcardGrid.innerHTML = '';
  vocabData.forEach((item, index) => {
    const card = buildFlashcard(item, index);
    flashcardGrid.appendChild(card);
  });
}

function buildFlashcard(item, index, isReviewCard = false){
  const card = document.createElement('div');
  card.className = 'flip-card';
  card.innerHTML = `
    <div class="flip-card-inner">
      <div class="flip-front">
        <strong>${item.verbindung}</strong>
      </div>
      <div class="flip-back">
        <div class="arabic">${item.bedeutung}</div>
        <div class="example">${item.beispiel}</div>
        ${!isReviewCard 
          ? '<button class="review-btn" type="button">🔁 Needs Review</button>' 
          : '<button class="learned-btn" type="button">✅ Gelernt</button>'}
      </div>
    </div>
  `;
  card.addEventListener('click', (e) => {
    if (e.target.closest('.review-btn') || e.target.closest('.learned-btn')) return;
    card.classList.toggle('flipped');
  });

  if (!isReviewCard) {
    card.querySelector('.review-btn').addEventListener('click', (e) => {
      e.stopPropagation(); scheduleReview(item);
    });
  } else {
    card.querySelector('.learned-btn').addEventListener('click', (e) => {
      e.stopPropagation(); removeFromReview(item);
    });
  }
  return card;
}

function updateReviewQueueUI() {
  if(!reviewBadge) return;
  reviewBadge.textContent = reviewQueue.length;
  reviewGrid.innerHTML = '';
  if (reviewQueue.length === 0) {
    reviewGrid.innerHTML = '<p class="hint">Keine Karten zur Wiederholung. Super!</p>';
    return;
  }
  reviewQueue.forEach(item => {
    const card = buildFlashcard(item, -1, true);
    reviewGrid.appendChild(card);
  });
}

function scheduleReview(item){
  if (!reviewQueue.some(q => q.verbindung === item.verbindung)) {
    reviewQueue.push(item);
    const vIndex = vocabData.findIndex(v => v.verbindung === item.verbindung);
    const sIndex = studyOrder.indexOf(vIndex);
    if (sIndex > -1) {
      studyOrder.splice(sIndex, 1);
      if (studyPos >= studyOrder.length) studyPos = 0;
    }
    updateReviewQueueUI();
    saveFlashcardState();
    showToast('Karten zur Wiederholung hinzugefügt ✅');
  } else {
    showToast('Ist bereits in der Wiederholungs-Liste!');
  }
}

function removeFromReview(item) {
  reviewQueue = reviewQueue.filter(q => q.verbindung !== item.verbindung);
  updateReviewQueueUI(); saveFlashcardState();
  showToast('Aus Wiederholung entfernt! Gut gemacht 🎉');
}

function renderStudyCard(){
  if(!studyCardEl) return;
  const studyFrontText = document.getElementById('study-front-text');
  const studyBackGerman = document.getElementById('study-back-german');
  const studyBackArabic = document.getElementById('study-back-arabic');
  const studyBackExample = document.getElementById('study-back-example');
  const studyProgressLabel = document.getElementById('study-progress-label');
  const studyProgressFill = document.getElementById('study-progress-fill');

  if(studyOrder.length === 0) {
    studyFrontText.textContent = 'Alle Karten gelernt 🎉';
    studyBackGerman.textContent = ''; studyBackArabic.textContent = ''; studyBackExample.textContent = '';
    studyProgressLabel.textContent = '0 / 0'; studyProgressFill.style.width = '100%';
    return;
  }
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

if(studyCardEl) {
  studyCardEl.addEventListener('click', () => { studyCardEl.classList.toggle('flipped'); });
  document.getElementById('study-next').addEventListener('click', () => {
    if(studyOrder.length === 0) return;
    studyPos = (studyPos + 1) % studyOrder.length;
    saveFlashcardState(); renderStudyCard();
  });
  document.getElementById('study-prev').addEventListener('click', () => {
    if(studyOrder.length === 0) return;
    studyPos = (studyPos - 1 + studyOrder.length) % studyOrder.length;
    saveFlashcardState(); renderStudyCard();
  });
  document.getElementById('study-shuffle').addEventListener('click', () => {
    studyOrder = shuffle(studyOrder); studyPos = 0;
    saveFlashcardState(); renderStudyCard(); showToast('Karten gemischt 🔀');
  });
  document.getElementById('study-review-btn').addEventListener('click', (e) => {
    e.stopPropagation(); if(studyOrder.length === 0) return;
    const vocabIndex = studyOrder[studyPos];
    scheduleReview(vocabData[vocabIndex]);
    document.getElementById('study-next').click();
  });

  let sStartX = null, sStartY = null, sIsSwiping = false;
  studyCardEl.addEventListener('pointerdown', (e) => { sStartX = e.clientX; sStartY = e.clientY; sIsSwiping = true; });
  studyCardEl.addEventListener('pointerup', (e) => {
    if(!sIsSwiping || sStartX === null) return;
    const dx = e.clientX - sStartX; const dy = e.clientY - sStartY; sIsSwiping = false;
    if(Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)){
      if(dx < 0) document.getElementById('study-next').click(); else document.getElementById('study-prev').click();
    }
    sStartX = null; sStartY = null;
  });
}

/* ============================================================
   6. FLASHCARDS - KRACH IN DER W.G
   ============================================================ */
const krachFlashcardGrid = document.getElementById('krach-flashcard-grid');
const krachReviewBadge = document.getElementById('krach-review-badge');
const krachReviewGrid = document.getElementById('krach-review-grid');
const krachCardEl = document.getElementById('krach-card');

function renderKrachFlashcards(){
  if(!krachFlashcardGrid) return;
  krachFlashcardGrid.innerHTML = '';
  krachData.forEach((item, index) => {
    const card = buildKrachFlashcard(item, index);
    krachFlashcardGrid.appendChild(card);
  });
}

function buildKrachFlashcard(item, index, isReviewCard = false){
  const card = document.createElement('div');
  card.className = 'flip-card';
  card.innerHTML = `
    <div class="flip-card-inner">
      <div class="flip-front">
        <strong>${item.verbindung}</strong>
      </div>
      <div class="flip-back flashcard-back-v2" style="padding:12px; gap:4px; justify-content:center;">
        <div class="fc-section fc-bedeutung" style="text-align:center;">
          <h3 class="arabic-text" style="font-size:1.2rem;">${item.bedeutung}</h3>
        </div>
        <div class="fc-section fc-synonyme" style="margin-bottom:5px;">
          <p style="font-size:0.85rem; text-align:center;">${item.synonyme}</p>
        </div>
        <hr class="fc-divider" style="margin:4px 0;">
        <div class="fc-section fc-text-beispiel" style="margin:0;">
          <span class="fc-icon" style="font-size:0.9rem;">📖</span>
          <p style="font-size:0.75rem; line-height:1.2; text-align:left;">${item.beispielText}</p>
        </div>
        ${!isReviewCard 
          ? '<button class="review-btn" type="button" style="margin-top:auto; min-height:30px;">🔁 Needs Review</button>' 
          : '<button class="learned-btn" type="button" style="margin-top:auto; min-height:30px;">✅ Gelernt</button>'}
      </div>
    </div>
  `;
  
  card.addEventListener('click', (e) => {
    if (e.target.closest('.review-btn') || e.target.closest('.learned-btn')) return;
    card.classList.toggle('flipped');
  });

  if (!isReviewCard) {
    card.querySelector('.review-btn').addEventListener('click', (e) => {
      e.stopPropagation(); scheduleKrachReview(item);
    });
  } else {
    card.querySelector('.learned-btn').addEventListener('click', (e) => {
      e.stopPropagation(); removeFromKrachReview(item);
    });
  }
  return card;
}

function updateKrachReviewQueueUI() {
  if(!krachReviewBadge) return;
  krachReviewBadge.textContent = krachReviewQueue.length;
  krachReviewGrid.innerHTML = '';
  if (krachReviewQueue.length === 0) {
    krachReviewGrid.innerHTML = '<p class="hint">Keine Karten zur Wiederholung. Super!</p>';
    return;
  }
  krachReviewQueue.forEach(item => {
    const card = buildKrachFlashcard(item, -1, true);
    krachReviewGrid.appendChild(card);
  });
}

function scheduleKrachReview(item){
  if (!krachReviewQueue.some(q => q.verbindung === item.verbindung)) {
    krachReviewQueue.push(item);
    const vIndex = krachData.findIndex(v => v.verbindung === item.verbindung);
    const sIndex = krachStudyOrder.indexOf(vIndex);
    if (sIndex > -1) {
      krachStudyOrder.splice(sIndex, 1);
      if (krachStudyPos >= krachStudyOrder.length) krachStudyPos = 0;
    }
    updateKrachReviewQueueUI();
    saveFlashcardState();
    showToast('Karten zur Wiederholung hinzugefügt ✅');
  } else {
    showToast('Ist bereits in der Wiederholungs-Liste!');
  }
}

function removeFromKrachReview(item) {
  krachReviewQueue = krachReviewQueue.filter(q => q.verbindung !== item.verbindung);
  updateKrachReviewQueueUI(); saveFlashcardState();
  showToast('Aus Wiederholung entfernt! Gut gemacht 🎉');
}

function renderKrachStudyCard() {
  if(!krachCardEl) return;
  if(krachStudyOrder.length === 0) {
    document.getElementById('krach-front-text').textContent = 'Alle Karten gelernt 🎉';
    document.getElementById('krach-back-arabic').textContent = '';
    document.getElementById('krach-back-synonyme').textContent = '';
    document.getElementById('krach-back-textbeispiel').textContent = '';
    document.getElementById('krach-back-neuesbeispiel').textContent = '';
    document.getElementById('krach-progress-label').textContent = '0 / 0';
    document.getElementById('krach-progress-fill').style.width = '100%';
    return;
  }
  
  if(krachStudyPos >= krachStudyOrder.length) krachStudyPos = 0;
  const item = krachData[krachStudyOrder[krachStudyPos]];
  
  krachCardEl.classList.remove('flipped');
  document.getElementById('krach-front-text').textContent = item.verbindung;
  document.getElementById('krach-back-arabic').textContent = item.bedeutung;
  document.getElementById('krach-back-synonyme').textContent = item.synonyme;
  document.getElementById('krach-back-textbeispiel').textContent = item.beispielText;
  document.getElementById('krach-back-neuesbeispiel').textContent = item.beispielNeu;
  
  document.getElementById('krach-progress-label').textContent = `Karte ${krachStudyPos + 1} / ${krachStudyOrder.length}`;
  document.getElementById('krach-progress-fill').style.width = `${((krachStudyPos + 1) / krachStudyOrder.length) * 100}%`;
}

if(krachCardEl) {
  krachCardEl.addEventListener('click', () => { krachCardEl.classList.toggle('flipped'); });
  document.getElementById('krach-next').addEventListener('click', () => {
    if(krachStudyOrder.length === 0) return;
    krachStudyPos = (krachStudyPos + 1) % krachStudyOrder.length;
    saveFlashcardState(); renderKrachStudyCard();
  });
  document.getElementById('krach-prev').addEventListener('click', () => {
    if(krachStudyOrder.length === 0) return;
    krachStudyPos = (krachStudyPos - 1 + krachStudyOrder.length) % krachStudyOrder.length;
    saveFlashcardState(); renderKrachStudyCard();
  });
  document.getElementById('krach-shuffle').addEventListener('click', () => {
    krachStudyOrder = shuffle(krachStudyOrder); krachStudyPos = 0;
    saveFlashcardState(); renderKrachStudyCard(); showToast('Karten gemischt 🔀');
  });
  
  const studyReviewBtn = document.getElementById('krach-study-review-btn');
  if(studyReviewBtn) {
    studyReviewBtn.addEventListener('click', (e) => {
      e.stopPropagation(); if(krachStudyOrder.length === 0) return;
      const vocabIndex = krachStudyOrder[krachStudyPos];
      scheduleKrachReview(krachData[vocabIndex]);
      document.getElementById('krach-next').click();
    });
  }

  let kStartX = null, kStartY = null, kIsSwiping = false;
  krachCardEl.addEventListener('pointerdown', (e) => { kStartX = e.clientX; kStartY = e.clientY; kIsSwiping = true; });
  krachCardEl.addEventListener('pointerup', (e) => {
    if(!kIsSwiping || kStartX === null) return;
    const dx = e.clientX - kStartX; const dy = e.clientY - kStartY; kIsSwiping = false;
    if(Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)){
      if(dx < 0) document.getElementById('krach-next').click(); else document.getElementById('krach-prev').click();
    }
    kStartX = null; kStartY = null;
  });
}


/* ============================================================
   7. TOAST & SHUFFLE HELPERS
   ============================================================ */
let toastTimer;
function showToast(msg){
  const toast = document.getElementById('toast');
  toast.textContent = msg; toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function shuffle(arr){
  const a = [...arr];
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ============================================================
   8. INTERNAL NAVIGATION (Sub-tabs)
   ============================================================ */
const navStudy = document.getElementById('nav-study');
const navPractice = document.getElementById('nav-practice');
const studySection = document.getElementById('study-section');
const practiceSection = document.getElementById('practice-section');

if(navStudy) navStudy.addEventListener('click', () => {
  studySection.classList.add('active'); practiceSection.classList.remove('active');
  navStudy.classList.add('active'); navPractice.classList.remove('active');
});
if(navPractice) navPractice.addEventListener('click', () => {
  practiceSection.classList.add('active'); studySection.classList.remove('active');
  navPractice.classList.add('active'); navStudy.classList.remove('active');
});

document.querySelectorAll('.sub-nav').forEach(navGroup => {
  navGroup.querySelectorAll('.sub-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if(btn.hasAttribute('onclick')) return; // handled by switchKrachTab
      const parentSection = navGroup.parentElement;
      navGroup.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      parentSection.querySelectorAll('.sub-view').forEach(v => v.classList.remove('active'));
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });
});

/* Scoped Flashcards Toggle (Überblick / Lernmodus / Review) */
document.querySelectorAll('.fc-toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const parentContainer = btn.closest('.sub-view');
    parentContainer.querySelectorAll('.fc-toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    parentContainer.querySelectorAll('.fc-view').forEach(v => v.classList.remove('active'));
    document.getElementById(btn.dataset.fcview).classList.add('active');
    
    if (btn.dataset.fcview === 'study-view') renderStudyCard();
    if (btn.dataset.fcview === 'krach-study-view') renderKrachStudyCard();
  });
});

/* ============================================================
   9. PRACTICE MODE (Freizeit)
   ============================================================ */
function buildMCQ(){
  const container = document.getElementById('mcq-container');
  if(!container) return;
  container.innerHTML = '';
  const questions = shuffle(vocabData).slice(0, 25);
  questions.forEach((q, qIndex) => {
    const wrongPool = vocabData.filter(v => v.verbindung !== q.verbindung);
    const options = shuffle([q, ...shuffle(wrongPool).slice(0, 3)]);
    const item = document.createElement('div');
    item.className = 'mcq-item';
    item.innerHTML = `<div class="mcq-question">${qIndex + 1}. ${q.bedeutung}</div><div class="mcq-options"></div>`;
    const optionsWrap = item.querySelector('.mcq-options');
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'mcq-option'; btn.textContent = opt.verbindung;
      btn.addEventListener('click', () => {
        const allBtns = optionsWrap.querySelectorAll('.mcq-option');
        allBtns.forEach(b => b.classList.add('disabled'));
        if(opt.verbindung === q.verbindung){ btn.classList.add('correct'); } 
        else {
          btn.classList.add('wrong');
          allBtns.forEach(b => { if(b.textContent === q.verbindung) b.classList.add('correct'); });
        }
      });
      optionsWrap.appendChild(btn);
    });
    container.appendChild(item);
  });
}
buildMCQ();

function buildDragDrop(){
  const dropZonesEl = document.getElementById('drop-zones');
  const verbBankEl = document.getElementById('verb-bank');
  if(!dropZonesEl) return;
  dropZonesEl.innerHTML = ''; verbBankEl.innerHTML = '';
  dragDropData.forEach((pair, index) => {
    const row = document.createElement('div');
    row.className = 'drop-row';
    row.innerHTML = `<span class="noun">${pair.noun}</span> ${pair.prep ? `<span style="color:var(--muted); font-size:0.85rem;">(${pair.prep})</span>` : ''} <div class="drop-zone" data-answer="${pair.verb}" data-index="${index}">Verb hier ablegen</div>`;
    dropZonesEl.appendChild(row);
    const zone = row.querySelector('.drop-zone');
    zone.addEventListener('click', () => {
      if(zone.dataset.filled === 'true'){
        const chip = document.getElementById(zone.dataset.chipId);
        if(chip) chip.classList.remove('used');
        zone.textContent = 'Verb hier ablegen'; zone.classList.remove('correct', 'wrong');
        delete zone.dataset.filled; delete zone.dataset.given; delete zone.dataset.chipId;
      }
    });
  });

  const shuffledForBank = shuffle(dragDropData);
  shuffledForBank.forEach((pair, i) => {
    const chip = document.createElement('div');
    chip.className = 'verb-chip'; chip.id = `verb-chip-${i}`; chip.textContent = pair.verb;
    chip.addEventListener('pointerdown', (e) => {
      if(chip.classList.contains('used')) return;
      e.preventDefault();
      const rect = chip.getBoundingClientRect();
      const ghost = chip.cloneNode(true);
      ghost.classList.add('drag-ghost'); ghost.style.width = rect.width + 'px';
      document.body.appendChild(ghost);

      function moveGhost(x, y){ ghost.style.left = (x - rect.width / 2) + 'px'; ghost.style.top = (y - rect.height / 2) + 'px'; }
      moveGhost(e.clientX, e.clientY); chip.style.opacity = '0.35';

      function clearOverStates(){ document.querySelectorAll('.drop-zone.over').forEach(z => z.classList.remove('over')); }
      function onMove(ev){
        moveGhost(ev.clientX, ev.clientY); clearOverStates();
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        const zone = el && el.closest && el.closest('.drop-zone');
        if(zone && zone.dataset.filled !== 'true') zone.classList.add('over');
      }
      function onUp(ev){
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        const zone = el && el.closest && el.closest('.drop-zone');
        clearOverStates();
        if(zone && zone.dataset.filled !== 'true'){
          zone.textContent = pair.verb; zone.dataset.filled = 'true'; zone.dataset.given = pair.verb; zone.dataset.chipId = chip.id;
          chip.classList.add('used');
          if(pair.verb.toLowerCase() === zone.dataset.answer.toLowerCase()){ zone.classList.add('correct'); zone.classList.remove('wrong'); } 
          else { zone.classList.add('wrong'); zone.classList.remove('correct'); }
        }
        chip.style.opacity = ''; ghost.remove();
        document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); document.removeEventListener('pointercancel', onUp);
      }
      document.addEventListener('pointermove', onMove); document.addEventListener('pointerup', onUp); document.addEventListener('pointercancel', onUp);
    });
    verbBankEl.appendChild(chip);
  });
}
if(document.getElementById('reset-dnd')) document.getElementById('reset-dnd').addEventListener('click', buildDragDrop);
buildDragDrop();

function buildFillBlank(){
  const container = document.getElementById('fillblank-container');
  if(!container) return;
  container.innerHTML = '';
  fillBlankData.forEach((item, index) => {
    const parts = item.sentence.split('___');
    const div = document.createElement('div');
    div.className = 'fb-item';
    div.innerHTML = `${index + 1}. ${parts[0]} <input type="text" data-answer="${item.answer}" autocomplete="off"> ${parts[1] || ''}`;
    container.appendChild(div);

    const input = div.querySelector('input');
    input.addEventListener('change', () => {
      const given = input.value.trim().toLowerCase(); const answer = input.dataset.answer.toLowerCase();
      if(given === answer){ input.classList.add('correct'); input.classList.remove('wrong'); } 
      else { input.classList.add('wrong'); input.classList.remove('correct'); }
    });
  });
}
buildFillBlank();
