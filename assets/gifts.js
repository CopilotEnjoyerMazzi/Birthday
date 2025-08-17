// gifts.js — sistema de presentes aleatórios
const GIFTS = [
  {
    id: 'gift1',
    title: '📱 Nossa primeira mensagem',
    content: 'Foi assim que tudo começou...',
    media: 'assets/media/1msg.jpg',
    type: 'image'
  },
  {
    id: 'gift2',
    title: '📞 Nossa primeira call',
    content: 'A primeira vez que ouvi sua voz...',
    media: 'assets/media/1call.jpg',
    type: 'image'
  },
  {
    id: 'gift3',
    title: '💕 Nosso primeiro conexo',
    content: 'Lembro como se fosse ontem...',
    media: 'assets/media/1conexo.jpg',
    type: 'image'
  },
  {
    id: 'gift4',
    title: '😤 Ciuminhos',
    content: 'Desde o primeiro dia né princesa?',
    media: 'assets/media/1ciumes.jpg',
    type: 'image'
  },
  {
    id: 'gift5',
    title: '🛁 Banho 1',
    content: 'Ria imediatamente',
    media: 'assets/media/banho1.jpg',
    type: 'image'
  },
  {
    id: 'gift6',
    title: '🛁 Banho 2',
    content: 'Ria imediatamente 2',
    media: 'assets/media/banho2.jpg',
    type: 'image'
  },
  {
    id: 'gift7',
    title: '🎵 Imitações',
    content: 'Amo suas imitações...',
    media: 'assets/media/imitacoes.mp3',
    type: 'audio'
  },
  {
    id: 'gift8',
    title: '📞 Call mais longa',
    content: 'Nossa call mais longa... dormir com você é incrível.',
    media: 'assets/media/callmaislonga.jpg',
    type: 'image'
  }
];

// Posições aleatórias para os presentes (em áreas vazias)
// Evitando sobreposição com qualquer elemento da página
const GIFT_POSITIONS = [
  // Canto superior direito (área vazia)
  { top: '5%', left: '92%' },
  { top: '8%', left: '88%' },
  { top: '12%', left: '94%' },
  
  // Canto superior esquerdo (área vazia)
  { top: '3%', left: '2%' },
  { top: '7%', left: '6%' },
  { top: '11%', left: '3%' },
  
  // Canto inferior direito (área vazia) - EVITANDO controlador de música
  { top: '70%', left: '88%' },
  { top: '75%', left: '85%' },
  { top: '80%', left: '90%' },
  
  // Canto inferior esquerdo (área vazia)
  { top: '85%', left: '3%' },
  { top: '90%', left: '7%' },
  { top: '94%', left: '5%' },
  
  // Áreas laterais centrais (vazias)
  { top: '35%', left: '94%' },
  { top: '45%', left: '2%' },
  { top: '55%', left: '92%' },
  { top: '65%', left: '5%' },
  
  // Áreas superiores e inferiores (vazias)
  { top: '15%', left: '15%' },
  { top: '25%', left: '80%' },
  { top: '65%', left: '20%' },
  { top: '70%', left: '75%' },
  
  // Áreas centrais (vazias) - mais seguras
  { top: '20%', left: '50%' },
  { top: '40%', left: '15%' },
  { top: '50%', left: '80%' },
  { top: '60%', left: '50%' },
  
  // Áreas intermediárias (vazias)
  { top: '30%', left: '25%' },
  { top: '35%', left: '70%' },
  { top: '45%', left: '35%' },
  { top: '55%', left: '65%' }
];

// Distância mínima entre presentes (em px)
const MIN_GIFT_DISTANCE = 110;

// Função para verificar se uma posição é segura (não sobrepõe elementos)
function isPositionSafe(top, left) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // top/left são o CENTRO do presente (por causa do translate(-50%,-50%))
  const centerY = (parseFloat(top) / 100) * vh;
  const centerX = (parseFloat(left) / 100) * vw;
  const half = 20; // metade do tamanho (gift 40x40)

  // Margens de segurança (nav/topo e rodapé/controladores)
  if (centerY - half < 72) return false;
  if (centerY + half > vh - 96) return false;
  if (centerX - half < 16) return false;
  if (centerX + half > vw - 16) return false;

  // Evitar controlador de música (canto inferior direito)
  const ctrlTop = vh - 180, ctrlLeft = vw - 260;
  if (centerY + half > ctrlTop && centerX + half > ctrlLeft) return false;

  // Em cores.html: não colocar presente dentro do .container (grade/cards)
  const page = (location.pathname.split('/').pop()||'index.html').toLowerCase();
  const container = document.querySelector('.container');
  if (container) {
    const r = container.getBoundingClientRect();
    const insideContainer = centerX >= r.left && centerX <= r.right && centerY >= r.top && centerY <= r.bottom;
    if (page === 'cores.html' && insideContainer) return false;
  }

  // Hit-tests em múltiplos pontos para evitar UI/controles
  const samples = [
    [centerX, centerY],
    [Math.min(centerX + half, vw - 1), centerY],
    [Math.max(centerX - half, 0), centerY],
    [centerX, Math.min(centerY + half, vh - 1)],
    [centerX, Math.max(centerY - half, 0)]
  ];
  for (const [x, y] of samples) {
    const node = document.elementFromPoint(x, y);
    if (node && node.closest('.btn, .option, .nav, .toolbar, input, textarea, a, .modal.show, .card, .letter, .color-bubble, #colorsGrid, #lockGate, #colorsArea .card')) {
      return false;
    }
  }

  return true;
}

// Verifica proximidade entre posições (percentuais)
function isPositionTooClosePct(newTopPct, newLeftPct, used) {
  const vw = window.innerWidth, vh = window.innerHeight;
  const nx = (newLeftPct / 100) * vw;
  const ny = (newTopPct / 100) * vh;
  return used.some(p => {
    const px = (p.leftPct / 100) * vw;
    const py = (p.topPct / 100) * vh;
    const d = Math.hypot(nx - px, ny - py);
    return d < MIN_GIFT_DISTANCE;
  });
}

// Embaralhar presentes e posições
const shuffledGifts = shuffle(GIFTS.slice());
const shuffledPositions = shuffle(GIFT_POSITIONS.slice());

// Criar presentes aleatórios na página
function createRandomGifts() {
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (currentPage === 'quiz.html') return;

  // 8 presentes por página (limitado ao total disponível)
  const numGifts = Math.min(8, GIFTS.length);

  let giftsCreated = 0;
  document.querySelectorAll('.random-gift').forEach(n => n.remove());

  const usedPositions = [];
  const positions = shuffledPositions.length ? shuffledPositions.slice() : shuffle(GIFT_POSITIONS.slice());

  for (let i = 0; i < positions.length && giftsCreated < numGifts; i++) {
    const pos = positions[i];
    const topPct = parseFloat(pos.top);
    const leftPct = parseFloat(pos.left);

    if (!isPositionSafe(pos.top, pos.left)) continue;
    if (isPositionTooClosePct(topPct, leftPct, usedPositions)) continue;

    // Criar presente
    const gift = shuffledGifts[giftsCreated % shuffledGifts.length];
    const giftElement = document.createElement('div');
    giftElement.className = 'random-gift';
    giftElement.style.cssText = `
      position: fixed;
      top: ${pos.top};
      left: ${pos.left};
      transform: translate(-50%, -50%);
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #ffcbf2, #a78bfa, #7c3aed);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      z-index: 1100;
      box-shadow: 0 6px 20px rgba(0,0,0,.3);
      transition: transform .15s ease, box-shadow .2s ease;
      font-size: 20px;
      pointer-events: auto;
    `;
    giftElement.innerHTML = `<span class="gift-emoji">🎁</span>`;
    giftElement.title = 'Clique para abrir';

    giftElement.addEventListener('mouseenter', () => {
      giftElement.style.transform = 'translate(-50%, -50%) scale(1.05)';
      giftElement.style.boxShadow = '0 10px 28px rgba(0,0,0,.38)';
    });
    giftElement.addEventListener('mouseleave', () => {
      giftElement.style.transform = 'translate(-50%, -50%)';
      giftElement.style.boxShadow = '0 6px 20px rgba(0,0,0,.3)';
    });
    giftElement.addEventListener('click', (e) => {
      e.stopPropagation();
      showGift(gift);
    });

    document.body.appendChild(giftElement);

    usedPositions.push({ topPct, leftPct });
    giftsCreated++;
  }

  console.log(`Presentes criados: ${giftsCreated}/${numGifts}`);
  if (typeof rebalanceGifts === 'function') setTimeout(rebalanceGifts, 50);
}

// Utils
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function allowsGifts(){
  const page = (location.pathname.split('/').pop()||'index.html').toLowerCase();
  if (page === 'quiz.html') return false;
  // Em cores, só após desbloqueio (colorsUnlocked = '1')
  if (page === 'cores.html' && localStorage.getItem('colorsUnlocked') !== '1') return false;
  return true;
}

// Visualizador fullscreen simples (abre a imagem inteira com botão Fechar)
(function(){
  function ensureImageViewer(){
    if (document.getElementById('imgViewer')) return;

    // estilos específicos do viewer (uma vez só)
    if (!document.getElementById('imgViewerStyles')) {
      const st = document.createElement('style');
      st.id = 'imgViewerStyles';
      st.textContent = `
        #imgViewer .iv-close{
          position:absolute; top:16px; right:16px; z-index:2;
          display:inline-flex; align-items:center; gap:8px;
          padding:8px 12px; border-radius:12px; cursor:pointer;
          color:#fff; border:1px solid #ffffff2e;
          background: linear-gradient(135deg, rgba(11,15,26,.7), rgba(28,32,48,.7));
          backdrop-filter: blur(3px) saturate(1.2);
          box-shadow: 0 8px 24px rgba(0,0,0,.35);
          transition: transform .15s ease, background .2s ease, box-shadow .2s ease;
          font-weight: 700;
        }
        #imgViewer .iv-close:hover{
          transform: translateY(-1px);
          background: linear-gradient(135deg, rgba(11,15,26,.8), rgba(28,32,48,.85));
          box-shadow: 0 12px 30px rgba(0,0,0,.45);
        }
        #imgViewer .iv-close:active{ transform: translateY(0) scale(.98); }
        #imgViewer .iv-img{
          max-width: 96vw; max-height: 92vh; object-fit: contain; border-radius: 12px;
          box-shadow: 0 12px 40px rgba(0,0,0,.5);
        }
      `;
      document.head.appendChild(st);
    }

    var o = document.createElement('div');
    o.id = 'imgViewer';
    o.style.cssText = 'position:fixed;inset:0;z-index:10000;display:none;background:rgba(0,0,0,.88);backdrop-filter:blur(2px);align-items:center;justify-content:center;';
    o.innerHTML = '\
      <button id="ivClose" class="iv-close" aria-label="Fechar"><span>Fechar</span><span aria-hidden="true">✕</span></button>\
      <img id="ivImg" class="iv-img" alt=""/>\
    ';
    document.body.appendChild(o);

    o.addEventListener('click', function(e){ if (e.target === o) closeImageViewer(); });
    document.getElementById('ivClose').addEventListener('click', closeImageViewer);
    document.addEventListener('keydown', function(e){ var open = (o.style.display !== 'none'); if (open && e.key === 'Escape') closeImageViewer(); });
    window._imgViewer = o;
  }
  window.openImageViewer = function(src, alt){
    ensureImageViewer();
    var o = window._imgViewer;
    var img = o.querySelector('#ivImg');
    img.src = src; img.alt = alt || '';
    o.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };
  window.closeImageViewer = function(){
    var o = window._imgViewer; if (!o) return;
    o.style.display = 'none';
    o.querySelector('#ivImg').src = '';
    document.body.style.overflow = '';
  };
})();

// Fecha modal (pausa áudios e retoma Real Man se estava suspenso)
window.closeGift = function(){
  const m = document.getElementById('giftModal');
  if (!m) return;
  m.querySelectorAll('audio').forEach(function(a){
    try { a.pause(); a.currentTime = 0; } catch(_) {}
  });
  m.classList.remove('show');
  // retomar fluxo da música de fundo quando relevante
  if (typeof window.stopAllCustomAudio === 'function') window.stopAllCustomAudio();
};

// Mostrar presente (imagem: abre fullscreen quando necessário)
function showGift(gift) {
  const modal = document.getElementById('giftModal');
  if (!modal) { console.error('Modal de presente não encontrado'); return; }

  const title = modal.querySelector('#giftTitle');
  const content = modal.querySelector('#giftContent');
  const media = modal.querySelector('#giftMedia');
  if (!title || !content || !media) { console.error('Elementos do modal não encontrados'); return; }

  title.textContent = gift.title;
  content.textContent = gift.content;
  media.innerHTML = '';

  if (gift.type === 'image') {
    // Container fixo, sem zoom
    const stage = document.createElement('div');
    stage.style.cssText = 'position:relative;width:100%;height:min(60vh,72vh);overflow:hidden;border-radius:12px;background:rgba(0,0,0,.22);display:flex;align-items:center;justify-content:center;';

    const img = new Image();
    img.src = gift.media;
    img.alt = gift.title || 'Imagem';
    img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.35);user-select:none;-webkit-user-drag:none;';

    const expandBtn = document.createElement('button');
    expandBtn.textContent = 'Tela cheia ⤢';
    expandBtn.style.cssText = 'position:absolute;right:10px;bottom:10px;padding:6px 10px;border-radius:10px;cursor:pointer;background:rgba(0,0,0,.6);color:#fff;border:1px solid #ffffff33;display:none;';
    expandBtn.addEventListener('click', function(e){ e.stopPropagation(); openImageViewer(img.src, img.alt); });

    img.addEventListener('load', function(){
      const r = stage.getBoundingClientRect();
      const needs = (img.naturalWidth > r.width + 8) || (img.naturalHeight > r.height + 8);
      if (needs) {
        expandBtn.style.display = 'inline-block';
        // clique no próprio stage abre fullscreen
        stage.addEventListener('click', function(){ openImageViewer(img.src, img.alt); }, { once: true });
      }
    });

    stage.appendChild(img);
    stage.appendChild(expandBtn);
    media.appendChild(stage);
  } else if (gift.type === 'audio') {
    // Pausa qualquer <audio> nativo tocando
    document.querySelectorAll('audio').forEach(function(a){ try{ a.pause(); }catch(_){} });

    const audioContainer = document.createElement('div');
    audioContainer.className = 'custom-audio-player';
    audioContainer.style.cssText = 'width:100%;max-width:560px;margin:8px auto;display:flex;align-items:center;justify-content:center;';

    const audioEl = document.createElement('audio');
    audioEl.src = gift.media;
    audioEl.preload = 'metadata';
    audioEl.controls = true;
    audioEl.style.cssText = 'width:100%;display:block;border-radius:10px;';

    if (typeof window.createCustomAudioPlayer === 'function') {
      window.createCustomAudioPlayer(audioEl, audioContainer);
    } else {
      audioContainer.appendChild(audioEl);
    }
    media.appendChild(audioContainer);
  }

  modal.classList.add('show');
}

// Fallback local caso o patch ainda não tenha definido ensureGiftModal
function __ensureGiftModalFallback(){
  let m = document.getElementById('giftModal');
  if (m) return;
  m = document.createElement('div');
  m.id = 'giftModal';
  m.className = 'modal';
  m.innerHTML = `
    <div class="dialog">
      <h3 id="giftTitle">Presente</h3>
      <p id="giftContent" class="muted"></p>
      <div id="giftMedia"></div>
      <div class="row center" style="margin-top:12px">
        <button class="btn" onclick="closeGift && closeGift()">Fechar</button>
      </div>
    </div>`;
  document.body.appendChild(m);
}

// INIT: respeita gate do index e bloqueio das cores
document.addEventListener('DOMContentLoaded', function(){
  // Usa a versão global se existir; senão, usa o fallback local
  if (typeof ensureGiftModal === 'function') ensureGiftModal();
  else __ensureGiftModalFallback();

  function startGifts(){
    if (!allowsGifts()) return;
    document.body.classList.add('gifts-on');
    createRandomGifts();
    if (typeof rebalanceGifts === 'function') setTimeout(rebalanceGifts, 120);
  }

  const gate = document.querySelector('.entry-content');
  if (gate) {
    // Espera o clique de entrada
    window.addEventListener('experience:entered', startGifts, { once: true });
  } else {
    startGifts();
  }
});

// Protege o listener de resize
addEventListener('resize', function(){
  if (typeof rebalanceGifts === 'function') setTimeout(rebalanceGifts,150);
});