/* =========================================
   2. GAME STATE MANAGEMENT
   ========================================= */
const GameState = {
    timeLeft: 20,
    isPaused: true, 
    score: 0,
    questionsSinceLastDrop: 0,
    nextDropTarget: getRandomDropTarget(),
    currentAnswer: 0,
    unlockedAircraft: [] 
};

let aircraftDatabase = [];

function getRandomDropTarget() { return Math.floor(Math.random() * 4) + 2; }

/* =========================================
   3. UI & DOM ELEMENTS
   ========================================= */
const ui = {
    timerDisplay: document.getElementById('timer-display'),
    progressBar: document.getElementById('progress-bar-fill'),
    questionDisplay: document.getElementById('question-display'),
    inputField: document.getElementById('answer-input'),
    hangarContainer: document.getElementById('hangar-container'),
    gallery: document.getElementById('gallery'),
    nextBtn: document.getElementById('next-btn')
};

/* =========================================
   4. HELPER FUNCTIONS (Placed here to avoid ReferenceErrors)
   ========================================= */
function getRandomPlaneFromDatabase() {
    const ownedIds = GameState.unlockedAircraft.map(p => p.id);
    const locked = aircraftDatabase.filter(a => !ownedIds.includes(a.id));
    
    if (locked.length > 0) {
        return locked[Math.floor(Math.random() * locked.length)];
    }
    return aircraftDatabase[Math.floor(Math.random() * aircraftDatabase.length)];
}

async function fetchAircraftPhoto(query) {
    if (typeof PEXELS_KEY === 'undefined') {
        console.error("PEXELS_KEY is undefined!");
        return "fallback-darkness.jpg";
    }

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;

    try {
        const response = await fetch(url, {
            headers: { 
                'Authorization': PEXELS_KEY // Try it WITHOUT the word 'Bearer' first
            }
        });
        
        if (response.status === 401) {
            console.error("401 Unauthorized: Your API Key is rejected by Pexels.");
        }

        const data = await response.json();
        return data.photos && data.photos.length > 0 
            ? data.photos[0].src.medium 
            : "fallback-darkness.jpg";
    } catch (error) {
        console.error("Failed to fetch image", error);
        return "fallback-darkness.jpg";
    }
}

/* =========================================
   5. GAME LOGIC
   ========================================= */
async function checkLootDrop() { 
    if (GameState.questionsSinceLastDrop >= GameState.nextDropTarget) {
        const reward = getRandomPlaneFromDatabase(); 
        if (reward) {
            if (!reward.photo || (typeof reward.photo === 'string' && reward.photo.includes(".jpg"))) {
                reward.photo = await fetchAircraftPhoto(reward.searchQuery);
            }
            GameState.unlockedAircraft.push(reward);
            saveProgress();
            renderHangar();
            showLootNotification(reward); 
        }
        GameState.questionsSinceLastDrop = 0;
        GameState.nextDropTarget = getRandomDropTarget();
    }
}

function saveProgress() {
    const dataToSave = {
        unlockedAircraft: GameState.unlockedAircraft,
        score: GameState.score
    };
    localStorage.setItem('mathsHangarSave', JSON.stringify(dataToSave));
}

function loadProgress() {
    const savedData = localStorage.getItem('mathsHangarSave');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        GameState.unlockedAircraft = parsed.unlockedAircraft || []; 
        GameState.score = parsed.score || 0;
        renderHangar(); 
    }
}

/* =========================================
   6. CORE GAME FLOW
   ========================================= */
function startTimer() {
    clearInterval(timerInterval); 
    GameState.timeLeft = 20;
    ui.timerDisplay.innerText = GameState.timeLeft;
    ui.progressBar.style.width = "100%";

    timerInterval = setInterval(() => {
        if (!GameState.isPaused && GameState.timeLeft > 0) {
            GameState.timeLeft--;
            ui.timerDisplay.innerText = GameState.timeLeft;
            ui.progressBar.style.width = (GameState.timeLeft / 20) * 100 + "%";
        } else if (GameState.timeLeft === 0 && !GameState.isPaused) {
            clearInterval(timerInterval);
            endTurn(false);
        }
    }, 1000);
}

let timerInterval;

function endTurn(isCorrect) {
    GameState.isPaused = true;
    ui.inputField.disabled = true;
    ui.nextBtn.classList.remove('hidden');
    ui.questionDisplay.innerText = `Answer: ${GameState.currentAnswer}`;
}

ui.nextBtn.addEventListener('click', () => {
    ui.nextBtn.classList.add('hidden');
    ui.inputField.value = '';
    ui.inputField.disabled = false;
    ui.inputField.focus(); 
    GameState.timeLeft = 20;
    GameState.isPaused = false;
    generateQuestion();
    startTimer();
});

/* =========================================
   7. MATH & RENDERING
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
        GameState.score++;
        GameState.questionsSinceLastDrop++;
        checkLootDrop();
        endTurn(true);
    }
});

async function renderHangar() {
    ui.gallery.innerHTML = '';
    ui.hangarContainer.classList.remove('hidden');
    for (const aircraft of GameState.unlockedAircraft) {
        if (!aircraft.photo || aircraft.photo.includes(".jpg")) { 
            aircraft.photo = await fetchAircraftPhoto(aircraft.searchQuery);
        }
        const card = document.createElement('div');
        card.className = 'aircraft-card';
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front rarity-${aircraft.rarity}">
                    <img src="${aircraft.photo}" class="aircraft-card-img" />
                    <h3>${aircraft.name}</h3>
                </div>
                <div class="card-back rarity-${aircraft.rarity}">
                    <h3>${aircraft.name}</h3>
                    <p>Speed: ${aircraft.speed}</p>
                    <p>${aircraft.rarity.toUpperCase()}</p>
                </div>
            </div>`;
        card.addEventListener('click', () => card.classList.toggle('is-flipped'));
        ui.gallery.appendChild(card);
    }
}

function showLootNotification(plane) { /* ... your modal logic ... */ }

window.onload = () => {
    loadProgress();
    ui.questionDisplay.innerText = "Press Next to Start";
    ui.nextBtn.classList.remove('hidden');
    ui.inputField.disabled = true;

/* =========================================
   9. INITIALIZATION
   ========================================= */
async function initGame() {
    try {
        const response = await fetch('./aircraft.json');
        aircraftDatabase = await response.json();
        console.log("Database Loaded:", aircraftDatabase.length, "planes available.");
        
        loadProgress();
        ui.questionDisplay.innerText = "Press Next to Start";
        ui.nextBtn.classList.remove('hidden');
        ui.inputField.disabled = true;
    } catch (error) {
        console.error("Failed to load aircraft.json:", error);
    }
}

// Kick it off!
initGame();
};