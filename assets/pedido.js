// pedido.js — protege o conteúdo do pedido com uma senha simples
document.getElementById('btnOpen').addEventListener('click',()=>{
  const pwd = document.getElementById('pwd').value;
  if(pwd===EASTER_PASSWORD){
    document.getElementById('pedidoArea').classList.remove('hidden');
  }else{
    alert('Senha incorreta.');
  }
});

