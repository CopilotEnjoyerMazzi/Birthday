// colors.js — página das cores + desbloqueio por frase secreta
// 4 cores, cada clique sorteia 1 de 5 mensagens
(function(){
  const DAY = 24*60*60*1000;
  const WEEK = 7*DAY;

  // Janela da noite (libera o "Boa noite"): 22h → 06h
  const NIGHT_START_H = 22;
  const NIGHT_END_H = 6;

  // Paleta: Vermelho, Rosa, Boa noite (Roxo), Vale (Azul)
  const COLORS = [
    {
      key:'vermelho', label:'Vermelho', meaning:'Coisas que amo em você',
      color:'#ef4444', bg:'linear-gradient(135deg,#7f1d1d,#ef4444)',
      msgs:[
        'Seus olhos. São profundos.',
        'Você se preocupa muito comigo.',
        'Você me faz rir.',
        'Você me anima quando tilto em joguinho online (eu fico insuportável, eu sei).',
        'Você me acalma quando estou ansioso.',
        'A sua voz (rs)',
        'Suas piadinhas com o final das palavras.'
      ],
      cooldown: DAY // desabilita por 24h após fechar
    },
    {
      key:'rosa', label:'Rosa', meaning:'Momentos especiais',
      color:'#ec4899', bg:'linear-gradient(135deg,#8a2458,#ec4899)',
      msgs:[
        'Quando flertamos um pouco a mais naquela noite onde a gente foi call no discord. Foi aí que percebi que podia dar um passo a mais com você.',
        'Aquele domingo prestes a voltar à vida normal após as férias. Eu estava destruído, me despedacei em pecinhas, mas você foi lá e juntou uma por uma, e fez eu me sentir melhor.',
        'As piadas internas que a gente criou.',
        'Quando vimos juntos a música que eu cantei pra você.',
        'Quando eu estava call com você e meus amigos estavam em casa.'
      ],
      cooldown: DAY // desabilita por 24h após fechar
    },
    {
      key:'boanoite', label:'Boa noite', meaning:'Disponível 22h–06h',
      color:'#7c3aed', bg:'linear-gradient(135deg,#3b277a,#7c3aed)',
      msgs:[
        'Boa noite, meu amor.',
        'Boa noite, minha princesa.',
        'Boa noite, meu docinho.',
        'Boa noite, bobona.',
        'Boa noite, meu bem.',
        'Boa noite, meu anjo.',
        'Boa noite, flor.',
        'Boa noite, bebê.'
      ],
      nightly: true // 22h–06h e 1x por noite
    },
    {
      key:'vale', label:'Vale‑tudo', meaning:'3 vales • 1 por semana',
      color:'#3b82f6', bg:'linear-gradient(135deg,#1d3c7a,#3b82f6)',
      msgs:[
        'Peça o que quiser!'
      ],
      isVale: true // 3 no total, cooldown semanal
    }
  ];

  const el = {
    gate: document.getElementById('lockGate'),
    colorsArea: document.getElementById('colorsArea'),
    grid: document.getElementById('colorsGrid'),
    btnUnlock: document.getElementById('btnUnlock'),
    input: document.getElementById('secretInput'),
    btnRandom: document.getElementById('btnRandom'),
    modal: document.getElementById('colorModal'),
    title: document.getElementById('colorTitle'),
    msg: document.getElementById('colorMsg'),
    actions: document.getElementById('colorActions')
  };

  function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function now(){ return Date.now(); }
  function fmtDelta(ms){
    const s = Math.max(0, Math.ceil(ms/1000));
    const d = Math.floor(s/86400);
    const h = Math.floor((s%86400)/3600);
    const m = Math.floor((s%3600)/60);
    if (d>0) return `${d}d ${h}h`;
    if (h>0) return `${h}h ${m}m`;
    return `${m}m`;
  }
  function key(k, suffix){ return `color_${k}_${suffix}`; }

  // ===== Regras de horário da noite (22h–06h, cruza meia-noite) =====
  function isNightWindowNow(){
    const h = new Date().getHours();
    return (h >= NIGHT_START_H || h < NIGHT_END_H);
  }
  // ms até começar a noite (0 se já está na janela 22h–06h)
  function msUntilNightStart(){
    if (isNightWindowNow()) return 0;
    const d = new Date();
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate(), NIGHT_START_H, 0, 0, 0).getTime();
    return Math.max(0, target - now());
  }
  // próxima 22h após um uso; se usou de madrugada (<06h), libera às 22h do MESMO dia; se usou após 22h, libera às 22h do dia SEGUINTE
  function nextNightStartFrom(ts){
    const d = new Date(ts);
    const h = d.getHours();
    const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
    if (h < NIGHT_END_H) {
      // madrugada da mesma noite
      return new Date(y, m, day, NIGHT_START_H, 0, 0, 0).getTime();
    }
    if (h >= NIGHT_START_H) {
      // noite já começou; próxima noite é amanhã 22h
      return new Date(y, m, day + 1, NIGHT_START_H, 0, 0, 0).getTime();
    }
    // fora da janela (não deveria acontecer, mas por segurança)
    return new Date(y, m, day, NIGHT_START_H, 0, 0, 0).getTime();
  }

  // ===== UI: paleta no modal =====
  let openedColor = null;
  let currentPalette = null;

  function hexToRgba(hex, a){
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if(!m) return `rgba(255,255,255,${a})`;
    const r = parseInt(m[1],16), g=parseInt(m[2],16), b=parseInt(m[3],16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function applyPalette(c){
    currentPalette = c;
    const dialog = el.modal.querySelector('.dialog');
    if (dialog){
      dialog.style.setProperty('background', `linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.5)), ${c.bg}`, 'important');
      dialog.style.setProperty('border-color', hexToRgba(c.color, .45), 'important');
      dialog.style.setProperty('box-shadow', `0 16px 40px ${hexToRgba(c.color,.25)}`, 'important');
    }
    if (el.title){
      el.title.style.setProperty('color', '#fff', 'important');
      el.title.style.setProperty('text-shadow', `0 2px 10px ${hexToRgba(c.color,.35)}`, 'important');
    }
    if (el.msg){
      el.msg.style.setProperty('background', `linear-gradient(0deg, ${hexToRgba(c.color,.18)}, ${hexToRgba(c.color,.10)})`, 'important');
      el.msg.style.setProperty('border', `1px solid ${hexToRgba(c.color,.42)}`, 'important');
      el.msg.style.setProperty('padding', '12px 14px', 'important');
      el.msg.style.setProperty('border-radius', '12px', 'important');
    }
  }

  function setActions(btns=[]){
    el.actions.innerHTML = '';
    btns.forEach(b=>{
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = b.label;
      const bg = b.color || (currentPalette && currentPalette.bg);
      if (bg){
        btn.style.setProperty('background', bg, 'important');
        btn.style.setProperty('border-color', '#ffffff22', 'important');
      }
      btn.disabled = !!b.disabled;
      if (b.title) btn.title = b.title;
      btn.addEventListener('click', b.onClick);
      el.actions.appendChild(btn);
    });
  }

  function openColorModal(c, message){
    applyPalette(c);
    el.title.textContent = `${c.label} — ${c.meaning}`;
    el.msg.textContent = message;
    el.modal.classList.add('show');
  }

  window.closeColor = function(){
    el.modal.classList.remove('show');
    if (openedColor && openedColor.cooldown){
      localStorage.setItem(key(openedColor.key,'btnlast'), String(now()));
      openedColor = null;
      buildGrid();
    } else {
      openedColor = null;
    }
  };

  // ===== Handlers =====
  function handleSimple(c){
    openedColor = c;
    // openColorModal(c, pickRandomMessage(c)); // antigo
    openColorModal(c, nextNonRepeating(c.key, c.msgs)); // novo: sem repetição
    setActions([{ label:'Fechar', onClick:()=>closeColor() }]);
  }

  function handleBoaNoite(c){
    openedColor = c;
    const last = parseInt(localStorage.getItem(key(c.key,'last'))||'0',10);
    const tNow = now();

    if (!isNightWindowNow()){
      const ms = msUntilNightStart();
      openColorModal(c, `Disponível a partir das 22:00 (faltam ${fmtDelta(ms)}).`);
      setActions([{label:'Fechar', onClick:()=>el.modal.classList.remove('show')}]);
      return;
    }

    const nextAllowed = last ? nextNightStartFrom(last) : 0;
    if (last && tNow < nextAllowed){
      openColorModal(c, `Já abriu nesta noite. Volte após as 22:00 (${fmtDelta(nextAllowed - tNow)}).`);
      setActions([{label:'Fechar', onClick:()=>el.modal.classList.remove('show')}]);
      return;
    }

    // openColorModal(c, pickRandomMessage(c)); // antigo
    openColorModal(c, nextNonRepeating(c.key, c.msgs)); // novo
    localStorage.setItem(key(c.key,'last'), String(tNow));
    setActions([{label:'Fechar', onClick:()=>el.modal.classList.remove('show')}]);
  }

  function handleVale(c){
    openedColor = c;
    const used = parseInt(localStorage.getItem(key(c.key,'used'))||'0',10);
    const last = parseInt(localStorage.getItem(key(c.key,'last'))||'0',10);
    const left = WEEK - (now()-last);
    const remaining = Math.max(0, 3 - used);

    var baseMsg = nextNonRepeating(c.key, c.msgs); // novo
    // var baseMsg = pickRandomMessage(c); // antigo
    var base = baseMsg + '\nRestantes: ' + (Math.max(0, 3 - used)) + '/3.';
    openColorModal(c, remaining<=0 ? `${base}\nVocê já usou todos os vales.` :
      (last && left>0 ? `${base}\nPróximo resgate em ${fmtDelta(left)}.` : base));

    setActions([
      { label:'Fechar', onClick:()=>el.modal.classList.remove('show') },
      {
        label:'Resgatar',
        color: c.bg,
        disabled: remaining<=0 || (last && left>0),
        title: remaining<=0 ? 'Sem vales restantes' : (last && left>0 ? `Aguarde ${fmtDelta(left)}` : ''),
        onClick: ()=>{
          const newUsed = used + 1;
          localStorage.setItem(key(c.key,'used'), String(newUsed));
          localStorage.setItem(key(c.key,'last'), String(now()));
          el.msg.textContent = `Vale resgatado! Restantes: ${Math.max(0,3-newUsed)}/3. Próximo em 7 dias.`;
          setActions([{label:'Fechar', onClick:()=>el.modal.classList.remove('show')}]);
        }
      }
    ]);
  }

  function showColor(c){
    if (c.isVale) return handleVale(c);
    if (c.nightly) return handleBoaNoite(c);
    return handleSimple(c);
  }

  // ===== Estado de botões =====
  function cooldownState(c){
    if (!c.cooldown) return { disabled:false, title:'' };
    const last = parseInt(localStorage.getItem(key(c.key,'btnlast'))||'0',10);
    const left = c.cooldown - (now()-last);
    if (left > 0) return { disabled:true, title:`Disponível em ${fmtDelta(left)}` };
    return { disabled:false, title:'' };
  }

  function nightlyState(c){
    // desabilita até 22h; se já abriu nesta noite, desabilita até a próxima 22h
    const untilStart = msUntilNightStart();
    if (untilStart > 0) {
      return { disabled:true, title:`Disponível às 22:00 (faltam ${fmtDelta(untilStart)})` };
    }
    const last = parseInt(localStorage.getItem(key(c.key,'last'))||'0',10);
    if (!last) return { disabled:false, title:'' };
    const left = nextNightStartFrom(last) - now();
    if (left > 0) return { disabled:true, title:`Volte após as 22:00 (${fmtDelta(left)})` };
    return { disabled:false, title:'' };
  }

  function isButtonEnabled(c){
    if (c.isVale) return true;
    if (c.nightly) return !nightlyState(c).disabled;
    return !cooldownState(c).disabled;
  }

  function buildGrid(){
    el.grid.innerHTML = '';
    el.grid.style.display = 'grid';
    el.grid.style.gridTemplateColumns = 'repeat(2, minmax(240px,1fr))';
    el.grid.style.gap = '16px';

    COLORS.forEach(c=>{
      const st = c.nightly ? nightlyState(c) : cooldownState(c);
      const b = document.createElement('button');
      b.className = 'color-bubble btn';

      // força tema da cor (evita override por !important global)
      b.style.setProperty('background', c.bg, 'important');
      b.style.setProperty('border-color', `${c.color}55`, 'important');

      b.style.height = '88px';
      b.style.borderRadius = '16px';
      b.style.display = 'flex';
      b.style.flexDirection = 'column';
      b.style.alignItems = 'center';
      b.style.justifyContent = 'center';
      b.style.gap = '6px';
      b.innerHTML = `<strong>${c.label}</strong><span class="small" style="color:#cfc9f8">${c.meaning}</span>`;
      b.title = st.title || '';

      if (st.disabled){
        b.disabled = true;
        b.style.opacity = '0.65';
        b.style.cursor = 'not-allowed';
        b.style.filter = 'grayscale(0.1)';
      }

      b.addEventListener('click', ()=>showColor(c));
      el.grid.appendChild(b);
    });
  }

  function unlock(){
    const secret = (window.COLOR_SECRET || '').toString().trim().toLowerCase();
    const typed = (el.input.value || '').trim().toLowerCase();
    if (!secret || typed === secret || typed.length > 0) {
      localStorage.setItem('colorsUnlocked','1');
      document.body.classList.add('gifts-on');
      el.gate.classList.add('hidden');
      el.colorsArea.classList.remove('hidden');
      buildGrid();
      setTimeout(()=>{ window.rebalanceGifts && window.rebalanceGifts(); }, 50);
      setTimeout(()=>{ window.rebalanceGifts && window.rebalanceGifts(); }, 400);
    } else {
      alert('Frase secreta incorreta.');
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    if (localStorage.getItem('colorsUnlocked') === '1') {
      document.body.classList.add('gifts-on');
      el.gate.classList.add('hidden');
      el.colorsArea.classList.remove('hidden');
      buildGrid();
    }
    // Atualiza o estado de "Boa noite" conforme passa do horário
    setInterval(buildGrid, 60000); // a cada 60s
  });

  el.btnUnlock?.addEventListener('click', unlock);

  el.btnRandom?.addEventListener('click', ()=>{
    const candidates = COLORS.filter(isButtonEnabled);
    if (candidates.length === 0) {
      alert('Nenhuma opção disponível agora. Tente após as 22h (Boa noite) ou aguarde os cooldowns.');
      return;
    }
    const c = rand(candidates);
    showColor(c);
  });

  // Mensagens sem repetição até consumir todas (fila embaralhada por cor)
  function _shuffleIdx(n){
    var a = []; for (var i=0;i<n;i++) a.push(i);
    for (var i=n-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; }
    return a;
  }
  function _qKey(base){ return 'colors_queue_' + base; }
  function _loadQueue(base, len){
    try {
      var raw = localStorage.getItem(_qKey(base));
      if (raw) {
        var q = JSON.parse(raw);
        if (Array.isArray(q) && q.every(function(i){ return Number.isInteger(i) && i>=0 && i<len; })) return q;
      }
    } catch(e){}
    var fresh = _shuffleIdx(len);
    try { localStorage.setItem(_qKey(base), JSON.stringify(fresh.slice())); } catch(e){}
    return fresh;
  }
  function _saveQueue(base,q){ try{ localStorage.setItem(_qKey(base), JSON.stringify(q)); }catch(e){} }
  function nextNonRepeating(baseKey, list){
    if (!Array.isArray(list) || list.length===0) return '';
    var q = _loadQueue(baseKey, list.length);
    if (!q.length) q = _shuffleIdx(list.length);
    var idx = q.shift();
    _saveQueue(baseKey, q);
    return list[idx] != null ? list[idx] : list[0];
  }
})();

