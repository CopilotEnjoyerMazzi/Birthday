// utils.js — utilitários gerais
function shuffle(array){
  const a = array.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function fmtTime(sec){
  const m = Math.floor(sec/60).toString().padStart(2,'0');
  const s = Math.floor(sec%60).toString().padStart(2,'0');
  return m+':'+s;
}
// normaliza string: remove acentos e espaços e deixa MAIÚSCULA
function normalizeStr(s){
  return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'').toUpperCase();
}

