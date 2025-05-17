<template>
  <!-- Huvudcontainer för konsolmenyn -->
  <div class="eclipse-menu">
    <div class="eclipse-wrapper">
      <!-- Central cirkel med titel och dekorationer -->
      <div class="central-eclipse">
        <div class="sun"></div> <!-- Sol-dekoration -->
        <div class="moon"></div> <!-- Måne-dekoration -->
        <div class="title">CONSOLES</div> <!-- Titeltext -->
      </div>
      
      <!-- Ring med menyval placerade runt centralen -->
      <div class="menu-ring">
        <div
          v-for="(item, index) in menuItems"
          :key="index"
          class="menu-option"
          :class="{ 'is-focused': selectedIndex === index }" <!-- Visuell markering för valt menyval -->
          :style="getItemPosition(index)" <!-- Positionerar menyvalet i ringen -->
          @click="updateSelection(index)" <!-- Uppdaterar valt menyval vid klick -->
        >
          <div class="option-content">
            <!-- Liten cirkel för varje menyval, med särskild stil för 'BACK' -->
            <div class="mini-eclipse" :class="{ 'back-button': item === 'BACK' }" @click="handleItemClick(index)">
              <div class="mini-eclipse-inner"></div>
            </div>
            <span class="option-text">{{ item }}</span> <!-- Text för menyvalet -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Importerar reaktiva referenser och livscykel-funktioner från Vue
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter() // Router för navigering mellan vyer

// Lista över alla menyval (konsoler och "BACK")
const menuItems = ['PC', 'NES', 'SNES', 'GENESIS', 'GAME BOY', 'GB COLOR', 'GBA', 'PS1', 'N64', 'BACK', 'DREAMCAST', 'DS']
const selectedIndex = ref(0) // Index för valt menyval
const gamepadIndex = ref(null) // Index för ansluten gamepad
const canMove = ref(true) // Styr om användaren kan flytta markeringen
const lastAButtonState = ref(false) // Sparar föregående A-knappens tillstånd
const isTransitioning = ref(false) // Används för att förhindra dubbelklick vid övergång

// Beräknar positionen för varje menyval i en cirkel
function getItemPosition(index) {
  const totalItems = menuItems.length
  const angleStep = (2 * Math.PI) / totalItems // Vinkel mellan varje menyval
  const radius = 250 // Radie för cirkeln
  const angle = angleStep * index - Math.PI / 2 // Startar högst upp
  
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  
  return {
    transform: `translate(${x}px, ${y}px)` // Flyttar menyvalet till rätt position
  }
}

// Uppdaterar valt menyval
function updateSelection(newIndex) {
  if (newIndex >= 0 && newIndex < menuItems.length) {
    selectedIndex.value = newIndex
  }
}

// Hanterar klick på menyval
function handleItemClick(index) {
  const selectedItem = menuItems[index]
  if (selectedItem === 'BACK') {
    window.location.href = '/' // Gå tillbaka till startsidan
  } else if (selectedItem === 'DS') {
    router.push('/games') // Navigera till DS-spel
   } else if (selectedItem === 'PC') {
      router.push('/pc') // Navigera till PC-spel
    } else if (selectedItem === 'nes') {
      router.push('/nes') // Navigera till NES-spel
    } else if (selectedItem === 'snes') {
      router.push('/snes') // Navigera till SNES-spel
    } else if (selectedItem === 'genesis') {
      router.push('/genesis') // Navigera till Genesis-spel
    }
  }

// Hanterar anslutning av gamepad
function gamepadConnectHandler(e) {
  gamepadIndex.value = e.gamepad.index
}

// Hanterar frånkoppling av gamepad
function gamepadDisconnectHandler() {
  gamepadIndex.value = null
}

// Kontrollerar gamepadens inmatning och hanterar navigering/val
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

        // Hanterar förflyttning mellan menyval
        if ((Math.abs(axisValue) > 0.5 || dpadLeft || dpadRight) && canMove.value) {
          canMove.value = false
          if (axisValue > 0.5 || dpadRight) {
            updateSelection(selectedIndex.value + 1)
          } else if (axisValue < -0.5 || dpadLeft) {
            updateSelection(selectedIndex.value - 1)
          }
          setTimeout(() => { canMove.value = true }, 200) // Förhindrar för snabb navigering
        }

        // Hanterar val av menyval med A-knappen
        if (aButton && !lastAButtonState.value && !isTransitioning.value) {
          handleItemClick(selectedIndex.value)
          lastAButtonState.value = true
        } else if (!aButton) {
          lastAButtonState.value = false
        }
      }
    }
    
    animationFrameId = requestAnimationFrame(checkGamepadInternal) // Fortsätter lyssna på gamepad
  }

  checkGamepadInternal()
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
}

// Sätter upp eventlyssnare för gamepad och startar gamepad-kontroll vid montering
onMounted(() => {
  window.addEventListener('gamepadconnected', gamepadConnectHandler)
  window.addEventListener('gamepaddisconnected', gamepadDisconnectHandler)

  const gamepadCleanup = checkGamepad()

  onUnmounted(() => {
    window.removeEventListener('gamepadconnected', gamepadConnectHandler)
    window.removeEventListener('gamepaddisconnected', gamepadDisconnectHandler)
    gamepadCleanup() // Stoppar gamepad-kontrollen vid avmontering
  })
})
</script>

<style scoped>
  /* Huvudcontainer som täcker hela skärmen och centrerar innehållet */
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
  
  /* Wrapper för att centrera och positionera menyn */
  .eclipse-wrapper {
    position: relative;
    width: 1920; /* Bredd på wrappern (kan behöva px) */
    height: 1080;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: translateY(-40px); /* Flyttar upp menyn något */
  }
  
  /* Central cirkel med skugga och ram */
  .central-eclipse {
    position: relative;
    width: 250px;
    height: 250px;
    background: transparent;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 
      0 0 50px #ffffffb6,
      inset 0 0 70px #0e0e0e;
    border: 3px solid #ffffff;
    transition: all 0.3s ease;
  }
  
  /* Sol-dekoration i mitten */
  .sun {
    position: absolute;
    width: 100%;
    height: 100%;
    background: #000000;
    opacity: 1;
    border-radius: 50%;
    transform: scale(0.9);
  }
  
  /* Måne-dekoration i mitten */
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
  
  /* Extra ljuseffekt på titel vid hover */
  .central-eclipse:hover .title {
    text-shadow: 
      0 0 15px rgba(255, 255, 255, 0.8),
      0 0 22px rgba(0, 195, 255, 0.6);
  }
  
  /* Ring som innehåller alla menyval */
  .menu-ring {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  
  /* Varje menyvals position och övergångar */
  .menu-option {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 60px;
    height: 60px;
    margin: -30px;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  /* Innehåll i varje menyval (ikon + text) */
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
  
  /* Inre cirkel för extra djup i menyvalet */
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
  
  /* Visuell feedback för valt eller hovrat menyval */
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
  
  /* Inre cirkel får ljusare färg vid fokus/hover */
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
  
  /* Texten får färg och skugga vid fokus/hover */
  .menu-option.is-focused .option-text,
  .menu-option:hover .option-text {
    color: #00c3ff;
    text-shadow: 
      0 0 6px #00c3ff,
      0 0 10px rgba(255, 255, 255, 0.6);
  }
  
  /* Särskild stil för "BACK"-knappen */
  .back-button {
    width: 75px;
    height: 50px;
    border-radius: 25px;
    background: #dfdfdf;
    box-shadow: 
      0 0 10px #FFFFFF;
    transition: all 0.3s ease;
  }
  
  /* "BACK"-knappen får extra ljus vid fokus/hover */
  .menu-option.is-focused .back-button,
  .menu-option:hover .back-button {
    background: #FFFFFF;
    box-shadow: 
      0 0 15px #000000;
  }
</style>