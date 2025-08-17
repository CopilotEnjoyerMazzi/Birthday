//// filepath: c:\Users\danie\OneDrive\Documentos\teste\presente_site\assets\gifts-patch.js
// Hotfix não-invasivo para presentes

(function(){
  function ensureGiftModal(){
    let m = document.getElementById('giftModal');
    if (!m) {
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
  }

  function pctOfViewport(px, total){ return (px / total) * 100; }

  // Move presentes que caírem dentro do .container para uma área segura (borda lateral)
  function rebalanceGifts(){
    const container = document.querySelector('.container');
    if (!container) return;

    const r = container.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const gifts = document.querySelectorAll('.random-gift');

    gifts.forEach(el => {
      const g = el.getBoundingClientRect();
      const cx = g.left + g.width/2;
      const cy = g.top + g.height/2;

      const inside =
        cx >= r.left - 8 && cx <= r.right + 8 &&
        cy >= r.top  - 8 && cy <= r.bottom + 8;

      if (!inside) return;

      // empurra para a borda mais próxima
      const distLeft = Math.abs(cx - r.left);
      const distRight = Math.abs(r.right - cx);
      const distTop = Math.abs(cy - r.top);
      const distBottom = Math.abs(r.bottom - cy);

      let nx = cx, ny = cy;
      const margin = 16;

      const minDist = Math.min(distLeft, distRight, distTop, distBottom);
      if (minDist === distLeft) nx = Math.max(12, r.left - margin);
      else if (minDist === distRight) nx = Math.min(vw - 12, r.right + margin);
      else if (minDist === distTop) ny = Math.max(64, r.top - margin);
      else ny = Math.min(vh - 64, r.bottom + margin);

      // aplica em porcentagem p/ manter responsivo
      el.style.left = pctOfViewport(nx, vw).toFixed(2) + '%';
      el.style.top  = pctOfViewport(ny, vh).toFixed(2) + '%';
      el.style.transform = 'translate(-50%, -50%)';
    });
  }

  function enableGifts(){
    document.body.classList.add('gifts-on');
    ensureGiftModal();
    // Rebalance após criação dos presentes pelo gifts.js
    setTimeout(rebalanceGifts, 500);
  }

  function safeStart(){
    try {
      if (typeof allowsGifts === 'function' && !allowsGifts()) return;
      if (typeof createRandomGifts === 'function') createRandomGifts();
      if (typeof rebalanceGifts === 'function') setTimeout(rebalanceGifts,120);
      document.body.classList.add('gifts-on');
    } catch(e){ console.warn('gifts-patch: start falhou', e); }
  }

  // Torna as funções acessíveis globalmente (sem mudar nomes)
  window.ensureGiftModal = window.ensureGiftModal || ensureGiftModal;
  window.rebalanceGifts = window.rebalanceGifts || rebalanceGifts;

  window.addEventListener('DOMContentLoaded', function(){
    const gate = document.querySelector('.entry-content');
    if (gate) {
      window.addEventListener('experience:entered', safeStart, { once:true });
    } else {
      safeStart();
    }
  });
})();