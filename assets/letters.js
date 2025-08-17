// letters.js — cartas (edite os textos aqui)
const cartaAniversario = `Oieee! Feliz aniversário, gatona!

Espero que tenha um dia excelente, queria que fosse comigo, mas não sei se vai dar :(, mas tudo bem (não está).

Eu te desejo toda a felicidade desse mundo, sério, você é muito especial e importante pra mim! Você me fez evoluir/melhorar muito como ser humano, como amigo, ~~como namorado~~.

Espero que consiga realizar todos os seus sonhos, que seu futuro seja mais brilhante do que a maior estrela que você já viu — sem contar você mesma né, pois seu brilho é incomparável.

Lembro como se fosse ontem, nossas primeiras mensagens, a primeira call... você me apelidando de 'teacher'.. você tentou me irritar, mas não consigo descrever o carinho que recebi com esse apelido, na verdade, tudo que vem de você me transmite afeto, carinho e amor.. até em momentos mais sensíveis ou tensos, nunca passou pela minha cabeça que você deixou de me amar, e eu também nunca deixei e nem vou deixar de te amar, mas prefiro falar diretamente: <span class="big-love">EU TE AMO!</span>

Eu amo seu jeitinho, amo o jeito que você me trata, amo como você é com a sua mamis — se eu falasse amigos estaria mentindoKKKKK, amo seus gestos de amor e carinho, amo quando você cuida de mim, quando estou triste/ansioso, amo quando me anima em uma tiltada de joguinho online (eu fico insuportável, eu sei), amo sua voz (rs), amo seu carioquês, amo seus olhos, cada feição do seu rosto, meu sonho é um dia ter o privilégio de olhar para você, frente a frente, para continuar me apaixonando mais e mais por você, até chegar no infinito, ou seja, nunca vou parar.

Você é maravilhosa em todos os aspectos, de verdade mesmo, do fundo do meu coração. E mais uma vez, eu te amo. Tenho infinidade de coisas para falar, mas essas são as que vieram na minha cabeça agora, beijinhos!

**You're perfect, you're the best, I love you, dear. 💜**`;

// Carta de saudade formatada
const cartaSaudade = `Ei, meu amor...

Se você está lendo isso agora, é porque a saudade resolveu aparecer.

Então, primeiro de tudo: respira fundo e lembra que eu estou pensando em você nesse exato momento, não importa onde eu esteja.

A saudade pode ser difícil às vezes, mas ela também é a prova mais bonita de que o que temos é real e vale a pena. Ela só existe porque você significa muito para mim — e eu para você.

Fecha os olhos e lembra da minha voz, te chamando de amor, de bobona, te dando carinho ou fazendo piadinhas sem graça. Tudo isso continua aqui, guardado, esperando para se repetir de novo.

Logo estaremos juntinhos, falando besteira, rindo à toa e se divertindo muito, eu tenho certeza!

Até lá… aguente firme.

**Because every beat of my heart continues to say your name. Always. 💜**`;

// Função para processar texto riscado e destacar inglês
function processStrikethrough(text) {
  // Normalizar e remover BOM / espaços iniciais gerais
  let normalized = String(text || '').replace(/\uFEFF/g, '').replace(/\r\n/g, '\n');

  // Dividir por parágrafos (duas quebras de linha ou mais separam parágrafos)
  const paragraphs = normalized
    .split(/\n\s*\n+/)
    .map(p => p.trim())   // remover espaços em cada parágrafo
    .filter(p => p.length > 0);

  // função auxiliar para aplicar substituições em cada parágrafo
  function transformParagraph(p) {
    // substituir texto riscado ~~...~~
    p = p.replace(/~~(.*?)~~/g, '<span class="strike">$1</span>');
    // substituir destaque em inglês **...**
    p = p.replace(/\*\*(.*?)\*\*/g, '<span class="highlighted-phrase strong-highlight">$1</span>');
    // transformar coração em span
    p = p.replace(/💜/g, '<span class="heart-emoji">💜</span>');
    // preservar spans já inseridos (como .big-love) sem alteração adicional

    return p;
  }

  // Aplicar transformações e mapear para <p> com classes
  const htmlParts = paragraphs.map(p => {
    const transformed = transformParagraph(p);

    // Se o parágrafo contém exatamente o marcador big-love (ou só "EU TE AMO!")
    // tornar um bloco visual special
    if (/EU TE AMO/i.test(transformed) && /big-love/i.test(transformed)) {
      // garantir que a tag .big-love esteja em um wrapper próprio
      return `<div class="big-love-block">${transformed}</div>`;
    }

    // Se o parágrafo é apenas a linha em inglês destacada (weaker detection),
    // aplicar um wrapper que dá maior destaque visual
    if (/^\*\*.*\*\*$/.test(p) || /You\'re perfect|Because every beat of my heart/i.test(p)) {
      return `<p class="final-english">${transformed}</p>`;
    }

    return `<p>${transformed}</p>`;
  });

  return htmlParts.join('');
}

// Função para criar carta simples com funcionalidade de abrir
function createSimpleLetter(containerId, content, title) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Limpar container
  container.innerHTML = '';
  
  // Criar carta simples
  const letterCard = document.createElement('div');
  letterCard.className = 'simple-letter';
  letterCard.innerHTML = `
    <div class="letter-header">
      <h3>${title}</h3>
    </div>
    <div class="envelope-button-container">
      <button class="envelope-btn">💌</button>
      <p class="envelope-hint">Clique para abrir</p>
    </div>
  `;
  
  // Adicionar evento para expandir
  const envelopeBtn = letterCard.querySelector('.envelope-btn');
  envelopeBtn.addEventListener('click', () => {
    showLetterZoom(title, content);
  });
  
  container.appendChild(letterCard);
}

// Função para mostrar zoom da carta (similar aos presentinhos)
function showLetterZoom(title, content) {
  // Iniciar música ao abrir carta
  if (window.startMusicForLetter) {
    window.startMusicForLetter();
  }
  
  // Criar modal de zoom
  const zoomModal = document.createElement('div');
  zoomModal.className = 'letter-zoom-modal';
  zoomModal.innerHTML = `
    <div class="zoom-content">
      <div class="zoom-header">
        <h2>${title}</h2>
        <button class="close-zoom-btn">✕</button>
      </div>
      <div class="zoom-body love-letter">
        <div class="letter-full-text">
          ${processStrikethrough(content)}
        </div>
      </div>
    </div>
  `;
  
  // Adicionar ao body
  document.body.appendChild(zoomModal);
  
  // Mostrar modal
  setTimeout(() => {
    zoomModal.classList.add('show');
  }, 10);
  
  // Event listeners
  const closeBtn = zoomModal.querySelector('.close-zoom-btn');
  closeBtn.addEventListener('click', () => {
    // Parar música ao fechar carta
    if (window.stopMusicForLetter) {
      window.stopMusicForLetter();
    }
    
    zoomModal.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(zoomModal);
    }, 300);
  });
  
  // Fechar clicando fora
  zoomModal.addEventListener('click', (e) => {
    if (e.target === zoomModal) {
      // Parar música ao fechar carta
      if (window.stopMusicForLetter) {
        window.stopMusicForLetter();
      }
      
      closeBtn.click();
    }
  });
}

// Garantir funções globais de controle de áudio apenas se não existirem
if (!window.startMusicForLetter) {
  // Tenta tocar um áudio dedicado à carta (se existir) sem sobrescrever sons de outros componentes.
  window.startMusicForLetter = function() {
    try {
      // Se já houver um gerenciador próprio, reutiliza
      if (window._letterAudio && !window._letterAudio.paused) return;

      // Procurar por um elemento de áudio com atributo data-letter-audio
      let audio = document.querySelector('audio[data-letter-audio]');
      if (!audio) {
        // tentar por id padrão
        audio = document.getElementById('letterAudio');
      }
      if (audio) {
        window._letterAudio = audio;
        audio.play().catch(() => { /* autoplay bloqueado */ });
      }
      // se não existir, não criaremos arquivo novo aqui (para não quebrar comportamento)
    } catch (e) {
      console.warn('startMusicForLetter erro:', e);
    }
  };
}

if (!window.stopMusicForLetter) {
  window.stopMusicForLetter = function() {
    try {
      if (window._letterAudio) {
        window._letterAudio.pause();
        window._letterAudio.currentTime = 0;
      }
      // também garantir que qualquer áudio identificado com data-letter-audio seja parado
      const audios = document.querySelectorAll('audio[data-letter-audio]');
      audios.forEach(a => {
        a.pause();
        a.currentTime = 0;
      });
    } catch (e) {
      console.warn('stopMusicForLetter erro:', e);
    }
  };
}

// Definir stopAllCustomAudio se não existir — gifts.js chama isso.
// Isso garante que, ao fechar presentes, todos os players sejam realmente pausados.
if (!window.stopAllCustomAudio) {
  window.stopAllCustomAudio = function() {
    try {
      // Pausar todos os <audio> na página
      const allAudios = document.querySelectorAll('audio');
      allAudios.forEach(a => {
        try {
          a.pause();
          a.currentTime = 0;
        } catch(e) {}
      });

      // Parar áudio da carta se houver
      if (window.stopMusicForLetter) {
        try { window.stopMusicForLetter(); } catch(e) {}
      }

      // Parar player customizado do main.js se existir
      if (window.activeCustomAudio) {
        try {
          window.activeCustomAudio.pause();
          window.activeCustomAudio.currentTime = 0;
          window.activeCustomAudio = null;
        } catch(e) {}
      }
    } catch (e) {
      console.warn('stopAllCustomAudio erro:', e);
    }
  };
}

// Aplicar cartas simples
document.addEventListener('DOMContentLoaded', function() {
  createSimpleLetter('cartaAniversario', cartaAniversario, 'Feliz Aniversário 💜');
  createSimpleLetter('cartaSaudade', cartaSaudade, '💜');
});

// Garantir que, quando o modal de presente for fechado, a música da carta seja parada.
// Isso evita que o áudio volte a tocar ao fechar um presente depois de fechar uma carta.
document.addEventListener('DOMContentLoaded', () => {
  const giftModal = document.getElementById('giftModal');
  if (giftModal) {
    // observer para quando o modal perder a classe 'show' -> parar áudio da carta
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.attributeName === 'class') {
          if (!giftModal.classList.contains('show')) {
            try { window.stopMusicForLetter && window.stopMusicForLetter(); } catch(e) { /* silencioso */ }
            try { window.stopAllCustomAudio && window.stopAllCustomAudio(); } catch(e) {}
          }
        }
      });
    });
    observer.observe(giftModal, { attributes: true, attributeFilter: ['class'] });

    // também interceptar o botão de fechar (caso haja) para garantir parada imediata
    const closeButtons = giftModal.querySelectorAll('button, .close');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        try { window.stopMusicForLetter && window.stopMusicForLetter(); } catch(e) {}
        try { window.stopAllCustomAudio && window.stopAllCustomAudio(); } catch(e) {}
      });
    });
  }
});

