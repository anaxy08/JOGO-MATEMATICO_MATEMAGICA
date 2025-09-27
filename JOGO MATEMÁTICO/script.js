// Estado do jogo
let score = 0;
let questionCount = 0;
const totalQuestions = 10;
let currentCorrectAnswer = 0;
let currentOptions = [];
let operators = ['+', '-', '×', '÷'];
let gameLevel = 1;
let lastQuestions = [];
let playerName = "";

// Referências de DOM (inicializam depois)
let startScreen, startBtn, nameScreen, playerNameInput, confirmNameBtn, gameContainer, gameContent, endGameScreen;
let questionElement, optionsGrid, feedbackMessage;
let scoreDisplay, totalQuestionsDisplay, finalScoreDisplay, progressBar, levelDisplay;
let rankingContainer, rankingList, starsContainer;

// Este array simula um "banco de dados" de pontuações
const rankingData = [
    { nome: "João", estrelas: 3, nivel: "Fácil" },
    { nome: "Maria", estrelas: 5, nivel: "Médio" },
    { nome: "Pedro", estrelas: 4, nivel: "Difícil" },
    { nome: "Ana", estrelas: 5, nivel: "Fácil" },
    { nome: "Lucas", estrelas: 2, nivel: "Fácil" }
];

// Inicialização segura após DOM pronto
document.addEventListener('DOMContentLoaded', () => {
    // Pega elementos
    startScreen = document.getElementById('start-screen');
    startBtn = document.getElementById('start-btn');
    nameScreen = document.getElementById('name-screen');
    playerNameInput = document.getElementById('player-name');
    confirmNameBtn = document.getElementById('confirm-name-btn');
    gameContainer = document.getElementById('game-container');
    gameContent = document.getElementById('game-content');
    endGameScreen = document.getElementById('end-game-screen');
    questionElement = document.getElementById('question');
    optionsGrid = document.getElementById('options-grid');
    feedbackMessage = document.getElementById('feedback-message');
    scoreDisplay = document.getElementById('score');
    totalQuestionsDisplay = document.getElementById('total-questions');
    finalScoreDisplay = document.getElementById('final-score');
    progressBar = document.getElementById('progress-bar');
    levelDisplay = document.getElementById('level');
    starsContainer = document.getElementById('stars');
    rankingContainer = document.getElementById('ranking-container');
    rankingList = document.getElementById('ranking-list');

    // Listeners (desktop e mobile)
    if (startBtn) {
        startBtn.addEventListener('click', startAdventure);
    }
    if (confirmNameBtn) {
        confirmNameBtn.addEventListener('click', () => {
            const nameValue = playerNameInput.value.trim();
            if (nameValue === "") {
                alert("Por favor, digite seu nome 😊");
                return;
            }
            playerName = nameValue;

            // Esconde a tela de nome e mostra o jogo
            nameScreen.classList.add('hidden');
            gameContainer.classList.remove('hidden');

            // Exibe o nome do jogador no título do jogo
            const gameTitle = document.getElementById('game-title');
            if (gameTitle) gameTitle.textContent = `Boa sorte, ${playerName}! 🚀`;

            startGame();
        });
    }

    // Exibe o ranking inicial
    exibirRanking();
});

// Função para iniciar a aventura
function startAdventure() {
    if (startBtn) startBtn.classList.add('scale-110');
    setTimeout(() => {
        if (startScreen) startScreen.classList.add('hidden');
        if (nameScreen) nameScreen.classList.remove('hidden');
    }, 400);
}

// Lógica do jogo
function getRandomOperator(level) {
    if (level === 1) return ['+', '-'][Math.floor(Math.random() * 2)];
    return operators[Math.floor(Math.random() * operators.length)];
}

function getOperands(operator, level) {
    let num1, num2, result;
    let max = level === 1 ? 20 : (level === 2 ? 50 : 100);

    switch (operator) {
        case '+':
            num1 = rand(max); num2 = rand(max);
            result = num1 + num2; break;
        case '-':
            num1 = rand(max); num2 = rand(Math.min(num1, max));
            if (num2 > num1) [num1, num2] = [num2, num1];
            result = num1 - num2; break;
        case '×':
            num1 = rand(level === 1 ? 5 : 10); num2 = rand(level === 1 ? 5 : 10);
            result = num1 * num2; break;
        case '÷':
            num2 = rand(level === 1 ? 5 : 10);
            result = rand(level === 1 ? 5 : 10);
            num1 = num2 * result; break;
    }
    return { num1, num2, result };
}

function rand(max) {
    return Math.floor(Math.random() * max) + 1;
}

function generateProblem() {
    let operator, num1, num2, result, key;
    let safety = 0;
    do {
        operator = getRandomOperator(gameLevel);
        ({ num1, num2, result } = getOperands(operator, gameLevel));
        key = `${num1}${operator}${num2}`;
        safety++;
        if (safety > 20) break;
    } while (lastQuestions.includes(key));

    lastQuestions.push(key);
    if (lastQuestions.length > 6) lastQuestions.shift();

    if (questionElement) questionElement.textContent = `${num1} ${operator} ${num2} = ?`;
    currentCorrectAnswer = result;
    generateOptions(result);
}

function generateOptions(correct) {
    currentOptions = [correct];
    while (currentOptions.length < 4) {
        let delta = Math.floor(Math.random() * 9) - 4;
        if (delta === 0) continue;
        let wrong = correct + delta;
        if (wrong >= 0 && !currentOptions.includes(wrong)) currentOptions.push(wrong);
    }
    currentOptions.sort(() => Math.random() - 0.5);

    if (optionsGrid) optionsGrid.innerHTML = '';
    currentOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = String(opt);
        btn.className = 'option-btn bg-blue-200 hover:bg-blue-300 p-3 rounded-lg transition';
        btn.onclick = () => checkAnswer(opt, btn);
        optionsGrid.appendChild(btn);
    });
}

function checkAnswer(selected, button) {
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

    if (selected === currentCorrectAnswer) {
        score++;
        button.classList.add('correct');
        feedbackMessage.textContent = '✅ Correto!';
    } else {
        button.classList.add('wrong');
        feedbackMessage.textContent = '❌ Errado!';
        [...document.querySelectorAll('.option-btn')].forEach(btn => {
            if (parseInt(btn.textContent, 10) === currentCorrectAnswer) btn.classList.add('correct');
        });
    }

    questionCount++;
    updateUI();

    setTimeout(() => {
        feedbackMessage.textContent = '';
        if (questionCount < totalQuestions) {
            generateProblem();
        } else {
            endGame();
        }
    }, 1000);
}

function updateUI() {
    if (scoreDisplay) scoreDisplay.textContent = String(score);
    if (levelDisplay) levelDisplay.textContent = String(gameLevel);
    if (totalQuestionsDisplay) totalQuestionsDisplay.textContent = String(totalQuestions);
    if (progressBar) progressBar.style.width = `${(questionCount / totalQuestions) * 100}%`;
}

function updateLevel() {
    if (score <= 3) gameLevel = 1;
    else if (score <= 7) gameLevel = 2;
    else gameLevel = 3;
}

function startGame() {
    questionCount = 0;
    score = 0;
    updateLevel();
    if (endGameScreen) endGameScreen.classList.add('hidden');
    if (gameContainer) gameContainer.classList.remove('hidden');
    if (gameContent) gameContent.classList.remove('hidden');
    updateUI();
    generateProblem();
}


function endGame() {
    updateLevel();
    if (gameContent) gameContent.classList.add('hidden');
    if (endGameScreen) endGameScreen.classList.remove('hidden');

    let stars = 1;
    if (score >= 8) stars = 3;
    else if (score >= 5) stars = 2;

    if (finalScoreDisplay) finalScoreDisplay.textContent = `Sua pontuação final é ${score} de ${totalQuestions}.`;
    if (starsContainer) {
        starsContainer.innerHTML = "";
        for (let i = 0; i < stars; i++) {
            const starImage = document.createElement('img');
            starImage.src = 'Icon_Cruzeiro_Ranking.png';
            starImage.alt = 'Estrela Mágica';
            starImage.classList.add("w-16", "h-16", "animate-bounce");
            starsContainer.appendChild(starImage);
        }
    }
    
    
    const novoJogador = {
        nome: playerName,
        estrelas: stars,
        nivel: obterNomeDoNivel(gameLevel)
    };

    // Adiciona o jogador ao ranking principal
    adicionarAoRanking(novoJogador);

    // Exibe o resultado da partida atual na tela de fim de jogo
    if (document.getElementById('current-player-name')) {
        document.getElementById('current-player-name').textContent = novoJogador.nome;
    }
    if (document.getElementById('current-player-level')) {
        document.getElementById('current-player-level').textContent = `Nível: ${novoJogador.nivel}`;
    }
    const currentPlayerStarsDiv = document.getElementById('current-player-stars');
    if (currentPlayerStarsDiv) {
        currentPlayerStarsDiv.innerHTML = ""; // Limpa as estrelas anteriores
        for (let i = 0; i < novoJogador.estrelas; i++) {
            const estrelaSpan = document.createElement('span');
            estrelaSpan.classList.add('text-yellow-400');
            estrelaSpan.textContent = '★';
            currentPlayerStarsDiv.appendChild(estrelaSpan);
        }
    }
}
  // exibe o resultado da partida atual na tela de fim de jogo
  document.getElementById('current-player-name').textContent = novoJogador.nome;
  document.getElementById('current-player-level').textContent = `Nível: ${novoJogador.nivel}`;
  const currentPlayerStarsDiv = document.getElementById('current-player-stars');
  currentPlayerStarsDiv.innerHTML = ""; // limpa as estrelas anteriores
  for (let i = 0; i < novoJogador.estrelas; i++) {
    const estrelaSpan = document.createElement('span');
    estrelaSpan.classList.add('text-yellow-400');
    estrelaSpan.textContent = '★';
    currentPlayerStarsDiv.appendChild(estrelaSpan);
  }
    

    const novoJogador = {
        nome: playerName,
        estrelas: stars,
        nivel: obterNomeDoNivel(gameLevel)
    };

    adicionarAoRanking(novoJogador);


// Funções do Ranking
function exibirRanking() {
    if (!rankingList) return;
    rankingList.innerHTML = '';

    rankingData.sort((a, b) => b.estrelas - a.estrelas);

    const top5 = rankingData.slice(0, 5);

    top5.forEach(jogador => {
        const itemLista = document.createElement('li');
        itemLista.classList.add('flex', 'flex-col', 'p-2', 'bg-gray-50', 'rounded-md');

        const topRow = document.createElement('div');
        topRow.classList.add('flex', 'items-center', 'justify-between');

        const nomeSpan = document.createElement('span');
        nomeSpan.classList.add('font-bold', 'text-blue-800');
        nomeSpan.textContent = jogador.nome;

        const estrelasDiv = document.createElement('div');
        estrelasDiv.classList.add('flex', 'items-center', 'space-x-1');
        for (let i = 0; i < jogador.estrelas; i++) {
            const estrelaSpan = document.createElement('span');
            estrelaSpan.classList.add('text-yellow-400');
            estrelaSpan.textContent = '★';
            estrelasDiv.appendChild(estrelaSpan);
        }

        topRow.appendChild(nomeSpan);
        topRow.appendChild(estrelasDiv);

        const nivelP = document.createElement('p');
        nivelP.classList.add('text-gray-600', 'text-sm');
        nivelP.textContent = `Nível: ${jogador.nivel}`;

        itemLista.appendChild(topRow);
        itemLista.appendChild(nivelP);
        rankingList.appendChild(itemLista);
    });
}

function adicionarAoRanking(novoJogador) {
    rankingData.push(novoJogador);
    exibirRanking();
}

function obterNomeDoNivel(nivel) {
    switch (nivel) {
        case 1:
            return "Fácil";
        case 2:
            return "Médio";
        case 3:
            return "Difícil";
        default:
            return "Nível " + nivel;
    }
}