<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { invoke } from '@tauri-apps/api/core'
import GameCard from '../components/GameCard.vue';

// Lista med DS-ROM-filer
const dsRomFiles = ref<string[]>([]);
// Index för vald ROM
const selectedRomIndex = ref(0);
// Om en övergång pågår (animering)
const isTransitioning = ref(false);
// Om det är tillåtet att flytta mellan kort
const canMove = ref(true);
// Senaste tillståndet för A-knappen på gamepad
const lastAButtonState = ref(false);
// Index för ansluten gamepad
const gamepadIndex = ref<number | null>(null);
// Om tillbaka-knappen är i fokus
const backButtonFocused = ref(false);
// Om vänsterpil ska glöda
const leftArrowGlow = ref(false);
// Om högerpil ska glöda
const rightArrowGlow = ref(false);

// Hämtar listan med DS-ROM-filer från backend
async function fetchDsRomFiles() {
  try {
    dsRomFiles.value = await invoke<string[]>('list_ds_rom_files');
  } catch (e) {
    dsRomFiles.value = [];
  }
}

// Startar vald DS-ROM genom att anropa backend
async function launchDsRom(romName: string) {
  // Bygger sökvägen till ROM-filen som backend förväntar sig
  const romPath = `../public/roms/DS/${romName}`;
  try {
    await invoke('launch_ds_game', { rom_path: romPath });
  } catch (e) {
    alert('Misslyckades att starta: ' + romName);
  }
}

// Välj föregående ROM i listan
function selectPrevRom() {
  if (dsRomFiles.value.length === 0) return;
  if (backButtonFocused.value) return; // Scrolla inte kort om back-knappen är i fokus
  isTransitioning.value = true;
  leftArrowGlow.value = true;
  selectedRomIndex.value = (selectedRomIndex.value - 1 + dsRomFiles.value.length) % dsRomFiles.value.length;
  setTimeout(() => { 
    isTransitioning.value = false; 
    leftArrowGlow.value = false;
  }, 500); // Ökat till 500ms för mer synlig glow
}

// Välj nästa ROM i listan
function selectNextRom() {
  if (dsRomFiles.value.length === 0) return;
  if (backButtonFocused.value) return; // Scrolla inte kort om back-knappen är i fokus
  isTransitioning.value = true;
  rightArrowGlow.value = true;
  selectedRomIndex.value = (selectedRomIndex.value + 1) % dsRomFiles.value.length;
  setTimeout(() => { 
    isTransitioning.value = false; 
    rightArrowGlow.value = false;
  }, 500); // Ökat till 500ms för mer synlig glow
}
     
// Starta vald ROM
function launchSelectedRom() {
  if (dsRomFiles.value.length === 0) return;
  launchDsRom(dsRomFiles.value[selectedRomIndex.value]);
}

// Sätt fokus på tillbaka-knappen
function focusBackButton() {
  backButtonFocused.value = true;
}
// Ta bort fokus från tillbaka-knappen
function unfocusBackButton() {
  backButtonFocused.value = false;
}

// Hantera tillbaka-knappens funktion
function handleBackButtonAction() {
  window.location.href = '/console';
}

// Funktion för att kontrollera gamepadens tillstånd
const checkGamepad = () => {
  let animationFrameId: number | null = null;
  let lastVertical = 0;
  const checkGamepadInternal = () => {
    if (gamepadIndex.value !== null) {
      const gamepad = navigator.getGamepads()[gamepadIndex.value];
      if (gamepad) {
        const axisH = gamepad.axes?.[0] ?? 0;
        const axisV = gamepad.axes?.[1] ?? 0;
        const dpadLeft = gamepad.buttons?.[14]?.pressed ?? false;
        const dpadRight = gamepad.buttons?.[15]?.pressed ?? false;
        const dpadDown = gamepad.buttons?.[13]?.pressed ?? false;
        const dpadUp = gamepad.buttons?.[12]?.pressed ?? false;
        const aButton = gamepad.buttons?.[0]?.pressed ?? false;
        // Horisontell rörelse (kort)
        if (!backButtonFocused.value && (Math.abs(axisH) > 0.5 || dpadLeft || dpadRight) && canMove.value && !isTransitioning.value) {
          canMove.value = false;
          if (axisH > 0.5 || dpadRight) {
            selectNextRom();
          } else if (axisH < -0.5 || dpadLeft) {
            selectPrevRom();
          }
          setTimeout(() => { canMove.value = true; }, 250);
        }
        // Ned till tillbaka-knappen
        if (!backButtonFocused.value && ((axisV > 0.5 && lastVertical <= 0.5) || dpadDown)) {
          focusBackButton();
        }
        // Upp till korten
        if (backButtonFocused.value && ((axisV < -0.5 && lastVertical >= -0.5) || dpadUp)) {
          unfocusBackButton();
        }
        // A-knappen
        if (aButton && !lastAButtonState.value && !isTransitioning.value) {
          if (backButtonFocused.value) {
            handleBackButtonAction();
          } else {
            launchSelectedRom();
          }
        }
        lastAButtonState.value = aButton;
        lastVertical = axisV;
      }
    }
    animationFrameId = requestAnimationFrame(checkGamepadInternal);
  };
  animationFrameId = requestAnimationFrame(checkGamepadInternal);
  return () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}

// Hantera tangentbordsinmatning
const handleKeydown = (e: KeyboardEvent) => {
  if (!isTransitioning.value) {
    switch (e.key) {
      case 'ArrowLeft':
        selectPrevRom()
        break
      case 'ArrowRight':
        selectNextRom()
        break
      case 'Enter':
        launchSelectedRom()
        break
      case 'Escape':
        handleBackButtonAction()
        break
    }
  }
}

// Körs när komponenten monteras
onMounted(async () => {
  await fetchDsRomFiles();

  // Försök auto-detektera ansluten gamepad vid start
  const pads = navigator.getGamepads();
  for (let i = 0; i < pads.length; i++) {
    if (pads[i]) {
      gamepadIndex.value = i;
      break;
    }
  }

  const stopCheckGamepad = checkGamepad();

  const gamepadConnectHandler = (e: GamepadEvent) => {
    console.log("Gamepad ansluten:", e.gamepad);
    gamepadIndex.value = e.gamepad.index;
  };

  const gamepadDisconnectHandler = () => {
    gamepadIndex.value = null;
  };

  window.addEventListener('gamepadconnected', gamepadConnectHandler);
  window.addEventListener('gamepaddisconnected', gamepadDisconnectHandler);
  window.addEventListener('keydown', handleKeydown);

  // Lägg till eventlyssnare för tillbaka-knappen
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = '/console';
    });
  }

  // Returnera cleanup-funktion
  return () => {
    stopCheckGamepad();
    window.removeEventListener('gamepadconnected', gamepadConnectHandler);
    window.removeEventListener('gamepaddisconnected', gamepadDisconnectHandler);
    window.removeEventListener('keydown', handleKeydown);
    if (backButton) {
      backButton.removeEventListener('click', () => {
        window.location.href = '/console';
      });
    }
  };
});

// Rensa eventlyssnare vid avmontering
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Hämta DS-ROM-filer vid montering
onMounted(fetchDsRomFiles);

// Antal synliga kort samtidigt
const VISIBLE_CARD_COUNT = 3; // Visa 3 kort åt gången (centrerat)
// Startindex för synliga kort
const visibleStart = computed(() => {
  if (dsRomFiles.value.length <= VISIBLE_CARD_COUNT) return 0;
  let start = selectedRomIndex.value - Math.floor(VISIBLE_CARD_COUNT / 2);
  if (start < 0) start = 0;
  if (start > dsRomFiles.value.length - VISIBLE_CARD_COUNT) start = dsRomFiles.value.length - VISIBLE_CARD_COUNT;
  return start;
});
// Lista med synliga DS-ROM-filer
const visibleDsRomFiles = computed(() => {
  return dsRomFiles.value.slice(visibleStart.value, visibleStart.value + VISIBLE_CARD_COUNT);
});
</script>

<template>
  <div class="games-exe-view">
    <div class="eclipse-bg">
      <div class="eclipse-white"></div>
      <div class="eclipse-black"></div>
    </div>
    <div class="menu-arrows" v-if="dsRomFiles.length > 1 && !backButtonFocused">
      <button class="arrow-left" :class="{ glow: leftArrowGlow }" @click="selectPrevRom" :disabled="isTransitioning">←</button>
      <button class="arrow-right" :class="{ glow: rightArrowGlow }" @click="selectNextRom" :disabled="isTransitioning">→</button>
    </div>
    <div v-if="dsRomFiles.length === 0" class="no-games">No games found.</div>
    <div v-else class="game-menu">
      <GameCard
        v-for="(rom, idx) in visibleDsRomFiles"
        :key="rom"
        :title="rom"
        :selected="idx + visibleStart === selectedRomIndex && !backButtonFocused"
        @click="launchDsRom(rom)"
        style="cursor:pointer;"
      />
    </div>
    <button @click="handleBackButtonAction" class="back-button" :class="{ focused: backButtonFocused }" tabindex="-1">
      Back to Consoles
    </button>
  </div>
</template>

<style scoped>

/* Bakgrund för eclipse-effekt */
.eclipse-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 0;
}
/* Vit cirkel för eclipse */
.eclipse-white {
  position: absolute;
  width: 520px;
  height: 520px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 120px 40px rgba(255,255,255,0.5), 0 0 200px 80px rgba(255,255,255,0.2);
  top: 40%;
  left: 70%;
  transform: translate(-50%, -50%);
  z-index: 1;
}
/* Svart cirkel för eclipse-overlay */
.eclipse-black {
  position: absolute;
  width: 518px;
  height: 518px;
  background: #111;
  border-radius: 50%;
  top: 40%;
  left: 70%;
  transform: translate(-50%, -50%);
  z-index: 2;
  opacity: 0.97;
}
/* Huvudbehållare för vyn */
.games-exe-view {
  padding: 2rem;
  position: relative;
  z-index: 1;
}
/* Behållare för spelkort */
.game-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
/* Meddelande om inga spel hittas */
.no-games {
  color: #aaa;
  font-size: 1.2rem;
  margin-top: 2rem;
  text-align: center;
}
/* Stil för tillbaka-knappen */
.back-button {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    z-index: 2;
}
/* Stil när tillbaka-knappen är i fokus */
.back-button.focused {
  outline: 3px solid #fff;
  background-color: #222;
  color: #00C3FF;
  box-shadow: 0 0 16px #fff;
}
/* Behållare för pilarna */
.menu-arrows {
  position: fixed;
  width: 100%;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  top: 400px;
}
/* Vänsterpil */
.arrow-left {
  font-size: 48px;
  color: #ffffff;
  opacity: 0.6;
  transition: opacity 0.3s, box-shadow 0.3s;
  pointer-events: auto;
  cursor: pointer;
  background: none;
  border: none;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
  box-shadow: none;
}
/* Högerpil */
.arrow-right {
  font-size: 48px;
  color: #ffffff;
  opacity: 0.6;
  transition: opacity 0.3s, box-shadow 0.3s;
  pointer-events: auto;
  cursor: pointer;
  background: none;
  border: none;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
  box-shadow: none;
  margin-right: 10%;
}
/* Aktivt eller fokuserat tillstånd för pilar */
.arrow-left.active,
.arrow-left:active,
.arrow-left:focus,
.arrow-right.active,
.arrow-right:active,
.arrow-right:focus {
  opacity: 1;
  color: #fff;
  box-shadow: 0 0 24px 8px #fff, 0 0 40px 12px #00C3FF;
  outline: none;
}
/* Glow-effekt för pilar */
.arrow-left.glow,
.arrow-right.glow {
  opacity: 1;
  color: #fff;
  background: none;
  border: none;
  border-radius: 50%;
  box-shadow: 0 0 16px 4px #00ffe7, 0 0 32px 8px #00ffe7;
  filter: blur(0.5px);
  transition: box-shadow 0.2s, opacity 0.2s;
}
/* Hover-effekt för pilar */
.arrow-left:hover,
.arrow-right:hover {
  opacity: 1;
}
/* Stil för markerat spelkort */
.selected {
  border: 2px solid #ffffff;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}
/* Behållare för spelmenyn */
.game-menu {
  display: flex;
  flex-direction: row;
  transition: transform 0.4s ease;
  position: relative;
  padding-top: 10%;
  justify-content: center;
}
</style>
