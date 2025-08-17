// quiz.js — lógica do quiz + enigma
// Regras atendidas:
// - 15 perguntas principais + 3 extras para pulos (todas já existentes)
// - Embaralha perguntas a cada tentativa
// - Slot é posicional (1..15). Pular NÃO avança o slot: traz outra pergunta para o MESMO slot
// - 3 pulos, 3 pausas (60s), 3 dicas, 3 usos de 50/50
// - Pode estourar tempo até 3 vezes; no 4º reinicia o quiz
// - Errou uma questão → reinicia
// - Ao finalizar: mostra lista de números (um por linha) que decodifica "AMO VOCE PRINCESA"

// Separar 15 perguntas principais das 3 extras para pulos
const MAIN_QUESTIONS = QUESTIONS.slice(0, 15); // Primeiras 15 perguntas
const EXTRA_QUESTIONS = QUESTIONS.slice(15); // Últimas 3 perguntas (16, 17, 18)

let remainingQuestions = shuffle(MAIN_QUESTIONS.slice()); // fila das perguntas principais
let extraQuestions = shuffle(EXTRA_QUESTIONS.slice()); // fila das perguntas extras
let slotIndex = 0; // 0..14 (posição atual)
let timeoutsUsed = 0;
let skipsLeft = 3;
let pausesLeft = 3;
let fiftyLeft = 3;
let hintsLeft = 3;
let paused = false;
let timerInterval = null;
let remaining = 0;

const els = {
  slotNum: document.getElementById('slotNum'),
  qTitle: document.getElementById('qTitle'),
  diffBadge: document.getElementById('diffBadge'),
  options: document.getElementById('options'),
  timer: document.getElementById('timer'),
  timeouts: document.getElementById('timeoutsCount'),
  btnSkip: document.getElementById('btnSkip'),
  btnPause: document.getElementById('btnPause'),
  btn5050: document.getElementById('btn5050'),
  btnHint: document.getElementById('btnHint'),
  finishModal: document.getElementById('finishModal'),
  codeList: document.getElementById('codeList'),
  btnCopy: document.getElementById('btnCopy'),
  // novo: referencia direta ao badge da questão
  slotBadge: document.getElementById('slotBadge'),
};

function openModal(title,msg){
  // Modal removido - usar alert temporário
  alert(`${title}\n\n${msg}`);
}
function closeModal(){
  // Modal removido - não fazer nada
}
window.closeModal = closeModal;

function resetQuiz(){
  clearInterval(timerInterval);
  remainingQuestions = shuffle(MAIN_QUESTIONS.slice());
  extraQuestions = shuffle(EXTRA_QUESTIONS.slice());
  slotIndex = 0;
  timeoutsUsed = 0;
  skipsLeft = 3;
  pausesLeft = 3;
  fiftyLeft = 3;
  hintsLeft = 3;
  paused = false;
  setProgress(0);                  // barra começa em 0/15
  updateTimeoutsBadge();
  renderQuestion();
}

function currentQuestion(){
  return remainingQuestions[0];
}

function startTimerFor(difficulty){
  clearInterval(timerInterval);
  const secs = difficulty==='Fácil' ? 30 : (difficulty==='Médio' ? 60 : 90);
  remaining = secs;
  updateTimerLabel();
  timerInterval = setInterval(()=>{
    if(!paused){
      remaining -= 1;
      if(remaining <= 0){
        clearInterval(timerInterval);
        timeoutsUsed += 1;
        updateTimeoutsBadge(); // << atualiza "x/3" corretamente
        if(timeoutsUsed >= 4){
          openModal('⏰ Tempo esgotado','Estourou o tempo 4 vezes. O quiz vai reiniciar.');
          setTimeout(resetQuiz, 1200);
          return;
        } else {
          openModal('⏰ Tempo esgotado',`Você estourou o tempo (${timeoutsUsed}/3). Vamos tentar esta questão novamente.`);
          setTimeout(()=>{ closeModal(); renderQuestion(); }, 1200);
          return;
        }
      }
      updateTimerLabel();
    }
  }, 1000);
}

function updateTimerLabel(){
  els.timer.textContent = fmtTime(remaining);
}

function renderQuestion(){
  clearInterval(timerInterval);
  const q = currentQuestion();
  if(!q){ return showFinish(); }

  // Questão N/15 com espaço garantido
  if (els.slotBadge) {
    els.slotBadge.innerHTML = `Questão&nbsp;<span id="slotNum">${slotIndex+1}</span>/${totalQuestions()}`;
    els.slotNum = document.getElementById('slotNum');
  }

  // Progresso “antes de responder”: usa slot atual (0/15 na primeira questão)
  setProgress(slotIndex / totalQuestions());

  els.qTitle.textContent = q.question;

  // Dificuldade
  els.diffBadge.textContent = q.difficulty;
  els.diffBadge.className = 'badge';
  if(q.difficulty === 'Fácil') els.diffBadge.classList.add('easy');
  else if(q.difficulty === 'Médio') els.diffBadge.classList.add('medium');
  else els.diffBadge.classList.add('hard');

  updateTimeoutsBadge(); // normaliza “Estouros: x/3”

  els.options.innerHTML='';
  q.options.forEach((opt, idx)=>{
    const btn = document.createElement('button');
    btn.className='option';
    btn.textContent = String.fromCharCode(65+idx)+') '+opt;
    btn.addEventListener('click',()=>select(idx));
    els.options.appendChild(btn);
  });

  // botões de ajuda
  els.btnSkip.textContent = `⏭️ Pular (${skipsLeft})`;
  els.btnPause.textContent = `⏸️ Pausar (${pausesLeft})`;
  els.btn5050.textContent = `🎯 50/50 (${fiftyLeft})`;
  els.btnHint.textContent = `💡 Dica (${hintsLeft})`;

  startTimerFor(q.difficulty);
}

function select(idx){
  const q = currentQuestion();
  const correct = q.correct;
  const btns = Array.from(els.options.querySelectorAll('.option'));
  btns.forEach((b,i)=>{
    if(i===correct) b.classList.add('correct');
    if(i===idx && i!==correct) b.classList.add('incorrect');
    b.classList.add('disabled');
  });
  clearInterval(timerInterval);

  if(idx!==correct){
    setTimeout(()=>{
      openModal('❌ Errou :(','Resposta incorreta. O quiz vai reiniciar.');
      setTimeout(resetQuiz, 1200);
    }, 400);
    return;
  }

  // acertou → anima a barra para o próximo slot ainda nesta tela
  const nextProgress = Math.min((slotIndex + 1) / totalQuestions(), 1);
  setProgress(nextProgress);

  // consome a pergunta e avança o slot
  setTimeout(()=>{
    remainingQuestions.shift();
    slotIndex += 1;
    if(slotIndex>=totalQuestions()){
      showFinish();
    } else {
      renderQuestion(); // na próxima tela a barra já está no novo valor e não “salta”
    }
  }, 400);
}

els.btnSkip.addEventListener('click',()=>{
  if(skipsLeft<=0) return;
  skipsLeft -= 1;
  
  // Se tem perguntas extras disponíveis, usa uma delas
  if(extraQuestions.length > 0) {
    const extraQ = extraQuestions.shift();
    // Substitui a pergunta atual pela extra
    remainingQuestions[0] = extraQ;
  } else {
    // ROTACIONA a pergunta atual para o final,
    // mantendo o MESMO slot (não avança slotIndex)
    const q = remainingQuestions.shift();
    remainingQuestions.push(q);
  }
  
  renderQuestion();
});

els.btnPause.addEventListener('click',()=>{
  if(pausesLeft<=0) return;
  pausesLeft -= 1;
  els.btnPause.textContent = `⏸️ Pausar (${pausesLeft})`;
  paused = true;
  openModal('⏸️ Pausado','Tempo pausado por 60 segundos.');
  setTimeout(()=>{ paused=false; closeModal(); }, 60000);
});

els.btn5050.addEventListener('click',()=>{
  if(fiftyLeft<=0) return;
  const q = currentQuestion();
  fiftyLeft -= 1;
  els.btn5050.textContent = `🎯 50/50 (${fiftyLeft})`;
  const btns = Array.from(els.options.querySelectorAll('.option'));
  const keep = q.fifty_keep || [q.correct]; // fallback
  btns.forEach((b,i)=>{
    if(!keep.includes(i)) {
      b.classList.add('disabled');
      b.style.opacity = .45;
      b.style.pointerEvents = 'none';
    }
  });
});

els.btnHint.addEventListener('click',()=>{
  if(hintsLeft<=0) return;
  const q = currentQuestion();
  hintsLeft -= 1;
  els.btnHint.textContent = `💡 Dica (${hintsLeft})`;
  openModal('💡 Dica', q.hint || 'Sem dica para esta.');
});

function showFinish(){
  const list = SLOT_CODES.map(n=>String(n)).join('\n');
  els.codeList.value = list;
  setProgress(1); // enche a barra
  els.finishModal.classList.add('show');
}

// Copiar lista (Clipboard API + fallback)
function getCodesText(){
  const txt = (els.codeList && els.codeList.value) ? els.codeList.value : '';
  if (txt && txt.trim()) return txt;
  // garante conteúdo mesmo se textarea ainda não tiver sido preenchida
  if (typeof SLOT_CODES !== 'undefined' && Array.isArray(SLOT_CODES)){
    return SLOT_CODES.map(String).join('\n');
  }
  return '';
}

async function copyToClipboard(text){
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch(_) { /* continua no fallback */ }
  // fallback
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly','');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch(_){
    return false;
  }
}

function flashCopyResult(ok){
  if (!els.btnCopy) return;
  const original = els.btnCopy.textContent;
  els.btnCopy.disabled = true;
  els.btnCopy.textContent = ok ? '✅ Copiado!' : '⚠️ Copie manualmente';
  setTimeout(()=>{
    els.btnCopy.textContent = original;
    els.btnCopy.disabled = false;
  }, 1400);
}

function setupCopyButton(){
  if (!els.btnCopy) return;
  els.btnCopy.addEventListener('click', async ()=>{
    const text = getCodesText();
    const ok = await copyToClipboard(text);
    flashCopyResult(ok);
    // opcional: seleciona o textarea para backup manual
    if (!ok && els.codeList){
      els.codeList.focus();
      els.codeList.select();
    }
  });
}

// === Barra de progresso (DOM real, sem depender de CSS) ===
function getQuizCardEl() {
  return document.getElementById('quizCard')
      || els.qTitle?.closest('.card')
      || document.querySelector('.card');
}

// Cria a barra se não existir e retorna { card, track, bar }
function ensureProgressBar() {
  const card = getQuizCardEl();
  if (!card) return null;

  // garante posição e espaço pro rodapé da barra
  card.style.position = 'relative';
  if (!card.style.paddingBottom || parseInt(card.style.paddingBottom, 10) < 32) {
    card.style.paddingBottom = '36px';
  }

  let track = card.querySelector('.q-progress');
  if (!track) {
    track = document.createElement('div');
    track.className = 'q-progress';
    Object.assign(track.style, {
      position: 'absolute',
      left: '16px',
      right: '16px',
      bottom: '12px',
      height: '8px',
      borderRadius: '999px',
      background: 'rgba(167,139,250,.18)',
      boxShadow: 'inset 0 0 0 1px rgba(167,139,250,.25)',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: '1'
    });

    const bar = document.createElement('div');
    bar.className = 'q-progress__bar';
    Object.assign(bar.style, {
      height: '100%',
      width: '0%',
      background: 'linear-gradient(90deg,#7c3aed,#a78bfa)',
      transition: 'width .28s ease'
    });

    track.appendChild(bar);
    card.appendChild(track);
  }

  const bar = track.querySelector('.q-progress__bar');
  return { card, track, bar };
}

// Atualiza a largura (0..1)
function setProgress(p) {
  const pb = ensureProgressBar();
  if (!pb) return;
  const pct = Math.max(0, Math.min(1, p));
  pb.bar.style.width = (pct * 100).toFixed(2) + '%';
}

// “Estouros: x/3” sem espaço quebrado
function updateTimeoutsBadge(){
  const wrap = (els.timeouts && els.timeouts.parentElement) || document.getElementById('timeoutsCount')?.parentElement;
  if (wrap) {
    wrap.innerHTML = `💥 Estouros: <span id="timeoutsCount">${timeoutsUsed}/3</span>`;
    els.timeouts = document.getElementById('timeoutsCount');
  }
}

// Retorna o total de questões (slots do quiz)
function totalQuestions(){
  return (typeof MAIN_QUESTIONS !== 'undefined' && Array.isArray(MAIN_QUESTIONS) && MAIN_QUESTIONS.length)
    ? MAIN_QUESTIONS.length
    : 15;
}

// Inicializa barra já na carga
document.addEventListener('DOMContentLoaded', () => {
  ensureProgressBar();
  setProgress(0);
  setupCopyButton(); // <- ativa o botão Copiar
});

// inicializa
renderQuestion();

