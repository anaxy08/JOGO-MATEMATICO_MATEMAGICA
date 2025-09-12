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
const nameScreen = document.getElementById('name-screen');
const nameInput = document.getElementById('player-name');
const confirmNameBtn = document.getElementById('confirm-name-btn');


// Referências de DOM (inicializam depois)

let startScreen, startBtn, gameContainer, gameContent, endGameScreen;
let questionElement, optionsGrid, feedbackMessage;
let scoreDisplay, totalQuestionsDisplay, finalScoreDisplay, progressBar, levelDisplay;

// Inicialização segura após DOM pronto

document.addEventListener('DOMContentLoaded', () => {
  // Pega elementos
  startScreen = document.getElementById('start-screen');
  startBtn = document.getElementById('start-btn');
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

  // Listeners (desktop e mobile)
  if (startBtn) {
    startBtn.addEventListener('click', startAdventure);
    startBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startAdventure(); }, { passive: false });
  }
});

// Função global usada pelo HTML (onclick)
function startAdventure() {
  try {
    if (startBtn) startBtn.classList.add('scale-110');
    setTimeout(() => {
      if (startScreen) startScreen.classList.add('hidden');
      if (nameScreen) nameScreen.classList.remove('hidden'); // mostra tela digitar nome
      startGame();
    }, 400);
  } catch (err) {
    console.error('Erro ao iniciar a aventura:', err);
    // Fallback: mostra o jogo mesmo assim
    if (startScreen) startScreen.classList.add('hidden');
    if (gameContainer) gameContainer.classList.remove('hidden');
    startGame();
  }
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
      num1 = rand(max); num2 = rand(Math.min(num1, max)); // evita negativo
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
    if (safety > 20) break; // evita loop raro
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
    let delta = Math.floor(Math.random() * 9) - 4; // -4..+4
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
  if (gameContent) gameContent.classList.remove('hidden');
  updateUI();
  generateProblem();
}

function endGame() {
  updateLevel();
  if (gameContent) gameContent.classList.add('hidden');
  if (endGameScreen) endGameScreen.classList.remove('hidden');
  if (finalScoreDisplay) finalScoreDisplay.textContent = `Sua pontuação final é ${score} de ${totalQuestions}.`;

  const starsContainer = document.getElementById('stars');
  if (starsContainer) {
    starsContainer.innerHTML = "";
    let stars = 1;
    if (score >= 8) stars = 3;
    else if (score >= 5) stars = 2;
    for (let i = 0; i < stars; i++) {
      const star = document.createElement('span');
      star.textContent = "⭐";
      star.classList.add("animate-bounce");
      starsContainer.appendChild(star);
    }
  }
}
// tela de identificação 
if (confirmNameBtn) {
  confirmNameBtn.addEventListener('click', () => {
    const nameValue = nameInput.value.trim();
    if (nameValue === "") {
      alert("Por favor, digite seu nome 😊");
      return;
    }
    playerName = nameValue;

    // Esconde a tela de nome e abre o jogo
    nameScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');

    // Mostra nome na tela do jogo
    const title = document.getElementById('game-title');
    if (title) title.textContent = `Boa sorte, ${playerName}! 🚀`;

    startGame();
  });
}

