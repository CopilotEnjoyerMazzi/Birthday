// data.js — perguntas, respostas, dificuldades, dicas e 50/50
// Índice de alternativas: 0=A, 1=B, 2=C, 3=D, 4=E (quando houver)

const QUESTIONS = [
  // SUBSTITUIÇÕES (eram conhecimentos gerais: ids 1,2,3,4,5,8,13,14,15)

  { id: 1,
    question: "Qual seu melhor pistol?",
    options: ["classic","frenzy","ghost","sheriff"],
    correct: 0,
    difficulty: "Médio",
    hint: "Custa 0 leleus",
    fifty_keep: [0,2]
  },
  { id: 2,
    question: "Qual o nome da minha cachorra?",
    options: ["Belle","Bella","Bellinha","Bellovski"],
    correct: 1,
    difficulty: "Fácil",
    hint: "Você",
    fifty_keep: [1,0]
  },
  { id: 3,
    question: "Qual o nome da minha mãe?",
    options: ["Vanessa","Sueli","Lilian","Viviane"],
    correct: 3,
    difficulty: "Difícil",
    hint: "O apelido dela é Vi",
    fifty_keep: [3,0]
  },
  { id: 4,
    question: "Qual meu username no Discord (não o display name)?",
    options: ["itsmebozo","overrbozo","itsoverrbozo","itsmeoverr"],
    correct: 3,
    difficulty: "Difícil",
    hint: "soueuoverr",
    fifty_keep: [3,1]
  },
  { id: 5,
    question: "Qual o jogo que eu mais odeio?",
    options: ["stardew valley","valorant","lol","minecraft"],
    correct: 0,
    difficulty: "Fácil",
    hint: "Você ama esse jogo (não faz sentido)",
    fifty_keep: [0,2]
  },
  // id 6 permanece das suas questões antigas
  { id: 6,
    question: "Complete a frase: Eu não fecho com a droga do diabo, eu...",
    options: ["Tenho um labubu ao meu lado","Tenho o meu teacher pra me proteger","Tenho Jesus ao meu lado","Tenho Jesus Cristo ao meu lado"],
    correct: 3,
    difficulty: "Médio",
    hint: "CRIXXXTO",
    fifty_keep: [3,2]
  },
  // id 7 permanece
  { id: 7,
    question: "Quem falou \"te amo\" primeiro no WhatsApp?",
    options: ["Teacher Mazzi (euzinho)","Isa","MATEI TREIXXXXXXXXXX","Gomes"],
    correct: 0,
    difficulty: "Fácil",
    hint: "NÃO FOI O GOMES",
    fifty_keep: [0,1]
  },
  // substitui o antigo id 8 (Lavoisier)
  { id: 8,
    question: "Qual palavra eu começo no Termo?",
    options: ["Ruela","Furia","Atlas","Longe"],
    correct: 1,
    difficulty: "Fácil",
    hint: "Pior time do Brasil",
    fifty_keep: [1,3]
  },
  // id 9 permanece
  { id: 9,
    question: "Quem eu odeio?",
    options: ["Gomes","Gomes","O GOMES EU ODEIO O GOMES AAAAAAAAAAAA","Gomes"],
    correct: 2,
    difficulty: "Difícil",
    hint: "EU ODEIO MUITO O GOMES",
    fifty_keep: [2,0]
  },
  // id 10 permanece
  { id: 10,
    question: "Qual a nossa série?",
    options: ["Lúcifer","You","Castle","Round 6"],
    correct: 2,
    difficulty: "Fácil",
    hint: "Você é uma rainha, e mora em um ______",
    fifty_keep: [2,1]
  },
  // id 11 permanece
  { id: 11,
    question: "Quantos dias depois de te conhecer eu mandei minha primeira foto no banho?",
    options: ["1","2","3","4"],
    correct: 1,
    difficulty: "Difícil",
    hint: "Ganhamos intimidade muito rápido",
    fifty_keep: [1,0]
  },
  // id 12 permanece
  { id: 12,
    question: "Qual o maior dos problemas que a gente enfrentava no Valorant, no começo?",
    options: ["Time","Habilidade","Rede","O Aspas na má fase"],
    correct: 2,
    difficulty: "Médio",
    hint: "INTERNET DE MERDA TO COM 200 DE PING NO WILD RIFT",
    fifty_keep: [2,1]
  },
  // substitui o antigo id 13 (óxidos)
  { id: 13,
    question: "Qual apelido me traumatizou?",
    options: ["Best","Teacher","Momo","Dani"],
    correct: 0,
    difficulty: "Médio",
    hint: "EU JURO QUE SOU MAIS QUE ISSO",
    fifty_keep: [0,1]
  },
  // substitui o antigo id 14 (ONU/Palestina)
  { id: 14,
    question: "Quem é o divo?",
    options: ["Pedro","Daniel","Miguel","Kauan"],
    correct: 2,
    difficulty: "Médio",
    hint: "Seu bestzinho",
    fifty_keep: [2,1]
  },
  // substitui o antigo id 15 (Ucrânia)
  { id: 15,
    question: "Como está salvo seu contato no meu celular?",
    options: ["Isa 💜","Isah 💜","My Goddess 💜","Best 💜"],
    correct: 2,
    difficulty: "Médio",
    hint: "Você é uma deusa mesmo",
    fifty_keep: [2,0]
  },
  // ids 16,17,18 permanecem
  { id: 16,
    question: "Quantuixxx você matou?",
    options: ["DOIXXX","TREIXXXXXX","SEIXXXX","DÉIXXXXX"],
    correct: 1,
    difficulty: "Fácil",
    hint: "VOCÊ MATOU A METADE DE SEIXXXX",
    fifty_keep: [1,0]
  },
  { id: 17,
    question: "Quantos meses tem o Meia? (ele parece que está de meia)",
    options: ["Aproximadamente 1 mês","Aproximadamente 3 meses","Aproximadamente 6 meses","Aproximadamente 10 meses"],
    correct: 3,
    difficulty: "Fácil",
    hint: "É SEU GATO POKKKKKKKKKKKKKKKKKKK (ele ta velhinho)",
    fifty_keep: [3,1]
  },
  { id: 18,
    question: "Qual seu plano como aluna?",
    options: ["Premium","Deluxe","Vip","Ultra"],
    correct: 2,
    difficulty: "Fácil",
    hint: "See cassava",
    fifty_keep: [2,0]
  }
];

// Mapeamento final desejado (slots → letras → números no alfabeto):
// "AMO VOCE PRINCESA" = [1,13,15,22,15,3,5,16,18,9,14,3,5,19,1]
// São 15 slots principais, mas temos 18 perguntas no total
const SLOT_LETTERS = ["A","M","O","V","O","C","E","P","R","I","N","C","E","S","A"];
const ALPHABET_INDEX = Object.fromEntries("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c,i)=>[c,i+1]));
const SLOT_CODES = SLOT_LETTERS.map(ch => ALPHABET_INDEX[ch]);

