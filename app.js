console.log("HELLO FROM THE NEW APP.JS")
/* =========================================
   2. GAME STATE MANAGEMENT
   ========================================= */
const GameState = {
    timeLeft: 20,
    isPaused: true, // Start paused, waiting for "Ready"
    score: 0,
    questionsSinceLastDrop: 0,
    nextDropTarget: getRandomDropTarget(),
    currentAnswer: 0,
    unlockedAircraft: [] // Back to a single list
};

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
    nextBtn: document.getElementById('next-btn') // New button
};

/* =========================================
   4. TIMER & QUESTION FLOW
   ========================================= */
function startTimer() {
    const timerInterval = setInterval(() => {
        if (!GameState.isPaused && GameState.timeLeft > 0) {
            GameState.timeLeft--;
            ui.timerDisplay.innerText = GameState.timeLeft;
            ui.progressBar.style.width = (GameState.timeLeft / 20) * 100 + "%";
        } else if (GameState.timeLeft === 0 && !GameState.isPaused) {
            endTurn(false); // Time ran out
            clearInterval(timerInterval);
        }
    }, 1000);
}

function endTurn(isCorrect) {
    GameState.isPaused = true;
    ui.inputField.disabled = true;
    ui.nextBtn.classList.remove('hidden');
    ui.questionDisplay.innerText = `Answer: ${GameState.currentAnswer}`;
}

ui.nextBtn.addEventListener('click', () => {
    ui.nextBtn.classList.add('hidden');
    ui.inputField.disabled = false;
    ui.inputField.value = '';
    GameState.timeLeft = 20;
    GameState.isPaused = false;
    generateQuestion();
});

/* =========================================
   5. MATH LOGIC (Same as before)
   ========================================= */
// ... (Keep your generateQuestion() function here) ...

ui.inputField.addEventListener('input', (e) => {
    const userAnswer = parseInt(e.target.value);
    if (userAnswer === GameState.currentAnswer) {
        GameState.score++;
        GameState.questionsSinceLastDrop++;
        checkLootDrop();
        endTurn(true);
    }
});

/* =========================================
   6. LOOT & HANGAR LOGIC
   ========================================= */
function checkLootDrop() {
    if (GameState.questionsSinceLastDrop >= GameState.nextDropTarget) {
        const locked = aircraftDatabase.filter(a => !GameState.unlockedAircraft.some(u => u.id === a.id));
        if (locked.length > 0) {
            const reward = locked[Math.floor(Math.random() * locked.length)];
            GameState.unlockedAircraft.push(reward);
            saveProgress();
            renderHangar();
            alert(`New Plane Unlocked: ${reward.name}`);
        }
        GameState.questionsSinceLastDrop = 0;
        GameState.nextDropTarget = getRandomDropTarget();
    }
}

// ... (Keep fetchAircraftPhoto() and renderHangar() here) ...

/* =========================================
   7. FETCHING IMAGES FROM PEXELS
   ========================================= */
async function fetchAircraftPhoto(query) {
    // Check if we have the key defined in config.js
    if (typeof PEXELS_KEY === 'undefined') return "fallback-darkness.jpg";

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: PEXELS_KEY }
        });
        const data = await response.json();
        
        // Return the image URL if found, else fallback
        return data.photos && data.photos.length > 0 
            ? data.photos[0].src.medium 
            : "fallback-darkness.jpg";
    } catch (error) {
        console.error("Failed to fetch image", error);
        return "fallback-darkness.jpg";
    }
}

/* =========================================
   8. UPDATED RENDER HANGAR
   ========================================= */
async function renderHangar() {
    console.log("Rendering hangar. Total planes:", GameState.unlockedAircraft.length);
    ui.gallery.innerHTML = '';

    // 1. Force the container to be visible
    ui.hangarContainer.classList.remove('hidden');

    // 2. Loop through the single list of planes
    for (const aircraft of GameState.unlockedAircraft) {
        
        // If we haven't fetched the photo, do it now
        if (!aircraft.photo || aircraft.photo.includes(".jpg")) { 
            aircraft.photo = await fetchAircraftPhoto(aircraft.searchQuery);
        }

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
    }
}

// Save progress to the browser's persistent memory
function saveProgress() {
    const dataToSave = {
        hand: GameState.hand,
        collection: GameState.collection,
        score: GameState.score
    };
    localStorage.setItem('mathsHangarSave', JSON.stringify(dataToSave));
}

// Load progress when the game starts
function loadProgress() {
    const savedData = localStorage.getItem('mathsHangarSave');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        // Only load if the saved data actually exists
        GameState.hand = parsed.hand || []; 
        GameState.collection = parsed.collection || [];
        GameState.score = parsed.score || 0;
        renderHangar(); 
    }
}