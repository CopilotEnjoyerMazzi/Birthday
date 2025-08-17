// main.js — música de fundo, controle de áudio e easter egg global

// Sistema de música de fundo
let backgroundMusic = null;
let backgroundMusicController = null;
let isBackgroundMusicPlaying = false;
let musicPermanentlyStopped = false;
let siteUnlocked = false;

// FLAG: indica se a música de fundo foi suspensa por um áudio de presente
let backgroundMusicSuspendedByCustomAudio = false;

// Páginas sem widget de player (não mostrar no canto). Cartas entra aqui.
const NO_WIDGET_PAGES = ['quiz.html', 'cores.html', 'cartas.html'];

// Inicializar música de fundo
function initBackgroundMusic() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (NO_WIDGET_PAGES.includes(currentPage)) {
    console.log('🎵 Widget desabilitado nesta página:', currentPage);
  }
  backgroundMusic = new Audio('assets/media/realman.mp3');
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.3;
  backgroundMusic.preload = 'auto';
  backgroundMusic._altTried = false;
  backgroundMusic.addEventListener('error', () => {
    if (!backgroundMusic._altTried) {
      backgroundMusic._altTried = true;
      backgroundMusic.src = 'assets/media/real-man.mp3';
      backgroundMusic.load();
    }
  });

  if (!NO_WIDGET_PAGES.includes(currentPage)) {
    createBackgroundMusicController(); // só cria o widget onde pode
    updateMusicController();
  }

  // REMOVIDO: autoplay por qualquer clique em qualquer página
  // A música começa via enterSite() (index) ou startMusicForLetter() (cartas).
}

// Criar controlador visual (ignora cartas.html)
function createBackgroundMusicController() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (NO_WIDGET_PAGES.includes(currentPage)) return;
  if (document.getElementById('musicController')) return; // evita duplicar

  // CSS mínimo para posicionar (caso não exista no styles.min.css)
  if (!document.getElementById('musicControllerStyles')) {
    const st = document.createElement('style');
    st.id = 'musicControllerStyles';
    st.textContent = `
      #musicController{position:fixed;right:16px;bottom:16px;z-index:9999}
      #musicController .music-controls{
        display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;
        background:linear-gradient(135deg,#0b0f1a,#1c2030);border:1px solid #ffffff1a;
        box-shadow:0 10px 30px rgba(0,0,0,.35)
      }
      #musicController .music-btn{min-height:auto;padding:6px 10px;border-radius:10px}
      #musicController .music-info{min-width:120px}
      #musicController .music-title{color:#cfd3ff;font-size:12px;line-height:1}
      #musicController .music-progress{width:120px;height:6px;border-radius:999px;background:#ffffff12;overflow:hidden;margin-top:6px}
      #musicController .music-progress-bar{height:100%;width:0;background:linear-gradient(90deg,#7c3aed,#3b82f6)}
      @media (max-width:520px){ #musicController .music-title{display:none} #musicController .music-progress{width:84px} }
    `;
    document.head.appendChild(st);
  }

  backgroundMusicController = document.createElement('div');
  backgroundMusicController.id = 'musicController';
  backgroundMusicController.innerHTML = `
    <div class="music-controls">
      <button id="musicToggle" class="music-btn">🎵</button>
      <button id="musicStopPermanently" class="music-btn stop-btn" title="Parar definitivamente">⏹️</button>
      <div class="music-info">
        <span class="music-title">Real Man</span>
        <div class="music-progress"><div class="music-progress-bar"></div></div>
      </div>
    </div>
  `;
  document.body.appendChild(backgroundMusicController);

  document.getElementById('musicToggle').addEventListener('click', toggleBackgroundMusic);
  document.getElementById('musicStopPermanently').addEventListener('click', stopMusicPermanently);

  // Atualiza progresso
  setInterval(() => {
    if (backgroundMusic && !backgroundMusic.paused && isFinite(backgroundMusic.duration)) {
      const progress = (backgroundMusic.currentTime / backgroundMusic.duration) * 100;
      const bar = backgroundMusicController.querySelector('.music-progress-bar');
      if (bar) bar.style.width = progress + '%';
    }
  }, 1000);
}

// Desbloquear o site
function unlockSite() {
  siteUnlocked = true;
  
  // Remover blur do conteúdo
  const container = document.querySelector('.container');
  if (container) {
    container.style.filter = '';
    container.style.pointerEvents = '';
  }
  
  // Iniciar música
  if (backgroundMusic) {
    backgroundMusic.play().then(() => {
      isBackgroundMusicPlaying = true;
      createBackgroundMusicController();
      updateMusicController();
      console.log('✅ Música iniciada após clique do usuário!');
    }).catch(err => {
      console.error('❌ Erro ao iniciar música:', err);
    });
  }
}

// Atualizar aparência do controlador
function updateMusicController() {
  // Verificar se estamos em uma página onde a música deve tocar
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const noMusicPages = ['quiz.html', 'cores.html'];
  
  if (noMusicPages.includes(currentPage)) {
    return; // Não atualizar controlador nestas páginas
  }
  
  const toggleBtn = document.getElementById('musicToggle');
  if (toggleBtn) {
    toggleBtn.textContent = isBackgroundMusicPlaying ? '⏸️' : '🎵';
    toggleBtn.classList.toggle('playing', isBackgroundMusicPlaying);
  }
}

// Controlar volume baseado na página atual
function adjustBackgroundMusicForPage() {
  if (!backgroundMusic) return;
  
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const focusPages = ['quiz.html', 'cores.html'];
  
  if (focusPages.includes(currentPage)) {
    // Parar música completamente nestas páginas
    backgroundMusic.pause();
    isBackgroundMusicPlaying = false;
    updateMusicController();
    console.log('🎵 Música pausada na página:', currentPage);
  } else if (currentPage === 'cartas.html') {
    // Em cartas, manter música mas com volume baixo
    if (isBackgroundMusicPlaying) {
      backgroundMusic.volume = 0.15;
    }
  } else {
    // Restaurar volume normal para outras páginas
    backgroundMusic.volume = 0.3;
  }
}

// Alternar música de fundo
function toggleBackgroundMusic() {
  if (!backgroundMusic) return;
  
  // Verificar se estamos em uma página onde a música deve tocar
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const noMusicPages = ['quiz.html', 'cores.html'];
  
  if (noMusicPages.includes(currentPage)) {
    console.log('🎵 Música não pode ser tocada nesta página:', currentPage);
    return;
  }
  
  if (backgroundMusic.paused) {
    backgroundMusic.play().then(() => {
      isBackgroundMusicPlaying = true;
      musicPermanentlyStopped = false;
      updateMusicController();
    }).catch(err => {
      console.error('❌ Erro ao iniciar música:', err);
    });
  } else {
    backgroundMusic.pause();
    isBackgroundMusicPlaying = false;
    updateMusicController();
  }
}

// Função para parar música definitivamente
function stopMusicPermanently() {
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    isBackgroundMusicPlaying = false;
    musicPermanentlyStopped = true;
    updateMusicController();
    console.log('🎵 Música parada definitivamente');
  }
}

// Criar controlador discreto de música para cartas
function createDiscreteMusicController() {
  backgroundMusicController = document.createElement('div');
  backgroundMusicController.id = 'discreteMusicController';
  backgroundMusicController.innerHTML = `
    <div class="discrete-music-controls">
      <button id="discreteMusicToggle" class="discrete-music-btn">🎵</button>
      <button id="discreteMusicStop" class="discrete-music-btn stop-btn" title="Parar">⏹️</button>
    </div>
  `;
  
  document.body.appendChild(backgroundMusicController);
  
  // Event listeners
  document.getElementById('discreteMusicToggle').addEventListener('click', toggleDiscreteMusic);
  document.getElementById('discreteMusicStop').addEventListener('click', stopDiscreteMusic);
}

// Alternar música discreta
function toggleDiscreteMusic() {
  if (!backgroundMusic) return;
  
  if (backgroundMusic.paused) {
    backgroundMusic.play().then(() => {
      isBackgroundMusicPlaying = true;
      updateDiscreteMusicController();
      console.log('✅ Música discreta iniciada');
    }).catch(err => {
      console.error('❌ Erro ao iniciar música discreta:', err);
    });
  } else {
    backgroundMusic.pause();
    isBackgroundMusicPlaying = false;
    updateDiscreteMusicController();
  }
}

// Parar música discreta
function stopDiscreteMusic() {
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    isBackgroundMusicPlaying = false;
    updateDiscreteMusicController();
    console.log('🎵 Música discreta parada');
  }
}

// Atualizar controlador discreto
function updateDiscreteMusicController() {
  const toggleBtn = document.getElementById('discreteMusicToggle');
  if (toggleBtn) {
    toggleBtn.textContent = isBackgroundMusicPlaying ? '⏸️' : '🎵';
    toggleBtn.classList.toggle('playing', isBackgroundMusicPlaying);
  }
}

// Função para iniciar música ao abrir carta
function startMusicForLetter() {
  if (!backgroundMusic || isBackgroundMusicPlaying) return;
  
  // Criar controlador discreto se não existir
  if (!document.getElementById('discreteMusicController')) {
    createDiscreteMusicController();
  }
  
  // Definir volume baixo para cartas
  backgroundMusic.volume = 0.10; // cartas: mais baixo
  
  backgroundMusic.play().then(() => {
    isBackgroundMusicPlaying = true;
    updateDiscreteMusicController();
    console.log('🎵 Música iniciada para leitura da carta (volume baixo)');
  }).catch(err => {
    console.error('❌ Erro ao iniciar música para carta:', err);
  });
}

// Função para parar música ao fechar carta
function stopMusicForLetter() {
  if (!backgroundMusic || !isBackgroundMusicPlaying) return;
  
  backgroundMusic.pause();
  isBackgroundMusicPlaying = false;
  
  // Remover controlador discreto
  const controller = document.getElementById('discreteMusicController');
  if (controller) {
    controller.remove();
  }
  
  console.log('🎵 Música pausada ao fechar carta');
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initBackgroundMusic);

// Garante que o gate apareça e bloqueia gifts-on até o clique
document.addEventListener('DOMContentLoaded', () => {
  const gate = document.querySelector('.entry-content');
  if (!gate) return;

  // Gate deve ficar visível até o clique
  siteUnlocked = false;
  document.body.classList.remove('gifts-on');
  gate.classList.remove('hidden');
  gate.style.display = 'grid';

  // Se algum script tentar colocar gifts-on antes do clique, removo
  const mo = new MutationObserver(() => {
    if (!siteUnlocked && document.body.classList.contains('gifts-on')) {
      document.body.classList.remove('gifts-on');
    }
  });
  mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // Clique/teclado libera o site
  gate.addEventListener('click', enterSite, { once: true });
  gate.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enterSite(); }
  });

  // Após entrar, paro de vigiar
  window.addEventListener('experience:entered', () => mo.disconnect(), { once: true });
});

// Bootstrap seguro: cria/atualiza o controlador assim que o DOM carregar.
// Se suas funções já existirem, serão usadas; caso contrário, não quebra.
document.addEventListener('DOMContentLoaded', () => {
  try {
    if (typeof initBackgroundMusic === 'function') {
      initBackgroundMusic();
    } else if (typeof createBackgroundMusicController === 'function') {
      createBackgroundMusicController();
    }
  } catch (e) {
    console.warn('Música: init falhou:', e);
  }
});

// Variável global para controlar áudio ativo
let activeCustomAudio = null;

// Criar player de áudio personalizado
function createCustomAudioPlayer(audioElement, container) {
  // Parar qualquer áudio ativo primeiro
  if (activeCustomAudio) {
    activeCustomAudio.pause();
    activeCustomAudio.currentTime = 0;
    activeCustomAudio = null;
  }

  // Pausar música de fundo ao abrir presente de áudio
  if (backgroundMusic && isBackgroundMusicPlaying) {
    backgroundMusic.pause();
    backgroundMusicSuspendedByCustomAudio = true;
    isBackgroundMusicPlaying = false;
    updateMusicController();
  }

  // Remover o elemento <audio> original
  audioElement.remove();

  // Criar container do player
  const player = document.createElement('div');
  player.className = 'custom-audio-player';
  player.innerHTML = `
    <div class="audio-controls">
      <button class="audio-btn play-btn">▶️</button>
      <div class="audio-info">
        <div class="audio-progress">
          <div class="audio-progress-bar"></div>
        </div>
        <div class="audio-time">
          <span class="current-time">0:00</span>
          <span class="duration">0:00</span>
        </div>
      </div>
      <div class="audio-volume">
        <input type="range" class="volume-slider" min="0" max="100" value="70">
        <span class="volume-icon">🔊</span>
      </div>
    </div>
  `;
  
  player.style.cssText = `
    background: linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(124, 58, 237, 0.05));
    border: 2px solid rgba(167, 139, 250, 0.3);
    border-radius: 16px;
    padding: 20px;
    margin: 16px auto;
    display: block;
    max-width: 400px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
  `;
  
  container.appendChild(player);
  
  // Criar novo elemento de áudio
  const audio = new Audio(audioElement.src);
  audio.volume = 0.7;
  let isPlaying = false;

  // Armazenar referência do áudio no container
  container._audioInstance = audio;
  container._isPlaying = false;
  
  // Elementos do player
  const playBtn = player.querySelector('.play-btn');
  const progressBar = player.querySelector('.audio-progress-bar');
  const currentTimeSpan = player.querySelector('.current-time');
  const durationSpan = player.querySelector('.duration');
  const volumeSlider = player.querySelector('.volume-slider');
  const volumeIcon = player.querySelector('.volume-icon');
  
  // Função para formatar tempo
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Função para parar este áudio
  function stopThisAudio() {
    if (audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
    isPlaying = false;
    container._isPlaying = false;
    playBtn.textContent = '▶️';
    if (activeCustomAudio === audio) activeCustomAudio = null;

    // IMPORTANTE: não retomar música de fundo aqui.
    // O Real Man só volta quando o modal de presente é fechado (closeGift -> stopAllCustomAudio).
  }
  
  // Event listeners
  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      // Pausa do usuário → não retomar Real Man
      stopThisAudio();
    } else {
      // Garantir Real Man pausado ao voltar a tocar o presente
      if (backgroundMusic && !backgroundMusic.paused) {
        backgroundMusic.pause();
        backgroundMusicSuspendedByCustomAudio = true;
        isBackgroundMusicPlaying = false;
        updateMusicController();
      }

      if (activeCustomAudio && activeCustomAudio !== audio) {
        try { activeCustomAudio.pause(); activeCustomAudio.currentTime = 0; } catch(_) {}
        const prev = document.querySelector(`[data-audio-id="${activeCustomAudio._containerId}"]`);
        if (prev) {
          prev._isPlaying = false;
          const prevBtn = prev.querySelector('.play-btn');
          if (prevBtn) prevBtn.textContent = '▶️';
        }
      }

      activeCustomAudio = audio;
      audio._containerId = container.dataset.audioId || Date.now();
      container.dataset.audioId = audio._containerId;

      audio.play().then(() => {
        isPlaying = true;
        container._isPlaying = true;
        playBtn.textContent = '⏸️';
      }).catch(err => {
        console.log('Erro ao tocar áudio:', err);
        stopThisAudio();
      });
    }
  });
  
  // Atualizar progresso
  audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = progress + '%';
    currentTimeSpan.textContent = formatTime(audio.currentTime);
  });
  
  // Quando o áudio carrega
  audio.addEventListener('loadedmetadata', () => {
    durationSpan.textContent = formatTime(audio.duration);
  });
  
  // Quando o áudio termina (não retomar Real Man aqui)
  audio.addEventListener('ended', () => {
    isPlaying = false;
    container._isPlaying = false;
    playBtn.textContent = '▶️';
    if (activeCustomAudio === audio) activeCustomAudio = null;
    // Real Man volta apenas ao fechar o modal (closeGift -> stopAllCustomAudio)
  });
  
  // Controle de volume
  volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    audio.volume = volume;
    
    // Atualizar ícone de volume
    if (volume === 0) {
      volumeIcon.textContent = '🔇';
    } else if (volume < 0.5) {
      volumeIcon.textContent = '🔉';
    } else {
      volumeIcon.textContent = '🔊';
    }
  });
  
  return audio;
}

// Função global para parar todos os áudios e retomar Real Man (usada ao fechar modal)
function stopAllCustomAudio() {
  // Parar áudio ativo
  if (activeCustomAudio) {
    activeCustomAudio.pause();
    activeCustomAudio.currentTime = 0;
    activeCustomAudio = null;
  }

  // Parar todos os áudios personalizados na página
  const audioContainers = document.querySelectorAll('.custom-audio-player');
  audioContainers.forEach(container => {
    if (container._audioInstance && !container._audioInstance.paused) {
      container._audioInstance.pause();
      container._audioInstance.currentTime = 0;
      container._isPlaying = false;

      // Atualizar botão de play
      const playBtn = container.querySelector('.play-btn');
      if (playBtn) {
        playBtn.textContent = '▶️';
      }
    }
  });

  // Parar todos os elementos de áudio padrão
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach(audio => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch(e){}
  });

  // Retomar música de fundo SOMENTE se foi suspensa por um áudio de presente
  if (backgroundMusic && backgroundMusicSuspendedByCustomAudio) {
    backgroundMusic.play().then(() => {
      isBackgroundMusicPlaying = true;
      backgroundMusicSuspendedByCustomAudio = false;
      updateMusicController();
      console.log('🎵 Música de fundo retomada após fechar presente de áudio');
    }).catch(()=>{});
  }
}

// Easter egg: digitar TEACHER em qualquer página abre pedido.html
(function(){
  const sequence = "TEACHER";
  let pos = 0;
  window.addEventListener('keydown',(e)=>{
    if (!e || !e.key) return; // Proteção contra undefined
    
    const k = e.key.toUpperCase();
    if(k === sequence[pos]){
      pos++;
      if(pos===sequence.length){
        pos=0;
        window.location.href = "pedido.html";
      }
    }else{
      pos = (k===sequence[0]) ? 1 : 0;
    }
  });
})();

// Expor funções globalmente
window.createCustomAudioPlayer = createCustomAudioPlayer;
window.activeCustomAudio = activeCustomAudio;
window.stopAllCustomAudio = stopAllCustomAudio;
window.stopMusicPermanently = stopMusicPermanently;
window.startMusicForLetter = startMusicForLetter;
window.stopMusicForLetter = stopMusicForLetter;

// Gate: entrar no site (libera presentes, remove overlay e blur)
// Use esta função em todo lugar
function enterSite() {
  document.body.classList.add('gifts-on');

  // remove o gate atual e quaisquer legados
  document.querySelector('.entry-content')?.remove();
  document.getElementById('entryGate')?.remove();
  document.querySelectorAll('.entry-gate,.entry-card,.entry-title,.entry-sub,.entry-btn').forEach(n => n.remove());

  // limpa blur legado
  const container = document.querySelector('.container');
  if (container) { container.style.filter = ''; container.style.pointerEvents = ''; }

  // inicia música se existir e não estiver tocando
  if (backgroundMusic && backgroundMusic.paused) {
    backgroundMusic.play().then(() => {
      isBackgroundMusicPlaying = true;
      createBackgroundMusicController();
      updateMusicController();
    }).catch(()=>{});
  }

  window.dispatchEvent(new CustomEvent('experience:entered'));
}

// Compat: manter API antiga chamando o fluxo novo
window.markExperienceEntered = function () { enterSite(); };

// Remova este bloco duplicado se existir (ele ligava markExperienceEntered no gate):
// document.addEventListener('DOMContentLoaded', () => {
//   const gate = document.querySelector('.entry-content');
//   if (gate) gate.addEventListener('click', () => window.markExperienceEntered(), { once: true });
// });

// Bind único do gate e limpeza inicial
document.addEventListener('DOMContentLoaded', () => {
  // limpar blur/classe legado
  document.body.classList.remove('blur', 'blurred', 'site-locked', 'locked');
  document.documentElement.classList.remove('blur', 'blurred', 'site-locked', 'locked');
  document.querySelectorAll('.blur, .blurred, .site-locked, .locked').forEach(n => n.classList.remove('blur','blurred','site-locked','locked'));
  const cont = document.querySelector('.container');
  if (cont) { cont.style.filter = ''; cont.style.pointerEvents = ''; }

  // ligar o clique no gate atual
  const gate = document.querySelector('.entry-content');
  if (gate) {
    gate.addEventListener('click', enterSite, { once: true });
    gate.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enterSite(); }});
  }
});

// Gate seguro
function getGateEl() {
  return document.querySelector('.entry-content') || document.getElementById('entryGate') || null;
}

// Ex.: onde tinha overlay.remove() ou overlay.style...
const gateEl = getGateEl();
if (gateEl) {
  // exemplo de remoção após entrar:
  // gateEl.remove();
}

// Observer: fechou o modal de presente → parar áudios e retomar música de fundo se foi suspensa
function observeGiftModalClose(){
  const modal = document.getElementById('giftModal');
  if (!modal) return;
  const obs = new MutationObserver(() => {
    if (!modal.classList.contains('show')) {
      // para qualquer áudio tocando no modal
      stopAllCustomAudio();
    }
  });
  obs.observe(modal, { attributes:true, attributeFilter:['class'] });
}
document.addEventListener('DOMContentLoaded', observeGiftModalClose);