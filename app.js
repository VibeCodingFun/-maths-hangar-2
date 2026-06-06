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
    hand: [],       // Empty list for the 5 active cards
    collection: []  // Empty list for the permanent collection
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
   6. UPDATED LOOT LOGIC
   ========================================= */
function checkLootDrop() {
    if (GameState.questionsSinceLastDrop >= GameState.nextDropTarget) {
        GameState.isPaused = true;
        const reward = getRandomPlaneFromDatabase(); // Needs to be a new, unowned plane

        if (GameState.hand.length < 5) {
            // If space, just add it
            GameState.hand.push(reward);
            saveProgress();
            renderHangar();
        } else {
            // Hand full, show Modal
            showExchangeModal(reward);
        }

        GameState.questionsSinceLastDrop = 0;
        GameState.nextDropTarget = getRandomDropTarget();
    }
}

/* =========================================
   6.2 MODAL INTERACTION LOGIC
   ========================================= */
function showExchangeModal(newPlane) {
    const modal = document.getElementById('exchange-modal');
    modal.classList.remove('hidden');
    
    // 1. Render the cards in the modal
    const grid = document.getElementById('modal-hand-grid');
    grid.innerHTML = '';
    
    GameState.hand.forEach((plane, index) => {
        const card = document.createElement('div');
        card.className = 'aircraft-card';
        card.innerHTML = `
            <div class="card-front">
                <img src="${plane.photo}" alt="${plane.name}" class="aircraft-card-img" />
                <h3>${plane.name}</h3>
            </div>
        `;
        
        // When a user clicks a plane, we perform the SWAP
        card.onclick = () => {
            // Move the current plane in the hand to the permanent collection
            GameState.collection.push(GameState.hand[index]);
            
            // Replace the old plane with the new one
            GameState.hand[index] = newPlane;
            
            // Close modal and resume
            modal.classList.add('hidden');
            GameState.isPaused = false;
            
            saveProgress();
            renderHangar();
        };
        grid.appendChild(card);
    });

    // 2. Setup the Discard button logic
    const discardBtn = document.getElementById('discard-new-btn');
    discardBtn.onclick = () => {
        modal.classList.add('hidden');
        GameState.isPaused = false;
        // No planes are saved, no swap happens
    };
}

/* =========================================
   6.5 DUPLICATE PREVENTION LOGIC
   ========================================= */
function getRandomPlaneFromDatabase() {
    // 1. Create a combined list of all plane IDs the user already has
    const ownedIds = [
        ...GameState.hand.map(p => p.id),
        ...GameState.collection.map(p => p.id)
    ];

    // 2. Filter the master database for items not in the owned list
    const locked = aircraftDatabase.filter(a => !ownedIds.includes(a.id));

    // 3. Return a random plane from the remaining available planes
    if (locked.length > 0) {
        return locked[Math.floor(Math.random() * locked.length)];
    }
    
    // Fallback: If they own everything, just give a random plane (or handle as game complete)
    return aircraftDatabase[Math.floor(Math.random() * aircraftDatabase.length)];
}

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
    ui.gallery.innerHTML = '';

    // Merge both arrays into one temporary list for rendering
    const allPlanes = [...GameState.hand, ...GameState.collection];
    
    // Now just loop through the combined list once
    for (const aircraft of allPlanes) {
        // If we haven't fetched the photo, do it now
        // We check if photo is null or the original static placeholder
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

generateQuestion();
startTimer();