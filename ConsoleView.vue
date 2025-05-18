<template>
  <!-- Huvudbehållare för solförmörkelsemenyn -->
  <div class="eclipse-menu">
    <div class="eclipse-wrapper">
      <!-- Central solförmörkelse med sol, måne och titel -->
      <div class="central-eclipse">
        <div class="sun"></div>
        <div class="moon"></div>
        <div class="title">KONSOLER</div>
      </div>
      
      <!-- Cirkulär meny med alternativ -->
      <div class="menu-ring">
        <!-- Rendera varje menyval runt ringen -->
        <div
          v-for="(item, index) in menuItems"
          :key="index"
          class="menu-option"
          :class="{ 'is-focused': selectedIndex === index }"
          :style="getItemPosition(index)"
          @click="updateSelection(index)"
        >
          <div class="option-content">
            <!-- Liten solförmörkelseikon för varje val, utseende som tillbakaknapp om item är 'TILLBAKA' -->
            <div class="mini-eclipse" :class="{ 'back-button': item === 'TILLBAKA' }" @click="handleItemClick(index)">
              <div class="mini-eclipse-inner"></div>
            </div>
            <!-- Menytext -->
            <span class="option-text">{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Importera reaktiva variabler och livscykelhakar från Vue
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Initiera Vue Router för navigation
const router = useRouter()

// Menyval som visas i ringen (översatta till svenska där det är rimligt)
const menuItems = [
  'PC', 'NES', 'SNES', 'GENESIS', 'GAME BOY',
  'GB COLOR', 'GBA', 'PS1', 'N64', 'TILLBAKA', 'DREAMCAST', 'DS'
]

// Index för valt menyval
const selectedIndex = ref(0)
// Gamepad-index för att hålla koll på ansluten kontroll
const gamepadIndex = ref(null)
// Flagga för att förhindra för snabba rörelser
const canMove = ref(true)
// Flagga för senaste A-knappens tillstånd (hindrar upprepad aktivering)
const lastAButtonState = ref(false)
// Flagga för övergångstillstånd (t.ex. pågående navigation)
const isTransitioning = ref(false)

/**
 * Beräknar position för ett menyval så att de placeras jämnt i en cirkel.
 * @param {number} index - Index för menyvalet
 * @returns {Object} - CSS transform-stil för placering
 */
function getItemPosition(index) {
  const totalItems = menuItems.length // Antal val
  const angleStep = (2 * Math.PI) / totalItems // Vinkel mellan varje val
  const radius = 250 // Avstånd från mitten
  // Beräkna vinkel för detta val, startar från toppen (-Math.PI/2)
  const angle = angleStep * index - Math.PI / 2
  
  // Beräkna x och y förflyttning
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  
  // Returnera CSS-transform för placering
  return {
    transform: `translate(${x}px, ${y}px)`
  }
}

/**
 * Uppdaterar valt menyindex.
 * @param {number} newIndex - Index att välja
 */
function updateSelection(newIndex) {
  if (newIndex >= 0 && newIndex < menuItems.length) {
    selectedIndex.value = newIndex
  }
}

/**
 * Hanterar klick på menyval.
 * Navigerar eller utför åtgärder beroende på valt alternativ.
 * @param {number} index - Index för klickat val
 */
function handleItemClick(index) {
  const selectedItem = menuItems[index]
  if (selectedItem === 'TILLBAKA') {
    // Navigera till startsidan
    window.location.href = '/'
  } else if (selectedItem === 'DS') {
    router.push('/games')
  } else if (selectedItem === 'PC') {
    router.push('/pc')
  } else if (selectedItem === 'NES') {
    router.push('/nes')
  } else if (selectedItem === 'SNES') {
    router.push('/snes')
  } else if (selectedItem === 'GENESIS') {
    router.push('/genesis')
  }
  // Lägg till fler fall för andra menyval om nödvändigt
}

/**
 * Händelsehanterare när en gamepad ansluts.
 * @param {GamepadEvent} e
 */
function gamepadConnectHandler(e) {
  gamepadIndex.value = e.gamepad.index
}

/**
 * Händelsehanterare när en gamepad kopplas bort.
 */
function gamepadDisconnectHandler() {
  gamepadIndex.value = null
}

/**
 * Kontinuerlig polling av gamepadens tillstånd och hanterar navigation.
 * Hanterar vänster/höger (D-pad eller spak) för att byta val, och A för att välja.
 * Returnerar en cleanup-funktion som stoppar polling.
 */
function checkGamepad() {
  let animationFrameId = null

  const checkGamepadInternal = () => {
    if (gamepadIndex.value !== null) {
      const gamepad = navigator.getGamepads()[gamepadIndex.value]
      if (gamepad) {
        // Läs vänster spaks horisontella axel
        const axisValue = gamepad.axes[0]
        // D-pad vänster/höger
        const dpadLeft = gamepad.buttons[14].pressed
        const dpadRight = gamepad.buttons[15].pressed
        // A-knapp
        const aButton = gamepad.buttons[0].pressed

        // Hantera rörelse (med fördröjning så det inte går för fort)
        if ((Math.abs(axisValue) > 0.5 || dpadLeft || dpadRight) && canMove.value) {
          canMove.value = false
          if (axisValue > 0.5 || dpadRight) {
            updateSelection(selectedIndex.value + 1)
          } else if (axisValue < -0.5 || dpadLeft) {
            updateSelection(selectedIndex.value - 1)
          }
          // Förhindrar för snabb rörelse
          setTimeout(() => { canMove.value = true }, 200)
        }

        // Hantera val av meny med A-knapp (debouncad)
        if (aButton && !lastAButtonState.value && !isTransitioning.value) {
          handleItemClick(selectedIndex.value)
          lastAButtonState.value = true
        } else if (!aButton) {
          lastAButtonState.value = false
        }
      }
    }
    // Fortsätt polling
    animationFrameId = requestAnimationFrame(checkGamepadInternal)
  }

  checkGamepadInternal()
  // Cleanup-funktion för att avbryta polling
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
}

// Sätt upp gamepad-eventlyssnare och starta polling vid mount
onMounted(() => {
  window.addEventListener('gamepadconnected', gamepadConnectHandler)
  window.addEventListener('gamepaddisconnected', gamepadDisconnectHandler)

  // Starta polling av gamepadinmatning
  const gamepadCleanup = checkGamepad()

  // Rensa eventlyssnare och polling när komponenten tas bort
  onUnmounted(() => {
    window.removeEventListener('gamepadconnected', gamepadConnectHandler)
    window.removeEventListener('gamepaddisconnected', gamepadDisconnectHandler)
    gamepadCleanup()
  })
})
</script>

<style scoped>
/* Huvudbehållare: fyller hela vyn och centrerar innehållet */
.eclipse-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #0a0a0a;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Orbitron', sans-serif;
  overflow: hidden;
}

/* Wrapper för menyn, centrerar barnen */
.eclipse-wrapper {
  position: relative;
  width: 1920;
  height: 1080;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateY(-40px);
}

/* Central solförmörkelse: stor cirkel med skugga, innehåller sol/måne/titel */
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

/* Sol: svart cirkel, något mindre än eclipse */
.sun {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #000000;
  opacity: 1;
  border-radius: 50%;
  transform: scale(0.9);
}

/* Måne: svart cirkel, ytterligare lite mindre */
.moon {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #000000;
  opacity: 1;
  border-radius: 50%;
  transform: scale(0.85);
}

/* Titeltext i mitten av förmörkelsen */
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

/* Glow-effekt på titel vid hover */
.central-eclipse:hover .title {
  text-shadow: 
    0 0 15px rgba(255, 255, 255, 0.8),
    0 0 22px rgba(0, 195, 255, 0.6);
}

/* Menyring: behållare för alla val */
.menu-ring {
  position: absolute;
  width: 100%;
  height: 100%;
}

/* Varje menyval: absolut positionerad och placeras cirkulärt med transform */
.menu-option {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 60px;
  height: 60px;
  margin: -30px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Innehåll i varje val: kolumn-flex, centrerar ikon och text */
.option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Mini-eclipse: ikon för varje menyval */
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

/* Innersta delen av mini-eclipse: mörk radial övergång */
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

/* Text under ikonen */
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

/* Markerad eller hoverad meny: blå glow/höjd kontrast */
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

/* Inre delen av markerad/hoverad mini-eclipse: vit/blå highlight */
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

/* Texten för markerat/hoverat val: blå färg och glow */
.menu-option.is-focused .option-text,
.menu-option:hover .option-text {
  color: #00c3ff;
  text-shadow: 
    0 0 6px #00c3ff,
    0 0 10px rgba(255, 255, 255, 0.6);
}

/* Tillbakaknapp: avlång form, ljusgrå bakgrund */
.back-button {
  width: 75px;
  height: 50px;
  border-radius: 25px;
  background: #dfdfdf;
  box-shadow: 
    0 0 10px #FFFFFF;
  transition: all 0.3s ease;
}

/* Markerad/hoverad tillbakaknapp: vit bakgrund, mörk skugga */
.menu-option.is-focused .back-button,
.menu-option:hover .back-button {
  background: #FFFFFF;
  box-shadow: 
    0 0 15px #000000;
}
</style>
