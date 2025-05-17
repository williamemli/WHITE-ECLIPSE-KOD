<!-- Kommenterad version av din kod på svenska -->

<template>
  <!-- Huvudbehållare för menykomponenten -->
  <div class="eclipse-menu">
    <div class="eclipse-wrapper">
      <!-- Central cirkel (sol/måne/title) -->
      <div class="central-eclipse">
        <div class="sun"></div>
        <div class="moon"></div>
        <div class="title">CONSOLES</div>
      </div>
      
      <!-- Ring med menyval -->
      <div class="menu-ring">
        <!-- Loopa över alla menyval och rendera varje som ett alternativ -->
        <div
          v-for="(item, index) in menuItems"
          :key="index"
          class="menu-option"
          :class="{ 'is-focused': selectedIndex === index }" <!-- Markerar valt alternativ -->
          :style="getItemPosition(index)" <!-- Positionera på cirkel -->
          @click="updateSelection(index)" <!-- Markera vid klick -->
        >
          <div class="option-content">
            <!-- Liten cirkel för varje alternativ, med särskild stil för 'BACK' -->
            <div class="mini-eclipse" :class="{ 'back-button': item === 'BACK' }" @click="handleItemClick(index)">
              <div class="mini-eclipse-inner"></div>
            </div>
            <span class="option-text">{{ item }}</span> <!-- Texten för menyvalet -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Importera reaktiva variabler och hooks från Vue
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Lista över alla tillgängliga menyval
const menuItems = ['ARCADE', 'NES', 'SNES', 'GENESIS', 'GAME BOY', 'GB COLOR', 'GBA', 'PS1', 'N64', 'BACK', 'DREAMCAST', 'DS']
// Håller koll på vilket alternativ som är markerat
const selectedIndex = ref(0)
// Håller koll på vilket gamepad-index som är anslutet
const gamepadIndex = ref(null)
// Förhindrar för snabb navigering (debounce)
const canMove = ref(true)
// Kommer ihåg om A-knappen på gamepad var nedtryckt förra gången
const lastAButtonState = ref(false)
// Förhindrar dubbelklick under övergångar
const isTransitioning = ref(false)

// Returnerar CSS-transform för att placera varje menyval i en cirkel
function getItemPosition(index) {
  const totalItems = menuItems.length
  const angleStep = (2 * Math.PI) / totalItems // Vinkel mellan varje menyval
  const radius = 250 // Radie för cirkeln
  const angle = angleStep * index - Math.PI / 2 // Starta rakt upp

  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius

  return {
    transform: `translate(${x}px, ${y}px)`
  }
}

// Uppdaterar vilket menyval som är markerat
function updateSelection(newIndex) {
  if (newIndex >= 0 && newIndex < menuItems.length) {
    selectedIndex.value = newIndex
  }
}

// Hanterar klick på ett menyval
function handleItemClick(index) {
  const selectedItem = menuItems[index]
  if (selectedItem === 'BACK') {
    window.location.href = '/' // Gå tillbaka till startsidan
  } else if (selectedItem === 'DS') {
    router.push('/games') // Navigera till /games
  }
}

// Sparar vilket gamepad som är anslutet
function gamepadConnectHandler(e) {
  gamepadIndex.value = e.gamepad.index
}

// Nollställer gamepad-index när gamepad kopplas bort
function gamepadDisconnectHandler() {
  gamepadIndex.value = null
}

// Huvudloop för gamepadkontroller
function checkGamepad() {
  let animationFrameId = null

  const checkGamepadInternal = () => {
    if (gamepadIndex.value !== null) {
      const gamepad = navigator.getGamepads()[gamepadIndex.value]
      if (gamepad) {
        const axisValue = gamepad.axes[0] // Vänster/höger på styrspak
        const dpadLeft = gamepad.buttons[14].pressed // D-pad vänster
        const dpadRight = gamepad.buttons[15].pressed // D-pad höger
        const aButton = gamepad.buttons[0].pressed // A-knappen

        // Hantera rörelse mellan menyval
        if ((Math.abs(axisValue) > 0.5 || dpadLeft || dpadRight) && canMove.value) {
          canMove.value = false
          if (axisValue > 0.5 || dpadRight) {
            updateSelection(selectedIndex.value + 1)
          } else if (axisValue < -0.5 || dpadLeft) {
            updateSelection(selectedIndex.value - 1)
          }
          setTimeout(() => { canMove.value = true }, 200) // Vänta lite innan nästa rörelse
        }

        // Hantera klick på A-knappen
        if (aButton && !lastAButtonState.value && !isTransitioning.value) {
          handleItemClick(selectedIndex.value)
          lastAButtonState.value = true
        } else if (!aButton) {
          lastAButtonState.value = false
        }
      }
    }

    animationFrameId = requestAnimationFrame(checkGamepadInternal) // Fortsätt loopen
  }

  checkGamepadInternal()
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
}

// Körs när komponenten monteras
onMounted(() => {
  window.addEventListener('gamepadconnected', gamepadConnectHandler)
  window.addEventListener('gamepaddisconnected', gamepadDisconnectHandler)

  const gamepadCleanup = checkGamepad()

  // Körs när komponenten tas bort
  onUnmounted(() => {
    window.removeEventListener('gamepadconnected', gamepadConnectHandler)
    window.removeEventListener('gamepaddisconnected', gamepadDisconnectHandler)
    gamepadCleanup()
  })
})
</script>

<style scoped>
  /* Huvudbehållare för hela menyn, fyller hela skärmen */
  .eclipse-menu {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #0a0a0a; /* Mörk bakgrund */
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Orbitron', sans-serif;
    overflow: hidden;
  }
  
  /* Wrapper för att centrera innehållet */
  .eclipse-wrapper {
    position: relative;
    width: 1920; /* OBS: här saknas enhet, t.ex. px */
    height: 1080;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: translateY(-40px); /* Flyttar uppåt */
  }
  
  /* Den centrala runda delen (sol/måne/title) */
  .central-eclipse {
    position: relative;
    width: 250px;
    height: 250px;
    background: transparent;
    border-radius: 50%; /* Gör cirkelform */
    overflow: hidden;
    box-shadow: 
      0 0 50px #ffffffb6, /* Yttre skugga */
      inset 0 0 70px #0e0e0e; /* Inre skugga */
    border: 3px solid #ffffff;
    transition: all 0.3s ease;
  }
  
  /* Solen - dekorativ cirkel */
  .sun {
    position: absolute;
    width: 100%;
    height: 100%;
    background: #000000;
    opacity: 1;
    border-radius: 50%;
    transform: scale(0.9);
  }
  
  /* Månen - dekorativ cirkel ovanpå solen */
  .moon {
    position: absolute;
    width: 100%;
    height: 100%;
    background: #000000;
    opacity: 1;
    border-radius: 50%;
    transform: scale(0.85);
  }
  
  /* Titeltext i mitten av cirkeln */
  .title {
    position: absolute;
    width: 100%;
    text-align: center;
    color: white;
    font-size: 2.5em;
    font-weight: 600;
    letter-spacing: 3px;
    text-shadow: 
      0 0 12px rgba(31, 152, 203, 0.6),
      0 0 18px rgba(0, 0, 0, 0.4);
    z-index: 10;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 1;
    transition: all 0.3s ease;
  }
  
  /* Effekt på titeltexten vid hover på central cirkel */
  .central-eclipse:hover .title {
    text-shadow: 
      0 0 15px rgba(255, 255, 255, 0.8),
      0 0 22px rgba(0, 195, 255, 0.6);
  }
  
  /* Ring för att placera menyvalen runt cirkeln */
  .menu-ring {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  
  /* Varje menyval-position på ringen */
  .menu-option {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 60px;
    height: 60px;
    margin: -30px; /* Flytta så mitten hamnar rätt */
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  /* Innehåll i varje menyval, centrerat */
  .option-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
  
  /* Liten cirkel för varje menyval */
  .mini-eclipse {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(
      135deg, 
      rgba(255, 255, 255, 0.8) 0%, 
      rgba(255, 255, 255, 0.6) 100%
    );
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 
      0 0 20px rgba(255, 255, 255, 0.5),
      0 0 15px rgba(0, 195, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
  }
  
  /* Inre cirkel i varje menyval */
  .mini-eclipse-inner {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: radial-gradient(
      circle at 30% 30%, 
      #000000 0%, 
      #1a1a1a 100%
    );
    box-shadow: 
      inset 0 0 10px rgba(0, 0, 0, 0.5),
      0 0 8px rgba(0, 0, 0, 0.3);
  }
  
  /* Text under varje menyval */
  .option-text {
    margin-top: 8px;
    color: white;
    font-size: 0.7em;
    font-weight: 600;
    letter-spacing: 1px;
    text-shadow: 
      0 0 4px rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease;
  }
  
  /* Fokuserat eller hoverat menyval: färg och skugg-effekter */
  .menu-option.is-focused .mini-eclipse,
  .menu-option:hover .mini-eclipse {
    background: linear-gradient(
      135deg, 
      rgba(0, 195, 255, 0.8) 0%, 
      rgba(0, 195, 255, 0.6) 100%
    );
    box-shadow: 
      0 0 25px rgba(0, 195, 255, 0.6),
      0 0 20px rgba(255, 255, 255, 0.4);
    border-color: rgba(255, 255, 255, 0.7);
  }
  
  /* Inre cirkel i markerat menyval */
  .menu-option.is-focused .mini-eclipse-inner,
  .menu-option:hover .mini-eclipse-inner {
    background: radial-gradient(
      circle at 30% 30%, 
      #ffffff 0%, 
      #e6e6e6 100%
    );
    box-shadow: 
      inset 0 0 10px rgba(0, 195, 255, 0.5),
      0 0 15px rgba(255, 255, 255, 0.6);
  }
  
  /* Textfärg och skugga vid hover/fokus */
  .menu-option.is-focused .option-text,
  .menu-option:hover .option-text {
    color: #00c3ff;
    text-shadow: 
      0 0 6px #00c3ff,
      0 0 10px rgba(255, 255, 255, 0.6);
  }
  
  /* Specialutformning för "Tillbaka"-knappen */
  .back-button {
    width: 75px;
    height: 50px;
    border-radius: 25px;
    background: #dfdfdf;
    box-shadow: 
      0 0 10px #FFFFFF;
    transition: all 0.3s ease;
  }
  
  /* Fokus/hover på "Tillbaka"-knappen */
  .menu-option.is-focused .back-button,
  .menu-option:hover .back-button {
    background: #FFFFFF;
    box-shadow: 
      0 0 15px #000000;
  }
</style>
