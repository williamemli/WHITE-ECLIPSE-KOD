<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { invoke } from '@tauri-apps/api/core'
import GameCard from '../components/GameCard.vue';

const exeFiles = ref<string[]>([]);
const selectedExeIndex = ref(0);
const isTransitioning = ref(false);
const canMove = ref(true);
const lastAButtonState = ref(false);
const gamepadIndex = ref<number | null>(null);
const backButtonFocused = ref(false);
const leftArrowGlow = ref(false);
const rightArrowGlow = ref(false);

// Hämtar listan med .exe-filer från backend
async function fetchExeFiles() {
  try {
    exeFiles.value = await invoke<string[]>('list_pc_exe_files');
  } catch (e) {
    exeFiles.value = [];
  }
}

// Startar valt .exe-spel genom att anropa backend
async function launchExe(exeName: string) {
  try {
    await invoke('launch_pc_exe', { exeName });
  } catch (e) {
    alert('Misslyckades att starta: ' + exeName);
  }
}

// Välj föregående exe i listan
function selectPrevExe() {
  if (exeFiles.value.length === 0) return;
  if (backButtonFocused.value) return; // Scrolla inte kort om back-knappen är i fokus
  isTransitioning.value = true;
  leftArrowGlow.value = true;
  selectedExeIndex.value = (selectedExeIndex.value - 1 + exeFiles.value.length) % exeFiles.value.length;
  setTimeout(() => { 
    isTransitioning.value = false; 
    leftArrowGlow.value = false;
  }, 500); // Ökat till 500ms för mer synlig glow
}

// Välj nästa exe i listan
function selectNextExe() {
  if (exeFiles.value.length === 0) return;
  if (backButtonFocused.value) return; // Scrolla inte kort om back-knappen är i fokus
  isTransitioning.value = true;
  rightArrowGlow.value = true;
  selectedExeIndex.value = (selectedExeIndex.value + 1) % exeFiles.value.length;
  setTimeout(() => { 
    isTransitioning.value = false; 
    rightArrowGlow.value = false;
  }, 500); // Ökat till 500ms för mer synlig glow
}
     
function launchSelectedExe() {
  if (exeFiles.value.length === 0) return;
  launchExe(exeFiles.value[selectedExeIndex.value]);
}

function focusBackButton() {
  backButtonFocused.value = true;
}
function unfocusBackButton() {
  backButtonFocused.value = false;
}

function handleBackButtonAction() {
  window.location.href = '/console';
}

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
            selectNextExe();
          } else if (axisH < -0.5 || dpadLeft) {
            selectPrevExe();
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
            launchSelectedExe();
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

const handleKeydown = (e: KeyboardEvent) => {
  if (!isTransitioning.value) {
    switch (e.key) {
      case 'ArrowLeft':
        selectPrevExe()
        break
      case 'ArrowRight':
        selectNextExe()
        break
      case 'Enter':
        launchSelectedExe()
        break
      case 'Escape':
        handleBackButtonAction()
        break
    }
  }
}

onMounted(async () => {
  await fetchExeFiles();

  // Försök att auto-detektera en ansluten spelkontroll vid montering
  const pads = navigator.getGamepads();
  for (let i = 0; i < pads.length; i++) {
    if (pads[i]) {
      gamepadIndex.value = i;
      break;
    }
  }

  const stopCheckGamepad = checkGamepad();

  const gamepadConnectHandler = (e: GamepadEvent) => {
    console.log("Spelkontroll ansluten:", e.gamepad);
    gamepadIndex.value = e.gamepad.index;
  };

  const gamepadDisconnectHandler = () => {
    gamepadIndex.value = null;
  };

  window.addEventListener('gamepadconnected', gamepadConnectHandler);
  window.addEventListener('gamepaddisconnected', gamepadDisconnectHandler);
  window.addEventListener('keydown', handleKeydown);

  // Lägg till direkt händelselyssnare för tillbaka-knappen
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = '/console';
    });
  }

  // Returnera städfunktion
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

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

onMounted(fetchExeFiles);

const VISIBLE_CARD_COUNT = 3; // visa 3 kort bara (centerat)
const visibleStart = computed(() => {
  if (exeFiles.value.length <= VISIBLE_CARD_COUNT) return 0;
  let start = selectedExeIndex.value - Math.floor(VISIBLE_CARD_COUNT / 2);
  if (start < 0) start = 0;
  if (start > exeFiles.value.length - VISIBLE_CARD_COUNT) start = exeFiles.value.length - VISIBLE_CARD_COUNT;
  return start;
});
const visibleExeFiles = computed(() => {
  return exeFiles.value.slice(visibleStart.value, visibleStart.value + VISIBLE_CARD_COUNT);
});
</script>

<template>
  <div class="games-exe-view">
    <div class="eclipse-bg">
      <div class="eclipse-white"></div>
      <div class="eclipse-black"></div>
    </div>
    <div class="menu-arrows" v-if="exeFiles.length > 1 && !backButtonFocused">
      <button class="arrow-left" :class="{ glow: leftArrowGlow }" @click="selectPrevExe" :disabled="isTransitioning">←</button>
      <button class="arrow-right" :class="{ glow: rightArrowGlow }" @click="selectNextExe" :disabled="isTransitioning">→</button>
    </div>
    <div v-if="exeFiles.length === 0" class="no-games">Inga spel hittades.</div>
    <div v-else class="game-menu">
      <GameCard
        v-for="(exe, idx) in visibleExeFiles"
        :key="exe"
        :title="exe"
        :selected="idx + visibleStart === selectedExeIndex && !backButtonFocused"
        @click="launchExe(exe)"
        style="cursor:pointer;"
      />
    </div>
    <button @click="handleBackButtonAction" class="back-button" :class="{ focused: backButtonFocused }" tabindex="-1">
      Tillbaka till Konsoler
    </button>
  </div>
</template>

<style scoped>
/*
  Bakgrund för eclipse-effekt. Fyller hela skärmen och centrerar innehållet.
*/
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
/* Vit cirkel för eclipse-effekt */
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
/* Svart cirkel ovanpå för eclipse-effekt */
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
/* Huvudcontainer för vyn */
.games-exe-view {
  padding: 2rem;
  position: relative;
  z-index: 1;
}
/* Layout för spelkort */
.game-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
/* Meddelande om inga spel hittades */
.no-games {
  color: #aaa;
  font-size: 1.2rem;
  margin-top: 2rem;
  text-align: center;
}
/* Tillbaka-knapp längst ner */
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
/* Stil för när back-knappen är i fokus */
.back-button.focused {
  outline: 3px solid #fff;
  background-color: #222;
  color: #00C3FF;
  box-shadow: 0 0 16px #fff;
}
/* Pilar för att bläddra mellan spel */
.menu-arrows {
  position: fixed;
  width: 100%;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  top: 400px;
}
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
/* Effekt när pilen är aktiv eller i fokus */
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
/* Glow-effekt när pilen används */
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
.arrow-left:hover,
.arrow-right:hover {
  opacity: 1;
}
/* Markerar valt spelkort */
.selected {
  border: 2px solid #ffffff;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}
/* Layout för spelmenyn */
.game-menu {
  display: flex;
  flex-direction: row;
  transition: transform 0.4s ease;
  position: relative;
  padding-top: 10%;
  justify-content: center;
}
</style>
