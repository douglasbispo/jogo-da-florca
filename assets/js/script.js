let imagemFlor, dica, palavraDisplay, letrasDiv, mensagemFimJogo, vitoriasSpan, derrotasSpan;
let somDerrota, somVitoria;
let timeoutMensagem;

document.addEventListener("DOMContentLoaded", () => {
  imagemFlor = document.getElementById("imagem-flor");
  dica = document.getElementById("dica");
  palavraDisplay = document.getElementById("palavra");
  letrasDiv = document.querySelector(".letras");
  mensagemFimJogo = document.getElementById("mensagem-fim-jogo");
  vitoriasSpan = document.getElementById("vitorias");
  derrotasSpan = document.getElementById("derrotas");
  somDerrota = document.getElementById("som-derrota");
  somVitoria = document.getElementById("som-vitoria");

  const pathname = window.location.pathname;

  if (pathname.includes("index.html")) {
    const btn1 = document.getElementById("btn-1jogador");
    const btn2 = document.getElementById("btn-2jogadores");

    btn1.addEventListener("click", () => window.location.href = "view/jogo.html?modo=1");
    btn2.addEventListener("click", () => window.location.href = "view/form-2jogadores.html");
  }

  if (pathname.includes("form-2jogadores.html")) {
      document.getElementById("iniciar-jogo").addEventListener("click", () => {
      const palavraOriginal = document.getElementById("palavra-input").value.trim();
      const dica = document.getElementById("dica-input").value.trim();

      const resultado = validarCampos(palavraOriginal, dica);

      if (!resultado.valido) {
        exibirMensagem(resultado.mensagem, "erro");
        return;
      }

      sessionStorage.setItem("palavra", resultado.palavra);
      sessionStorage.setItem("dica", resultado.dica);
      sessionStorage.setItem("modo", "2");

      window.location.href = "jogo.html";
    });
  }

  if (pathname.includes("fim.html")) {
      mostrarResultadoFinal();

      document.getElementById("voltar-inicio").addEventListener("click", () => {
        window.location.href = "../index.html";
      })
  }

  if (pathname.includes("jogo.html")) {
    iniciarModoDeJogo();
  }
})


const urlParams = new URLSearchParams(window.location.search);
let modoAtual = urlParams.get("modo");

if (!modoAtual || (modoAtual !== "1" && modoAtual !== "2")) {
  modoAtual = sessionStorage.getItem("modo") || "1";
}

const palavraArmazenada = sessionStorage.getItem("palavra");
const dicaArmazenada = sessionStorage.getItem("dica");

let palavraAtual = "";
let dicaAtual = "";
let letrasCorretas = [];
let letrasErradas = [];
let erros = 0;
const maxErros = 6;

let vitorias = parseInt(sessionStorage.getItem("vitorias")) || 0;
let derrotas = parseInt(sessionStorage.getItem("derrotas")) || 0;
let partidas = parseInt(sessionStorage.getItem("partidas")) || 0;

const palavrasBanco = [
  { palavra: "girassol", dica: "Flor que gosta de sol" },
  { palavra: "bicicleta", dica: "Meio de transporte com pedais" },
  { palavra: "montanha", dica: "Formação geográfica alta" },
  { palavra: "borboleta", dica: "Inseto colorido com asas" },
  { palavra: "brasil", dica: "País sul-americano" },
  { palavra: "teclado", dica: "Usado para digitar" },
  { palavra: "ventilador", dica: "Aparelho para refrescar" },
  { palavra: "abacaxi", dica: "Fruta tropical com casca grossa" },
  { palavra: "elefante", dica: "Maior animal terrestre" },
  { palavra: "oceano", dica: "Grande corpo de água salgada" },
  { palavra: "cadeira", dica: "Usada para sentar" },
  { palavra: "escola", dica: "Lugar de aprendizado" },
  { palavra: "planeta", dica: "A Terra é um..." },
  { palavra: "jardim", dica: "Lugar com plantas" },
  { palavra: "nuvem", dica: "Fica no céu e traz chuva" },
  { palavra: "estrelas", dica: "Brilham no céu à noite" },
  { palavra: "livro", dica: "Fonte de conhecimento e leitura" },
  { palavra: "janela", dica: "Abre para deixar o ar entrar" },
  { palavra: "dinossauro", dica: "Animal pré-historico" },
  { palavra: "computador", dica: "Maquina usada para trabalhar e jogar" },
  { palavra: "guitarra", dica: "Instrumento musical de cordas" },
  { palavra: "morango", dica: "Fruta vermelha e pequena" },
  { palavra: "telefone", dica: "Usado para fazer ligacoes" },
  { palavra: "foguete", dica: "Usado para ir ao espaco" },
  { palavra: "gelo", dica: "Agua em estado solido" },
  { palavra: "camisa", dica: "Roupa usada na parte de cima do corpo" },
  { palavra: "mochila", dica: "Usada para carregar materiais" },
  { palavra: "tigre", dica: "Felino listrado e selvagem" },
  { palavra: "rio", dica: "Curso natural de agua" },
  { palavra: "areia", dica: "Encontrada em praias e desertos" }
];

function iniciarModoDeJogo() {
  if (modoAtual === "1") {
    const sorteio = palavrasBanco[Math.floor(Math.random() * palavrasBanco.length)];

    palavraAtual = sorteio.palavra.toLowerCase();
    dicaAtual = sorteio.dica;
  } else {
    palavraAtual = palavraArmazenada;
    dicaAtual = dicaArmazenada;
  }

  iniciarJogo();
}

function iniciarJogo() {
  erros = 0;
  letrasCorretas = [];
  letrasErradas = [];
  mensagemFimJogo.textContent = "";
  dica.textContent = "Dica: " + dicaAtual;
  imagemFlor.src = `../assets/img/flores/flor${maxErros - erros}.png`;

  atualizarPalavra();
  criarBotoes();

  if (modoAtual === "1") {
    if (vitoriasSpan) vitoriasSpan.textContent = vitorias;
    if (derrotasSpan) derrotasSpan.textContent = derrotas;
  } else {
    // Se modo for 2 jogadores, esconde a pontuação
    const pontuacao = document.querySelector(".pontuacao");
    if (pontuacao) pontuacao.style.display = "none";
  }
}

function atualizarPalavra() {
  let resultado = "";
  for (let letra of palavraAtual) {
    resultado += letrasCorretas.includes(letra) ? letra + " " : letra === " " ? "  " : "_ ";
  }
  palavraDisplay.textContent = resultado.trim();
  verificarFim();
}

function criarBotoes() {
  letrasDiv.innerHTML = "";

  for (let i = 65; i <= 90; i++) {
    const letra = String.fromCharCode(i).toLowerCase();
    const btn = document.createElement("button");
    btn.classList.add("botao-teclado")
    btn.textContent = letra;
    btn.onclick = () => jogarLetra(letra, btn);
    letrasDiv.appendChild(btn);
  }
}

function jogarLetra(letra, btn) {
  btn.disabled = true;

  if (palavraAtual.includes(letra)) {
    letrasCorretas.push(letra);
    btn.style.backgroundColor = "#008000";
    btn.style.color = "#ffffff";
  } else {
    erros++;
    letrasErradas.push(letra);
    imagemFlor.src = `../assets/img/flores/flor${maxErros - erros}.png`;
    btn.style.backgroundColor = "#FF0000";
    btn.style.color = "#ffffff";
  }
  atualizarPalavra();
}

function verificarFim() {
  const container = document.querySelector(".letras");
  const correta = palavraAtual.split("").every(l => l === " " || letrasCorretas.includes(l));
  
  if (correta) {
    mensagemFimJogo.classList.remove("escondido");
    mensagemFimJogo.innerHTML = `<i class="fa-solid fa-hand-peace"></i> Parabéns, Você venceu!`;
    somVitoria.play();

    letrasDiv.innerHTML = "";

    if (modoAtual === "1") vitorias++;
  } else if (erros >= maxErros) {
    mensagemFimJogo.classList.remove("escondido");
    mensagemFimJogo.innerHTML = `<i class="fa-solid fa-skull"></i> Você perdeu! A palavra era: <span>${palavraAtual}</span>`;
    somDerrota.play();
    
    letrasDiv.innerHTML = "";

    if (modoAtual === "1") derrotas++;
  } else {
    // Jogo ainda não terminou, sai da função
    return;
  }

  // Executa ao fim do jogo, se for modo 1 jogador
  if (modoAtual === "1") {
    partidas++;
    salvarPontuacao();
    atualizarPontuacaoNaTela();
  }
  exibirOpcoesFim();
}

function salvarPontuacao() {
  sessionStorage.setItem("vitorias", vitorias);
  sessionStorage.setItem("derrotas", derrotas);
  sessionStorage.setItem("partidas", partidas);
}

function atualizarPontuacaoNaTela() {
  const vitoriasSpan = document.getElementById("vitorias");
  const derrotasSpan = document.getElementById("derrotas");

  if (vitoriasSpan) vitoriasSpan.textContent = vitorias;
  if (derrotasSpan) derrotasSpan.textContent = derrotas;
}

function exibirOpcoesFim() {
  if (modoAtual === "1") {
    const btnNovo = document.createElement("button");
    btnNovo.classList.add("botao");
    btnNovo.textContent = "Jogar novamente";
    btnNovo.onclick = () => window.location.href = "jogo.html?modo=1";
  
    const btnSair = document.createElement("button");
    btnSair.classList.add("botao");
    btnSair.textContent = "Encerrar";
    btnSair.onclick = () => window.location.href = "fim.html";
  
    letrasDiv.appendChild(btnNovo);
    letrasDiv.appendChild(btnSair);
  } else {  
    const btnNovo = document.createElement("button");
    btnNovo.classList.add("botao");
    btnNovo.textContent = "Jogar novamente";
    btnNovo.onclick = () => window.location.href = "form-2jogadores.html";

    const btnSair = document.createElement("button");
    btnSair.classList.add("botao");
    btnSair.textContent = "Encerrar";
    btnSair.onclick = () => window.location.href = "../index.html";
  
    letrasDiv.appendChild(btnNovo);
    letrasDiv.appendChild(btnSair);
  }
}

function mostrarResultadoFinal() {
  const partidasFim = document.querySelector("#partidas-fim");
  const vitoriasFim = document.querySelector("#vitorias-fim");
  const derrotasFim = document.querySelector("#derrotas-fim");
  
  partidasFim.textContent = partidas;
  vitoriasFim.textContent = vitorias;
  derrotasFim.textContent = derrotas;
}

function exibirMensagem(mensagem, tipo = "erro", duracao = 5000) {
  const campoMensagem = document.getElementById("campo-mansagem");
  const mensagemElemento = document.getElementById("mensagem");

  if (!campoMensagem || !mensagemElemento) return;

  mensagemElemento.innerHTML = mensagem;
  
  // Remove todas as classes que começam com "mensagem-"
  mensagemElemento.classList.forEach(classe => {
    if (classe.startsWith("mensagem-")) {
      mensagemElemento.classList.remove(classe);
    }
  });
  
  campoMensagem.classList.remove("escondido");
  mensagemElemento.classList.add(`mensagem-${tipo}`);

  clearTimeout(timeoutMensagem);

  timeoutMensagem = setTimeout(() => {
    campoMensagem.classList.add("escondido");
  }, duracao);

  console.log("Mensagem chamada");
}

function validarCampos(palavraOriginal, dica) {
  if (!palavraOriginal || !dica) {
    return { valido: false, mensagem: "Preencha os dois campos antes de continuar." };
  }

  const palavraSemAcento = palavraOriginal.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const contemCaracterInvalido = /[^a-zA-Z\s]/.test(palavraSemAcento);
  const temAcento = palavraOriginal !== palavraSemAcento;

  if (contemCaracterInvalido || temAcento) {
    return { valido: false, mensagem: "A palavra não pode conter acentos, números ou símbolos especiais." };
  }

  return { valido: true, palavra: palavraSemAcento.toLowerCase(), dica };
}