<template>
    <!-- Profilinställningar vy -->
    <div class="profile-view">
        <div class="container">
            <div class="title">Profile Settings</div>
           
            <!-- Profilnamn inmatningsfält -->
            <div class="profile-menu-item">
                <h3>Profile Name</h3>
                <input type="text"
                       class="profile-input"
                       id="profileName"
                       tabindex="0"
                       placeholder="Enter your name"
                       maxlength="20">
            </div>
     
            <!-- Knappar för navigering -->
            <div class="button-group">
                <button class="nav-button" 
                        id="backButton"
                        tabindex="0">
                    <!-- Tillbaka ikon -->
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    <span>Back</span>
                </button>
                <button class="nav-button" 
                        id="saveButton"
                        tabindex="0">
                    <!-- Spara ikon -->
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    <span>Save</span>
                </button>
            </div>
     
            <!-- Virtuellt tangentbord -->
            <div class="virtual-keyboard" id="virtualKeyboard">
                <div class="keyboard-row">
                    <div class="key" data-key="1">1</div>
                    <div class="key" data-key="2">2</div>
                    <div class="key" data-key="3">3</div>
                    <div class="key" data-key="4">4</div>
                    <div class="key" data-key="5">5</div>
                    <div class="key" data-key="6">6</div>
                    <div class="key" data-key="7">7</div>
                    <div class="key" data-key="8">8</div>
                    <div class="key" data-key="9">9</div>
                    <div class="key" data-key="0">0</div>
                </div>
                <div class="keyboard-row">
                    <div class="key" data-key="q">Q</div>
                    <div class="key" data-key="w">W</div>
                    <div class="key" data-key="e">E</div>
                    <div class="key" data-key="r">R</div>
                    <div class="key" data-key="t">T</div>
                    <div class="key" data-key="y">Y</div>
                    <div class="key" data-key="u">U</div>
                    <div class="key" data-key="i">I</div>
                    <div class="key" data-key="o">O</div>
                    <div class="key" data-key="p">P</div>
                </div>
                <div class="keyboard-row">
                    <div class="key" data-key="a">A</div>
                    <div class="key" data-key="s">S</div>
                    <div class="key" data-key="d">D</div>
                    <div class="key" data-key="f">F</div>
                    <div class="key" data-key="g">G</div>
                    <div class="key" data-key="h">H</div>
                    <div class="key" data-key="j">J</div>
                    <div class="key" data-key="k">K</div>
                    <div class="key" data-key="l">L</div>
                </div>
                <div class="keyboard-row">
                    <div class="key" data-key="z">Z</div>
                    <div class="key" data-key="x">X</div>
                    <div class="key" data-key="c">C</div>
                    <div class="key" data-key="v">V</div>
                    <div class="key" data-key="b">B</div>
                    <div class="key" data-key="n">N</div>
                    <div class="key" data-key="m">M</div>
                    <div class="key wide" data-key="backspace">⌫</div>
                </div>
                <div class="keyboard-row">
                    <div class="key wide" data-key="space">Space</div>
                    <div class="key wide" data-key="done">Done</div>
                </div>
            </div>
        </div>
    </div>
</template>
 
<script setup>
// Importera Vue-funktioner
import { onMounted, onUnmounted } from 'vue';
// Importera playerStore för att hantera användarnamn
import { playerStore } from '../stores/playerStore'; // Import playerStore

// Håller koll på vilket element som är i fokus
let currentFocus = 'backButton';
// Lista över element som kan fokuseras
const elements = ['backButton', 'profileName', 'saveButton'];
 
let isKeyboardOpen = false; // Om det virtuella tangentbordet är öppet
let currentKeyboardRow = 0; // Nuvarande rad på tangentbordet
let currentKeyboardCol = 0; // Nuvarande kolumn på tangentbordet
 
// Stöd för handkontroll (gamepad)
window.addEventListener('gamepadconnected', (e) => {
    console.log('Gamepad connected:', e.gamepad);
    requestAnimationFrame(updateGamepad);
});
 
let lastButtonState = {};

// Uppdaterar gamepadens tillstånd och hanterar navigation
function updateGamepad() {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0];

    if (gamepad) {
        if (isKeyboardOpen) {
            handleVirtualKeyboard(gamepad);
        } else {
            // Förenklad navigationslogik
            const moveThreshold = 0.5;
            
            // Vertikal navigation
            if (gamepad.axes[1] < -moveThreshold && !lastButtonState.up) {
                navigateFocus('up');
                lastButtonState.up = true;
            } else if (gamepad.axes[1] > moveThreshold && !lastButtonState.down) {
                navigateFocus('down');
                lastButtonState.down = true;
            }

            // Horisontell navigation
            if (gamepad.axes[0] < -moveThreshold && !lastButtonState.left) {
                navigateFocus('left');
                lastButtonState.left = true;
            } else if (gamepad.axes[0] > moveThreshold && !lastButtonState.right) {
                navigateFocus('right');
                lastButtonState.right = true;
            }

            // Återställ tillstånd när spaken är nära mitten
            if (Math.abs(gamepad.axes[0]) < moveThreshold) {
                lastButtonState.left = false;
                lastButtonState.right = false;
            }
            if (Math.abs(gamepad.axes[1]) < moveThreshold) {
                lastButtonState.up = false;
                lastButtonState.down = false;
            }

            // A-knapp tryck
            if (gamepad.buttons[0].pressed && !lastButtonState[0]) {
                const element = document.getElementById(currentFocus);
                if (element) {
                    element.click();
                    if (currentFocus === 'profileName') {
                        isKeyboardOpen = true;
                        document.getElementById('virtualKeyboard').style.display = 'block';
                    }
                }
            }
        }

        lastButtonState[0] = gamepad.buttons[0].pressed;
        lastButtonState[1] = gamepad.buttons[1].pressed;
    }
    requestAnimationFrame(updateGamepad);
}

// Navigerar fokus mellan knappar och inmatningsfält
function navigateFocus(direction) {
    const focusMap = {
        'backButton': { right: 'saveButton', down: 'profileName' },
        'saveButton': { left: 'backButton', down: 'profileName' },
        'profileName': { up: 'backButton' }
    };

    const nextFocus = focusMap[currentFocus]?.[direction];
    
    if (nextFocus) {
        updateFocus(nextFocus);
    }
}

// Uppdaterar vilket element som är i fokus visuellt
function updateFocus(elementId) {
    // Ta bort alla fokus-klasser
    document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));
    
    // Uppdatera nuvarande fokus
    currentFocus = elementId;
    
    // Lägg till fokus på nytt element
    const element = document.getElementById(currentFocus);
    if (element) {
        element.classList.add('focused');
        element.focus();
    }
}
 
// Hanterar det virtuella tangentbordet med gamepad
function handleVirtualKeyboard(gamepad) {
    if (!isKeyboardOpen) return;

    // Hantera gamepad input
    if (gamepad.axes[0] < -0.5 && !lastButtonState.left) {
        handleVirtualKeyboardMove('left');
        lastButtonState.left = true;
    } else if (gamepad.axes[0] > 0.5 && !lastButtonState.right) {
        handleVirtualKeyboardMove('right');
        lastButtonState.right = true;
    }

    if (gamepad.axes[1] < -0.5 && !lastButtonState.up) {
        handleVirtualKeyboardMove('up');
        lastButtonState.up = true;
    } else if (gamepad.axes[1] > 0.5 && !lastButtonState.down) {
        handleVirtualKeyboardMove('down');
        lastButtonState.down = true;
    }

    // Återställ tillstånd
    if (Math.abs(gamepad.axes[0]) < 0.5) {
        lastButtonState.left = false;
        lastButtonState.right = false;
    }
    if (Math.abs(gamepad.axes[1]) < 0.5) {
        lastButtonState.up = false;
        lastButtonState.down = false;
    }

    // Hantera A-knapp (välj)
    if (gamepad.buttons[0].pressed && !lastButtonState[0]) {
        handleVirtualKeyboardSelect();
    }

    // Hantera B-knapp (stäng tangentbord)
    if (gamepad.buttons[1].pressed && !lastButtonState[1]) {
        isKeyboardOpen = false;
        document.getElementById('virtualKeyboard').style.display = 'none';
    }
}

// Hanterar tangentbordsnavigation med piltangenter och enter
function handleKeyboardNavigation(event) {
    if (!isKeyboardOpen) {
        // ...befintlig navigationskod...
        const keyDirections = {
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'ArrowUp': 'up',
            'ArrowDown': 'down'
        };

        const direction = keyDirections[event.key];
        if (direction) {
            event.preventDefault();
            navigateFocus(direction);
        }

        // Hantera Enter för val
        if (event.key === 'Enter') {
            const element = document.getElementById(currentFocus);
            if (element) {
                element.click();
                if (currentFocus === 'profileName') {
                    isKeyboardOpen = true;
                    document.getElementById('virtualKeyboard').style.display = 'block';
                }
            }
        }
    } else {
        // Hantera navigation på virtuella tangentbordet
        event.preventDefault();
        switch(event.key) {
            case 'ArrowLeft':
                handleVirtualKeyboardMove('left');
                break;
            case 'ArrowRight':
                handleVirtualKeyboardMove('right');
                break;
            case 'ArrowUp':
                handleVirtualKeyboardMove('up');
                break;
            case 'ArrowDown':
                handleVirtualKeyboardMove('down');
                break;
            case 'Enter':
                handleVirtualKeyboardSelect();
                break;
            case 'Escape':
                isKeyboardOpen = false;
                document.getElementById('virtualKeyboard').style.display = 'none';
                break;
        }
    }
}

// Flyttar markeringen på det virtuella tangentbordet
function handleVirtualKeyboardMove(direction) {
    const keyboard = document.getElementById('virtualKeyboard');
    const rows = keyboard.getElementsByClassName('keyboard-row');
    
    switch(direction) {
        case 'left':
            currentKeyboardCol = Math.max(0, currentKeyboardCol - 1);
            break;
        case 'right':
            const currentRowKeys = rows[currentKeyboardRow].getElementsByClassName('key');
            currentKeyboardCol = Math.min(currentRowKeys.length - 1, currentKeyboardCol + 1);
            break;
        case 'up':
            if (currentKeyboardRow > 0) {
                currentKeyboardRow--;
                const upRowKeys = rows[currentKeyboardRow].getElementsByClassName('key');
                currentKeyboardCol = Math.min(currentKeyboardCol, upRowKeys.length - 1);
            }
            break;
        case 'down':
            if (currentKeyboardRow < rows.length - 1) {
                currentKeyboardRow++;
                const downRowKeys = rows[currentKeyboardRow].getElementsByClassName('key');
                currentKeyboardCol = Math.min(currentKeyboardCol, downRowKeys.length - 1);
            }
            break;
    }
    
    // Uppdatera visuell markering
    document.querySelector('.key.selected')?.classList.remove('selected');
    const keys = rows[currentKeyboardRow].getElementsByClassName('key');
    keys[currentKeyboardCol].classList.add('selected');
}

// Hanterar val av tangent på det virtuella tangentbordet
function handleVirtualKeyboardSelect() {
    const keyboard = document.getElementById('virtualKeyboard');
    const rows = keyboard.getElementsByClassName('keyboard-row');
    const currentRow = rows[currentKeyboardRow];
    const keys = currentRow.getElementsByClassName('key');
    const selectedKey = keys[currentKeyboardCol];
    const keyValue = selectedKey.dataset.key;
    
    const input = document.getElementById('profileName');
    
    switch(keyValue) {
        case 'backspace':
            input.value = input.value.slice(0, -1);
            break;
        case 'space':
            input.value += ' ';
            break;
        case 'done':
            isKeyboardOpen = false;
            keyboard.style.display = 'none';
            break;
        default:
            if (input.value.length < input.maxLength) {
                input.value += keyValue.toUpperCase();
            }
    }
}

// Lägg till tangentbordsnavigation
onMounted(() => {
    // Ladda profilnamn från local storage
    const savedName = localStorage.getItem('profileName');
    if (savedName) {
        document.getElementById('profileName').value = savedName;
        playerStore.setUserName(savedName);
    }

    // Lägg till eventlyssnare för tangentbord
    window.addEventListener('keydown', handleKeyboardNavigation);
});

// Ta bort eventlyssnare vid avmontering
onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyboardNavigation);
});
 
// Validering av inmatning
onMounted(() => {
    document.getElementById('profileName').addEventListener('input', function(e) {
        // Tillåt endast bokstäver, siffror, mellanslag, bindestreck och understreck
        let sanitized = e.target.value.replace(/[^a-zA-Z0-9\s-_]/g, '');
        if (sanitized !== e.target.value) {
            e.target.value = sanitized;
        }
    });
    
    // Tillbaka-knapp
    document.getElementById('backButton').addEventListener('click', () => {
        window.location.href = '/';
    });
    
    // Spara-knapp
    document.getElementById('saveButton').addEventListener('click', () => {
        const name = document.getElementById('profileName').value;
        // Spara profilnamn till local storage och player store
        localStorage.setItem('profileName', name);
        playerStore.setUserName(name);
        console.log('Saving profile name:', name);
        // Visa eventuell sparad animation eller meddelande
        showSaveAnimation();
    });
    
    // Initialt fokus
    updateFocus('backButton');
    
    // Lägg till fokus-hanterare för musinteraktion
    elements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('focus', () => updateFocus(elementId));
        }
    });
});
 
// Animation för spara-knappen
function showSaveAnimation() {
    const saveButton = document.getElementById('saveButton');
    saveButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        saveButton.style.transform = 'translateY(-2px)';
    }, 100);
}
</script>
 
<style scoped>
.profile-view {
    --primary-color: #00a2ff;
    --primary-light: #66c7ff;
    --primary-dark: #007acc;
    --background-color: #000000;
    --surface-color: rgba(0, 0, 0, 0.7);
    --text-color: #ffffff;
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--background-color);
    color: var(--text-color);
    font-family: 'Segoe UI', sans-serif;
}

/*
  Container för profilvyn. den sätter storlek, bakgrundsfärg, osv för hela profilvyn.
*/
.container {
    width: 500px;
    height: 500px;
    background-color: var(--surface-color);
    border-radius: 50%;
    padding: 2rem 3rem 3rem;
    border: 1px solid rgba(0, 162, 255, 0.3);
    box-shadow: 0 0 30px rgba(0, 162, 255, 0.3);
    backdrop-filter: blur(10px);
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

/* Titel för profilvyn */
.title {
    color: var(--primary-color);
    font-size: 1.8rem;
    margin: 20px 0;
    text-align: center;
    text-shadow: 0 0 10px var(--primary-color);
}

/* Menyobjekt för profil */
.profile-menu-item {
    width: 100%;
    margin: 2rem 0;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-menu-item {
    width: 100%;
    margin: 2rem 0;
}

/* Inmatningsfält för profilnamn */
.profile-input {
    width: 100%;
    padding: 1rem;
    border: 2px solid var(--primary-dark);
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.5);
    color: var(--text-color);
    font-size: 1.2rem;
    transition: all 0.3s ease;
}

/* Fokus på inmatningsfält */
.profile-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 20px rgba(0, 162, 255, 0.4);
}

/* Klass för fokus på element */
.focused {
    border-color: var(--primary-color);
    box-shadow: 0 0 20px rgba(0, 162, 255, 0.4);
}

/* Virtuellt tangentbord */
.virtual-keyboard {
    display: none;
    position: absolute;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    border: 2px solid var(--primary-color);
    border-radius: 10px;
    padding: 15px;
    box-shadow: 0 0 20px rgba(0, 162, 255, 0.4);
    z-index: 100;
}

/* Rader i tangentbordet */
.keyboard-row {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-bottom: 5px;
}

/* Enskild tangent på tangentbordet */
.key {
    width: 35px;
    height: 35px;
    background: rgba(0, 162, 255, 0.1);
    border: 1px solid var(--primary-color);
    border-radius: 5px;
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

/* Markerad tangent på tangentbordet */
.key.selected {
    background: var(--primary-color);
    box-shadow: 0 0 20px var(--primary-color);
    animation: keyPulse 1s infinite;
    transform: scale(1.1);
}

@keyframes keyPulse {
    0% {
        box-shadow: 0 0 20px var(--primary-color);
    }
    50% {
        box-shadow: 0 0 30px var(--primary-color);
    }
    100% {
        box-shadow: 0 0 20px var(--primary-color);
    }
}

/* Bredare tangenter (t.ex. space, done) */
.key.wide {
    width: auto;
    padding: 0 15px;
}

/* Grupp för navigeringsknappar */
.button-group {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-top: 40px;
}

/* Navigeringsknapp (t.ex. tillbaka, spara) */
.nav-button {
    background: rgba(0, 162, 255, 0.1);
    border: 1px solid var(--primary-color);
    border-radius: 8px;
    color: var(--primary-color);
    cursor: pointer;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 120px;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.nav-button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, var(--primary-color) 0%, transparent 70%);
    transition: width 0.4s ease, height 0.4s ease;
    transform: translate(-50%, -50%);
    opacity: 0;
    z-index: -1;
}

/* Fokus på navigeringsknapp */
.nav-button.focused {
    background: rgba(0, 162, 255, 0.2) !important;
    box-shadow: 0 0 25px rgba(0, 162, 255, 0.6) !important;
    transform: scale(1.05) translateY(-2px) !important;
    border-color: var(--primary-light) !important;
    animation: pulseGlow 2s infinite;
}

.nav-button.focused::before {
    width: 250%;
    height: 250%;
    opacity: 0.15;
}

.nav-button svg {
    transition: transform 0.3s ease;
}

.nav-button.focused svg {
    transform: scale(1.2);
    filter: drop-shadow(0 0 5px var(--primary-color));
}

/* Fokus på inmatningsfält */
.profile-input.focused {
    border-color: var(--primary-light) !important;
    box-shadow: 
        0 0 20px rgba(0, 162, 255, 0.4),
        0 0 40px rgba(0, 162, 255, 0.2) !important;
    background: rgba(0, 162, 255, 0.15) !important;
    transform: translateY(-2px);
    animation: inputPulse 2s infinite;
}

@keyframes pulseGlow {
    0% {
        box-shadow: 0 0 25px rgba(0, 162, 255, 0.6);
    }
    50% {
        box-shadow: 0 0 35px rgba(0, 162, 255, 0.8);
    }
    100% {
        box-shadow: 0 0 25px rgba(0, 162, 255, 0.6);
    }
}

@keyframes inputPulse {
    0% {
        box-shadow: 0 0 20px rgba(0, 162, 255, 0.4);
    }
    50% {
        box-shadow: 0 0 30px rgba(0, 162, 255, 0.6);
    }
    100% {
        box-shadow: 0 0 20px rgba(0, 162, 255, 0.4);
    }
}

/* Inaktiverad hover och fokus-effekt */
.nav-button:hover, .nav-button:focus {
    background: rgba(0, 162, 255, 0.1);
    transform: none;
    box-shadow: none;
}

.nav-button svg {
    width: 20px;
    height: 20px;
}

.nav-button span {
    font-size: 14px;
    font-weight: 500;
}

.nav-button.focused {
    background: rgba(0, 162, 255, 0.3) !important;
    box-shadow: 0 0 15px rgba(0, 162, 255, 0.5) !important;
    transform: scale(1.05) !important;
    border-color: var(--primary-color) !important;
}

.profile-input.focused {
    border-color: var(--primary-color) !important;
    box-shadow: 0 0 20px rgba(0, 162, 255, 0.4) !important;
    background: rgba(0, 162, 255, 0.1) !important;
}

/* Ny hover-effektklass */
.profile-menu-item-hover:hover {
    background-color: rgba(0, 162, 255, 0.1);
    border-radius: 6px;
    transition: background-color 0.3s ease;
}

/* Cool hover-effekt för profile-menu-item */
.profile-menu-item:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(0, 162, 255, 0.5);
}

/* Uppdatera profile-menu-item effekter */
.profile-menu-item {
    position: relative;
}

.profile-menu-item::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 6px;
    background: radial-gradient(circle at center, var(--primary-color) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.profile-menu-item:hover::after {
    opacity: 0.1;
}

.profile-menu-item:hover {
    transform: scale(1.05) translateY(-5px);
    box-shadow: 
        0 0 15px rgba(0, 162, 255, 0.5),
        0 0 30px rgba(0, 162, 255, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

</style>