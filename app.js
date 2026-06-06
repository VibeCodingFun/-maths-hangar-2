/* =========================================
   2. GAME STATE MANAGEMENT
   ========================================= */
const GameState = {
    timeLeft: 60,
    isPaused: false,
    score: 0,
    questionsSinceLastDrop: 0,
    nextDropTarget: getRandomDropTarget(),
    currentAnswer: 0,
    unlockedAircraft: []
};

function getRandomDropTarget() {
    return Math.floor(Math.random() * 4) + 2; 
}

/* =========================================
   3. DOM ELEMENTS
   ========================================= */
const ui = {
    timerDisplay: document.getElementById('timer-display'),
    progressBar: document.getElementById('progress-bar-fill'),
    questionDisplay: document.getElementById('question-display'),
    inputField: document.getElementById('answer-input'),
    hangarContainer: document.getElementById('hangar-container'),
    gallery: document.getElementById('gallery')
};

/* =========================================
   4. CORE GAME LOOP & TIMER
   ========================================= */
function startTimer() {
    setInterval(() => {
        if (!GameState.isPaused && GameState.timeLeft > 0) {
            GameState.timeLeft--;
            ui.timerDisplay.innerText = GameState.timeLeft;
            const percentage = (GameState.timeLeft / 60) * 100;
            ui.progressBar.style.width = percentage + "%";
        } else if (GameState.timeLeft === 0) {
            ui.questionDisplay.innerText = "Mission Complete!";
            ui.inputField.disabled = true;
        }
    }, 1000);
}

/* =========================================
   5. MATH LOGIC
   ========================================= */
function generateQuestion() {
    const operations = ['addition', 'subtraction', 'multiplication', 'division'];
    const randomOp = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2;

    switch (randomOp) {
        case 'addition':
            const targetSum = Math.floor(Math.random() * 199) + 2;
            num1 = Math.floor(Math.random() * (targetSum - 1)) + 1;
            num2 = targetSum - num1;
            GameState.currentAnswer = targetSum;
            ui.questionDisplay.innerText = `${num1} + ${num2}`;
            break;
        case 'subtraction':
            num1 = Math.floor(Math.random() * 100) + 1;
            num2 = Math.floor(Math.random() * (num1 + 1));
            GameState.currentAnswer = num1 - num2;
            ui.questionDisplay.innerText = `${num1} - ${num2}`;
            break;
        case 'multiplication':
            num1 = Math.floor(Math.random() * 12) + 1;
            num2 = Math.floor(Math.random() * 12) + 1;
            GameState.currentAnswer = num1 * num2;
            ui.questionDisplay.innerText = `${num1} × ${num2}`;
            break;
        case 'division':
            const expectedAnswer = Math.floor(Math.random() * 12) + 1;
            num2 = Math.floor(Math.random() * 12) + 1;
            num1 = expectedAnswer * num2;
            GameState.currentAnswer = expectedAnswer;
            ui.questionDisplay.innerText = `${num1} ÷ ${num2}`;
            break;
    }
}

ui.inputField.addEventListener('input', (e) => {
    const userAnswer = parseInt(e.target.value);
    if (userAnswer === GameState.currentAnswer) {
        ui.inputField.value = '';
        GameState.score++;
        GameState.questionsSinceLastDrop++;
        checkLootDrop();
        generateQuestion();
    }
});

/* =========================================
   6. LOOT & HANGAR LOGIC
   ========================================= */
function checkLootDrop() {
    if (GameState.questionsSinceLastDrop >= GameState.nextDropTarget) {
        GameState.isPaused = true;
        const locked = aircraftDatabase.filter(a => !GameState.unlockedAircraft.includes(a));
        if (locked.length > 0) {
            const reward = locked[Math.floor(Math.random() * locked.length)];
            GameState.unlockedAircraft.push(reward);
            if (GameState.unlockedAircraft.length === 1) ui.hangarContainer.classList.remove('hidden');
            renderHangar();
            alert(`Loot Drop! You unlocked: ${reward.name}`);
        }
        GameState.questionsSinceLastDrop = 0;
        GameState.nextDropTarget = getRandomDropTarget();
        GameState.isPaused = false;
    }
}

function renderHangar() {
    ui.gallery.innerHTML = '';
    GameState.unlockedAircraft.forEach(aircraft => {
        const card = document.createElement('div');
        card.className = 'aircraft-card';
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front rarity-${aircraft.rarity}">
                    <img src="${aircraft.photo}" alt="${aircraft.name}" class="aircraft-card-img" />
                    <h3>${aircraft.name}</h3>
                </div>
                <div class="card-back rarity-${aircraft.rarity}">
                    <h3>${aircraft.name}</h3>
                    <p>Speed: ${aircraft.speed}</p>
                    <p>${aircraft.rarity.toUpperCase()}</p>
                </div>
            </div>
        `;
        card.addEventListener('click', () => card.classList.toggle('is-flipped'));
        ui.gallery.appendChild(card);
    });
}

generateQuestion();
startTimer();