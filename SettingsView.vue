<template>
    <div class="container">
        <button 
            class="shrine-back" 
            id="backButton"
            @click="goBack" 
            tabindex="0" 
            :class="{ 'focused': currentFocus === -1, 'controller-hover': isControllerHoveringBackButton }"
            aria-label="Back"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <path d="M60 25 L60 75 L25 50 Z" fill="currentColor"/>
            </svg>
        </button>
        <div class="eclipse">
            <div class="menu">
                <div 
                    v-for="(item, index) in menuItems" 
                    :key="item.id" 
                    class="menu-item" 
                    :class="{ 'focused': currentFocus === index, 'controller-hover': isControllerHoveringMenuItem(item.id) }" 
                    tabindex="0"
                    :data-id="item.id"
                >
                    <h3>{{ item.title }}</h3>
                    <div class="setting-control">
                        <!-- Graphics Quality -->
                        <template v-if="item.id === 'graphicsQuality'">
                            <input 
                                type="range" 
                                :min="item.min" 
                                :max="item.max" 
                                v-model.number="settings.graphicsQuality" 
                                @input="updateSetting(item.id)"
                            >
                            <span>{{ getGraphicsQualityText() }}</span>
                        </template>
  
                        <!-- Sound Volume -->
                        <template v-else-if="item.id === 'soundVolume'">
                            <input 
                                type="range" 
                                :min="item.min" 
                                :max="item.max" 
                                v-model.number="settings.soundVolume" 
                                @input="updateSetting(item.id)"
                            >
                            <span>{{ settings.soundVolume }}%</span>
                        </template>
  
                        <!-- Difficulty -->
                        <template v-else-if="item.id === 'difficulty'">
                            <select 
                                v-model="settings.difficulty" 
                                @change="updateDifficulty"
                            >
                                <option 
                                    v-for="diff in difficulties" 
                                    :key="diff.value" 
                                    :value="diff.value"
                                >
                                    {{ diff.label }}
                                </option>
                            </select>
                        </template>
  
                        <!-- Gore Effects -->
                        <template v-else-if="item.id === 'goreEffects'">
                            <label class="toggle" :class="{ 'toggle-active': settings.goreEffects }">
                                <input 
                                    type="checkbox" 
                                    :checked="settings.goreEffects"
                                    @change="toggleGoreEffects"
                                >
                                <span class="toggle-slider" :class="{ 'toggle-on': settings.goreEffects }"></span>
                                <span class="toggle-text toggle-text-on">On</span>
                                <span class="toggle-text toggle-text-off">Off</span>
                            </label>
                        </template>

                        <!-- Animation Speed -->
                        <template v-else-if="item.id === 'animationSpeed'">
                            <select 
                                v-model="settings.animationSpeed" 
                                @change="updateSetting('animationSpeed')"
                            >
                                <option 
                                    v-for="speed in speeds" 
                                    :key="speed.value" 
                                    :value="speed.value"
                                >
                                    {{ speed.label }}
                                </option>
                            </select>
                        </template>

                        <!-- Screen Filter -->
                        <template v-else-if="item.id === 'screenFilter'">
                            <select 
                                v-model="settings.screenFilter" 
                                @change="updateSetting('screenFilter')"
                            >
                                <option 
                                    v-for="filter in filters" 
                                    :key="filter.value" 
                                    :value="filter.value"
                                >
                                    {{ filter.label }}
                                </option>
                            </select>
                        </template>

                        <!-- Dark Mode -->
                        <template v-else-if="item.id === 'darkMode'">
                            <label class="toggle" :class="{ 'toggle-active': settings.darkMode }">
                                <input 
                                    type="checkbox" 
                                    :checked="settings.darkMode"
                                    @change="toggleDarkMode"
                                >
                                <span class="toggle-slider" :class="{ 'toggle-on': settings.darkMode }"></span>
                                <span class="toggle-text toggle-text-on">On</span>
                                <span class="toggle-text toggle-text-off">Off</span>
                            </label>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </template>
  
  <script setup>
  // Importera Vue-funktioner och stores
  import { ref, onMounted, onUnmounted, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import { playerStore } from '../stores/playerStore'
  import { settingsStore } from '../stores/settingsStore'
  
  // Router för navigation
  const router = useRouter()
  // Reactive settings-objekt
  const settings = ref(settingsStore.settings.value)
  
  // Menyobjekt för inställningar
  const menuItems = [
  { 
    id: 'graphicsQuality', 
    title: 'Brightness', 
    min: 1, 
    max: 3 
  },
  { 
    id: 'soundVolume', 
    title: 'Sound Volume', 
    min: 0, 
    max: 100 
  },
  { 
    id: 'screenFilter', 
    title: 'Screen Filter' 
  },
  { 
    id: 'darkMode', 
    title: 'Dark Mode' 
  }
  ]
  
  // Svårighetsgrader
  const difficulties = [
  { value: 'slow', label: 'Slow' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
  { value: 'hyper', label: 'Hyper' }
  ]

  // Hastighetsalternativ för animationer
  const speeds = [
    { value: 'slow', label: 'Slow' },
    { value: 'normal', label: 'Normal' },
    { value: 'fast', label: 'Fast' },
    { value: 'hyper', label: 'Hyper' }
  ]

  // Filteralternativ för skärmen
  const filters = [
    { value: 'none', label: 'None' },
    { value: 'sepia', label: 'Sepia' },
    { value: 'blur', label: 'Blur' },
    { value: 'contrast', label: 'Contrast' },
    { value: 'invert', label: 'Invert' }
  ]
  
  // Fokus och kontroll för meny
  const currentFocus = ref(-1) // Startar med back-knappen i fokus
  const allItems = ref([])
  const gamepad = ref(null)
  const gamepadState = ref({})
  let symbolInterval;
  let lastInputTime = 0
  const inputDelay = 200 // ms mellan inputs
  const analogThreshold = 0.6 // tröskelvärde för analogspak
  
  // Returnerar text för grafikinställning
  function getGraphicsQualityText() {
  const qualityMap = {
    1: 'Low',
    2: 'Medium-Low',
    3: 'Medium',
    4: 'High',
    5: 'Ultra'
  }
  return qualityMap[settings.value.graphicsQuality]
  }
  
  // Uppdaterar inställning i store
  function updateSetting(settingId) {
  settingsStore.updateSetting(settingId, settings.value[settingId]);
  createBloodParticles();
  }
  
  // Uppdaterar effekter för svårighetsgrad
  function updateDifficulty() {
  updateDifficultyEffects(settings.value.difficulty)
  }
  
  // Växlar gore-effekter
  function toggleGoreEffects() {
  // Växla värde
  settings.value.goreEffects = !settings.value.goreEffects
  
  // Skapa visuell feedback
  createBloodParticles()
  
  // Extra effekter beroende på gore
  const eclipse = document.querySelector('.eclipse')
  if (settings.value.goreEffects) {
    eclipse.classList.add('gore-enabled')
  } else {
    eclipse.classList.remove('gore-enabled')
  }
  
  // Uppdatera svårighets-effekter
  updateDifficultyEffects(settings.value.difficulty)
  
  // Tvinga UI-uppdatering
  nextTick(() => {
    const goreEffectsToggle = document.querySelector('.menu-item[data-id="goreEffects"] .toggle')
    if (goreEffectsToggle) {
      goreEffectsToggle.classList.toggle('toggle-active', settings.value.goreEffects)
    }
  })
  
  // Logga för felsökning
  console.log('Gore Effects toggled:', settings.value.goreEffects)
  }

  // Växlar mörkt läge
  function toggleDarkMode() {
    settings.value.darkMode = !settings.value.darkMode;
    updateSetting('darkMode');
  }
  
  // Hanterar input från tangentbord och gamepad
  function handleInput(action) {
  console.log('handleInput called with action:', action)
  console.log('Current focus:', currentFocus.value)
  console.log('Menu items:', menuItems)
  
  const currentMenuItem = menuItems[currentFocus.value]
  console.log('Current menu item:', currentMenuItem)
  
  // Universal toggle for Gore Effects
  if (currentMenuItem && currentMenuItem.id === 'goreEffects') {
    console.log('Gore Effects menu item detected')
    switch(action) {
      case 'select':
      case 'left':
      case 'right':
        console.log('Attempting to toggle Gore Effects')
        toggleGoreEffects()
        return
    }
  }
  
  // Original input handling logic
  switch(action) {
    case 'up':
      if (currentFocus.value <= -1) {
        currentFocus.value = -1
      } else {
        currentFocus.value--
      }
      break
    case 'down':
      if (currentFocus.value === -1) {
        currentFocus.value = 0
      } else if (currentFocus.value < menuItems.length - 1) {
        currentFocus.value++
      }
      break
    case 'select':
      if (currentFocus.value === -1) {
        goBack()
      }
      break
    case 'left':
    case 'right':
      adjustCurrentSetting(action)
      break
    case 'back':
      goBack()
      break
  }
  }
  
  // Justerar aktuell inställning beroende på riktning
  function adjustCurrentSetting(direction) {
  // Skip if we're on the back button
  if (currentFocus.value === -1) return
  
  // Get the current menu item based on focus
  const menuItem = menuItems[currentFocus.value]
  if (!menuItem) return
  
  console.log('Adjusting setting:', menuItem.id, 'Direction:', direction)
  
  // Handle different setting types
  switch (menuItem.id) {
    case 'graphicsQuality':
      const newQuality = settings.value.graphicsQuality + (direction === 'right' ? 1 : -1)
      if (newQuality >= menuItem.min && newQuality <= menuItem.max) {
        settings.value.graphicsQuality = newQuality
        updateSetting('graphicsQuality')
      }
      break
  
    case 'soundVolume':
      const newVolume = settings.value.soundVolume + (direction === 'right' ? 5 : -5)
      if (newVolume >= menuItem.min && newVolume <= menuItem.max) {
        settings.value.soundVolume = newVolume
        updateSetting('soundVolume')
      }
      break
  
    case 'difficulty':
      const currentIndex = difficulties.findIndex(d => d.value === settings.value.difficulty)
      if (currentIndex !== -1) {
        const newIndex = currentIndex + (direction === 'right' ? 1 : -1)
        if (newIndex >= 0 && newIndex < difficulties.length) {
          settings.value.difficulty = difficulties[newIndex].value
          updateDifficulty()
        }
      }
      break
  
    case 'goreEffects':
      // Toggle gore effects
      settings.value.goreEffects = !settings.value.goreEffects
      toggleGoreEffects()
      break

    case 'animationSpeed':
      const currentSpeedIndex = speeds.findIndex(s => s.value === settings.value.animationSpeed);
      if (currentSpeedIndex !== -1) {
        const newIndex = currentSpeedIndex + (direction === 'right' ? 1 : -1);
        if (newIndex >= 0 && newIndex < speeds.length) {
          settings.value.animationSpeed = speeds[newIndex].value;
          updateSetting('animationSpeed');
        }
      }
      break;

    case 'screenFilter':
      const currentFilterIndex = filters.findIndex(f => f.value === settings.value.screenFilter);
      if (currentFilterIndex !== -1) {
        const newIndex = currentFilterIndex + (direction === 'right' ? 1 : -1);
        if (newIndex >= 0 && newIndex < filters.length) {
          settings.value.screenFilter = filters[newIndex].value;
          updateSetting('screenFilter');
        }
      }
      break;
    
    case 'darkMode':
      settings.value.darkMode = !settings.value.darkMode;
      updateSetting('darkMode');
      break;
  
    default:
      console.log('Unhandled menu item:', menuItem.id)
  }
  }
  
  // Aktiverar nuvarande menyobjekt
  function activateCurrentItem() {
  const currentItem = allItems.value[currentFocus.value]
  if (currentItem === -1) {
    goBack()
  } else {
    const menuItem = currentItem
    const input = menuItem.querySelector('input[type="range"], select, input[type="checkbox"]')
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = !input.checked
        input.dispatchEvent(new Event('change'))
      } else {
        input.focus()
      }
    }
  }
  }
  
  // Skapar blodpartiklar för visuell effekt
  function createBloodParticles() {
  const particleContainer = document.createElement('div')
  particleContainer.className = 'particle-container'
  document.body.appendChild(particleContainer)
  
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div')
    particle.className = 'particle'
    particle.style.left = Math.random() * 100 + '%'
    particle.style.top = Math.random() * 100 + '%'
    particle.style.transform = `rotate(${Math.random() * 360}deg)`
    particle.style.animationDelay = `${Math.random() * 0.5}s`
    particleContainer.appendChild(particle)
  }
  
  setTimeout(() => particleContainer.remove(), 1500)
  }
  
  // Uppdaterar effekter beroende på svårighetsgrad
  function updateDifficultyEffects(value) {
  const eclipse = document.querySelector('.eclipse')
  const container = document.querySelector('.container')
  
  // Reset previous effects
  eclipse.style.animation = ''
  container.style.animation = ''
  document.body.className = ''
  
  switch(value) {
    case 'easy':
      eclipse.style.background = 'radial-gradient(circle, rgba(0, 128, 0, 0.4) 0%, rgba(0, 0, 0, 1) 70%)'
      createParticles('nature', 20)
      break
    case 'normal':
      eclipse.style.background = 'radial-gradient(circle, rgba(139, 0, 0, 0.4) 0%, rgba(0, 0, 0, 1) 70%)'
      createParticles('ember', 15)
      break
    case 'hard':
      eclipse.style.background = 'radial-gradient(circle, rgba(255, 0, 0, 0.6) 0%, rgba(0, 0, 0, 1) 70%)'
      container.style.animation = 'pulse 2s infinite'
      createParticles('fire', 25)
      break
    case 'berserk':
      eclipse.style.background = 'radial-gradient(circle, rgba(255, 0, 0, 0.8) 0%, rgba(0, 0, 0, 1) 70%)'
      document.body.classList.add('berserk-mode')
      createParticles('skull', 10)
      createParticles('blood', 30)
      break
  }
  }
  
  // Skapar partiklar av olika typ
  function createParticles(type, count) {
  const particleContainer = document.createElement('div')
  particleContainer.className = 'particle-container'
  document.body.appendChild(particleContainer)
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div')
    particle.className = `particle particle-${type}`
    
    const randomScale = 0.5 + Math.random() * 1.5
    const randomDuration = 1 + Math.random() * 2
    const randomDelay = Math.random() * 0.5
    
    particle.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      transform: scale(${randomScale}) rotate(${Math.random() * 360}deg);
      animation-duration: ${randomDuration}s;
      animation-delay: ${randomDelay}s;
    `
    
    particleContainer.appendChild(particle)
  }
  
  setTimeout(() => particleContainer.remove(), 2500)
  }
  
  // Skapar flytande symboler (t.ex. grekiska bokstäver)
  function createFloatingSymbols() {
  const greekLetters = ['Γ', 'Δ', 'Θ', 'Λ', 'Ξ', 'Π', 'Σ', 'Φ', 'Ψ', 'Ω']
  
  function createSymbol(side) {
    const symbol = document.createElement('div')
    symbol.className = 'floating-text'
    
    if (Math.random() > 0.05) {
      symbol.textContent = greekLetters[Math.floor(Math.random() * greekLetters.length)]
    } else {
      symbol.innerHTML = '<img src="src\assets\icons8-berserk.svg" width="48" height="48" class="berserk-icon" />'
    }
    
    // sprid symboler
    const spread = 30 // sprid bredd 
    const randomSpread = Math.random() * spread
    if (side === 'left') {
      symbol.style.left = `${randomSpread}%`
    } else {
      symbol.style.left = `${100 - randomSpread}%`
    }
    
    const rotation = (Math.random() * 20 - 10)
    symbol.style.setProperty('--rotation', `${rotation}deg`)
    
    document.body.appendChild(symbol)
    
    setTimeout(() => {
      if (symbol && symbol.parentNode) {
        symbol.remove()
      }
    }, 10000)
  }
  
  // Skapa en initial "burst" av symboler från båda hörnen
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      createSymbol(i % 2 === 0 ? 'left' : 'right')
    }, i * 80)
  }
  
  // Fortsätt skapa symboler växelvis från vänster och höger
  let isLeft = true
  symbolInterval = setInterval(() => {
    createSymbol(isLeft ? 'left' : 'right')
    isLeft = !isLeft
  }, 300)
  }
  
  // Pollar gamepadens tillstånd och hanterar navigation
  function pollGamepad() {
  // Avbryt om ingen gamepad är ansluten
  if (!gamepad.value) return
  
  // Hämta alla anslutna gamepads
  const gamepads = navigator.getGamepads()
  const currentGamepad = gamepads[gamepad.value.index]
  
  // Avbryt om ingen giltig gamepad hittas
  if (!currentGamepad) return
  
  // Hämta aktuell tid och tid sedan senaste input
  const currentTime = Date.now()
  const timeSinceLastInput = currentTime - lastInputTime
  
  // Bearbeta endast input om tillräckligt med tid har gått
  if (timeSinceLastInput >= inputDelay) {
    // Läs av axlar (spakar) med full precision
    const leftStickX = currentGamepad.axes[0]
    const leftStickY = currentGamepad.axes[1]
    /*
      Knappar på gamepaden (A, B, X, Y)
    */
    const buttons = {
      a: currentGamepad.buttons[0].pressed,
      b: currentGamepad.buttons[1].pressed,
      x: currentGamepad.buttons[2].pressed,
      y: currentGamepad.buttons[3].pressed
    }
  
    // Navigationsinput från vänster spak
    const navInputs = {
      up: leftStickY < -0.5,
      down: leftStickY > 0.5,
      left: leftStickX < -0.5,
      right: leftStickX > 0.5
    }
  
    // Hämta nuvarande menyobjekt
    const currentMenuItem = menuItems[currentFocus.value]
  
    // Hantera navigation (upp/ner med vänster spak)
    if (navInputs.up) {
      handleInput('up')
      updateControllerHover()
      lastInputTime = currentTime
    }
    if (navInputs.down) {
      handleInput('down')
      updateControllerHover()
      lastInputTime = currentTime
    }
  
    // Hantera inställningsändringar för alla utom Gore Effects
    if (currentMenuItem && currentMenuItem.id !== 'goreEffects') {
      if (navInputs.left) {
        adjustCurrentSetting('left')
        updateControllerHover()
        lastInputTime = currentTime
      }
      if (navInputs.right) {
        adjustCurrentSetting('right')
        updateControllerHover()
        lastInputTime = currentTime
      }
    }
  
    // Special hantering för Gore Effects
    if (currentMenuItem && currentMenuItem.id === 'goreEffects') {
      // Toggle knapp horizontal rörelse eller knapp tryck
      if (navInputs.left || navInputs.right || 
          buttons.a || buttons.x || buttons.b || buttons.y) {
        toggleGoreEffects()
        updateControllerHover()
        lastInputTime = currentTime
      }
    } else {
      // Standard knapp hantering för meny objekt
      if (buttons.a) {
        handleInput('select')
        updateControllerHover()
        lastInputTime = currentTime
      }
      if (buttons.b) {
        handleInput('back')
        updateControllerHover()
        lastInputTime = currentTime
      }
    }
  }
  
  requestAnimationFrame(pollGamepad)
  }
  
  // Hanterar tangenttryckningar
  function handleKeyDown(e) {
  const keyActions = {
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'Enter': 'select',
    'Escape': 'back'
  }
  
  if (keyActions[e.key]) {
    handleInput(keyActions[e.key])
    e.preventDefault()
  }
  }
  
  // Uppdaterar visuell hover för controller
  function updateControllerHover() {
  // Remove previous hover states
  const previousHoverElements = document.querySelectorAll('.controller-hover')
  previousHoverElements.forEach(el => el.classList.remove('controller-hover'))
  
  // hämta den nurvarande meny onjekt
  const currentMenuItem = menuItems[currentFocus.value]
  if (!currentMenuItem) return
  
  // hitta rätt DOM element
  const menuItemElement = document.querySelector(`.menu-item[data-id="${currentMenuItem.id}"]`)
  if (menuItemElement) {
    menuItemElement.classList.add('controller-hover')
  }
  
  // Special handling för bak knapp
  if (currentFocus.value === -1) {
    const backButton = document.querySelector('.shrine-back')
    if (backButton) {
      backButton.classList.add('controller-hover')
    }
  }
  }
  
  // Returnerar true om back-knappen är i fokus
  function isControllerHoveringBackButton() {
  return currentFocus.value === -1
  }
  
  // Returnerar true om menyobjektet är i fokus
  function isControllerHoveringMenuItem(id) {
  return menuItems[currentFocus.value] && menuItems[currentFocus.value].id === id
  }
  
  // Navigerar tillbaka till startsidan
  function goBack() {
    window.location.href = '/'
  }
  
  // Körs när komponenten mountas
  onMounted(() => {
  // Lägg till eventlyssnare för tangentbord
  document.addEventListener('keydown', handleKeyDown)
  
  // Hämta knappar och menyobjekt
  const backButton = document.querySelector('.shrine-back')
  const menuItemElements = document.querySelectorAll('.menu-item')
  allItems.value = [backButton, ...menuItemElements]
  
  // Sätt initialt fokus
  currentFocus.value = -1
  
  // Lägg till eventlyssnare för gamepad
  window.addEventListener('gamepadconnected', (e) => {
    gamepad.value = e.gamepad
    requestAnimationFrame(pollGamepad)
  })
  
  window.addEventListener('gamepaddisconnected', () => {
    gamepad.value = null
  })
  
  // Skapa flytande symboler
  createFloatingSymbols()
  
  // Säkerställ att back-knappen fungerar
  document.getElementById('backButton').addEventListener('click', () => {
    window.location.href = '/'
  })

  // Applicera sparade inställningar vid mount
  document.body.style.filter = `brightness(${(settings.value.graphicsQuality / 3) * 100}%)`;
  playerStore.setVolume(settings.value.soundVolume);
  // Apply screen filter if it exists
  if (settings.value.screenFilter && settings.value.screenFilter !== 'none') {
    settingsStore.applySettings('screenFilter');
  }
  updateDifficultyEffects(settings.value.difficulty);
  })
  
  // Körs när komponenten avmonteras
  onUnmounted(() => {
  // Rensa intervall för symboler
  if (symbolInterval) {
    clearInterval(symbolInterval)
  }
  
  // Ta bort alla flytande symboler
  const symbols = document.querySelectorAll('.floating-text')
  symbols.forEach(symbol => {
    if (symbol && symbol.parentNode) {
      symbol.remove()
    }
  })
  
  // Ta bort eventlyssnare
  document.removeEventListener('keydown', handleKeyDown)
  // Ta bort eventlyssnare för gamepad när komponenten avmonteras
  window.removeEventListener('gamepadconnected', () => {})
  window.removeEventListener('gamepaddisconnected', () => {})
  
  // Nollställ gamepad-tillstånd
  gamepad.value = null
  gamepadState.value = {}

  // Återställ visuella effekter på sidan
  // T.ex. ljusstyrka eller filter
  // Detta körs när man lämnar inställningsvyn
  // så att sidan återgår till sitt ursprungliga utseende
  // Återställ visuella effekter
  document.body.style.filter = ''
  })
  </script>
  
  <style>
  /* Importerar typsnitt för rubriker och brödtext */
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Roboto:wght@300;400;700&display=swap');
  
  /*
    =============================
    Globala variabler och färger
    =============================
    Här definieras färgteman och övergångstider som används i hela applikationen.
  */
  :root {
    /* Primärfärg för accenter och effekter */
    --primary-color: #8B0000;
    /* Bakgrundsfärg för hela appen */
    --background-color: #000000;
    /* Textfärg */
    --text-color: #ffffff;
    /* Färg för markeringar och effekter */
    --highlight-color: #FF4500;
    /* Standard övergångstid för animationer */
    --transition-duration: 0.3s;
  }
  
  /*
    =============================
    Grundläggande layout och bakgrund
    =============================
    Sätter grundläggande layout, bakgrundsfärg och typsnitt för hela sidan.
  */
  body, html {
    /* Nollställer marginal och padding */
    margin: 0;
    padding: 0;
    height: 100vh;
    font-family: 'Roboto', sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
    overflow: hidden;
    /* Mjuka övergångar för färgändringar */
    transition: background-color var(--transition-duration),
                color var(--transition-duration),
                border-color var(--transition-duration);
  }
  
  /*
    =============================
    Container för inställningsmenyn
    =============================
    Centrera innehållet och applicera bakgrundsfärg.
  */
  .container {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--background-color); /* Säkerställer bakgrundsfärg */
    transition: background-color var(--transition-duration),
                color var(--transition-duration),
                border-color var(--transition-duration);
  }
  
  /*
    =============================
    Tillbaka-knapp (shrine-back)
    =============================
    Stil för tillbaka-knappen, inklusive hover- och fokus-effekter.
  */
  .shrine-back {
    width: 60px;
    height: 60px;
    margin-bottom: 20px;
    border: 2px solid var(--primary-color);
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    cursor: pointer;
    z-index: 100;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .shrine-back svg {
    width: 60%;
    height: 60%;
    color: #ffffff;
  }
  
  .shrine-back:hover,
  .shrine-back.focused,
  .shrine-back.controller-hover {
    transform: scale(1.1);
    background: rgba(139, 0, 0, 0.2);
    box-shadow: 0 0 20px var(--primary-color);
    transition: all 0.3s ease;
  }
  
  /*
    =============================
    Eclipse (bakgrundscirkel)
    =============================
    Visuell cirkel bakom menyn med animerad glöd.
  */
  .eclipse {
    position: relative;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(139, 0, 0, 0.4) 0%, rgba(0, 0, 0, 1) 70%);
    border-radius: 50%;
    box-shadow: 0 0 20px 10px rgba(139, 0, 0, 0.6);
    animation: glow 3s infinite alternate;
  }
  
  @keyframes glow {
    0% { 
      animation-duration: calc(3s * var(--animation-speed-multiplier, 1));
      box-shadow: 0 0 20px 10px rgba(139, 0, 0, 0.6); 
    }
    100% { 
      box-shadow: 0 0 40px 20px rgba(139, 0, 0, 0.8); 
    }
  }
  
  /*
    =============================
    Meny och menyobjekt
    =============================
    Stil och effekter för inställningsmenyn och dess objekt.
  */
  .menu {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 10px;
    padding: 20px;
    transition: background-color var(--transition-duration),
                color var(--transition-duration),
                border-color var(--transition-duration);
  }
  
  .menu-item {
    margin-bottom: 20px;
    padding: 10px;
    border-radius: 5px;
    transition: all 0.3s;
    display: flex;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    transition: background-color var(--transition-duration),
                color var(--transition-duration),
                border-color var(--transition-duration);
  }
  
  .menu-item:hover, .menu-item:focus, .menu-item.controller-hover {
    transform: scale(1.05) rotate(2deg);
    background-color: rgba(139, 0, 0, 0.8);
    box-shadow: 0 0 15px var(--highlight-color);
    transition: all 0.3s ease;
  }
  
  .menu-item.focused {
    background-color: rgba(139, 0, 0, 0.6);
  }
  
  .menu-item h3 {
    margin: 0;
    font-family: 'Cinzel', serif;
    text-transform: uppercase;
    transition: text-shadow 0.3s, color 0.3s;
  }
  
  .menu-item:hover h3, .menu-item:focus h3, .menu-item.controller-hover h3 {
    text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff;
    color: var(--highlight-color);
  }
  
  .setting-control {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  /*
    =============================
    Reglage (input[type="range"])
    =============================
    Anpassar utseendet på reglage för t.ex. ljusstyrka och volym.
  */
  input[type="range"] {
    width: 70%;
    appearance: none; /* Standardiserad egenskap */
    -webkit-appearance: none;
    background: transparent;
  }
  
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: var(--primary-color);
    cursor: pointer;
    margin-top: -8px;
    box-shadow: 0 0 10px var(--highlight-color);
  }
  
  input[type="range"]::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    background: #ddd;
    border-radius: 2px;
  }
  
  /*
    =============================
    Dropdown-menyer (select)
    =============================
    Stil för val av t.ex. svårighetsgrad och filter.
  */
  select {
    appearance: none;
    -webkit-appearance: none;
    background: rgba(20, 20, 20, 0.95);
    border: 1px solid #8B0000;
    color: #fff;
    padding: 8px 15px;
    width: 140px;
    cursor: pointer;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  select:hover {
    border-color: #ff0000;
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.2);
  }
  
  select:focus {
    outline: none;
    border-color: #ff0000;
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.3);
  }
  
  select option {
    background: rgba(20, 20, 20, 0.95);
    color: #fff;
    padding: 8px;
  }
  
  /*
    =============================
    Växlingsknappar (toggle)
    =============================
    Stil och animationer för av/på-knappar.
  */
  .toggle {
    position: relative;
    display: inline-block;
    width: 80px;
    height: 40px;
  }
  
  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, #1a1a1a, #333);
    transition: .4s;
    border-radius: 40px;
    overflow: hidden;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
  }
  
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 32px;
    width: 32px;
    left: 4px;
    bottom: 4px;
    background: linear-gradient(45deg, #666, #999);
    transition: .4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
  }
  
  .toggle-slider:after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #8B0000, #FF0000);
    transform: translateX(-100%);
    transition: .4s;
    opacity: 0;
  }
  
  .toggle-text {
    position: absolute;
    color: #fff;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    transition: .4s;
    text-shadow: 0 0 5px rgba(0,0,0,0.5);
  }
  
  .toggle-text-on {
    left: 10px;
    opacity: 0;
  }
  
  .toggle-text-off {
    right: 10px;
    opacity: 1;
  }
  
  input:checked + .toggle-slider {
    background: linear-gradient(45deg, #500, #800);
  }
  
  input:checked + .toggle-slider:before {
    transform: translateX(40px);
    background: linear-gradient(45deg, #ff3019, #cf0404);
    box-shadow: 
      0 0 20px #ff0000,
      0 0 40px #ff0000,
      inset 0 0 15px rgba(255,255,255,0.3);
  }
  
  input:checked + .toggle-slider:after {
    transform: translateX(0);
    opacity: 0.6;
  }
  
  .toggle:hover .toggle-slider:before {
    box-shadow: 0 0 15px rgba(255,69,0,0.5);
  }
  
  input:checked + .toggle-slider .toggle-text-on {
    opacity: 1;
  }
  
  input:checked + .toggle-slider .toggle-text-off {
    opacity: 0;
  }
  
  .toggle-slider.toggle-on {
    background: linear-gradient(45deg, #500, #800);
  }
  
  .toggle-slider.toggle-on:before {
    transform: translateX(40px);
    background: linear-gradient(45deg, #ff3019, #cf0404);
    box-shadow: 
      0 0 20px #ff0000,
      0 0 40px #ff0000,
      inset 0 0 15px rgba(255,255,255,0.3);
  }
  
  .toggle-slider.toggle-on:after {
    transform: translateX(0);
    opacity: 0.6;
  }
  
  .toggle.toggle-active .toggle-text-on {
    opacity: 1;
  }
  
  .toggle.toggle-active .toggle-text-off {
    opacity: 0;
  }
  
  /*
    =============================
    Partikeleffekter
    =============================
    Används för blod, eld, natur m.m. vid olika inställningar.
  */
  .particle-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  
  .particle {
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: var(--primary-color);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    animation: particleAnimation 1.5s ease-out;
    opacity: 0;
    animation-duration: calc(1.5s * var(--animation-speed-multiplier, 1));
  }
  
  @keyframes particleAnimation {
    0% { 
      transform: translateY(0) scale(1) rotate(0deg); 
      opacity: 1; 
    }
    100% { 
      transform: translateY(-100px) scale(0) rotate(720deg); 
      opacity: 0; 
    }
  }
  
  .particle-nature {
    background: linear-gradient(45deg, #2d5a3f, #4CAF50);
  }
  
  .particle-ember {
    background: linear-gradient(45deg, #FF4500, #FF8C00);
  }
  
  .particle-fire {
    background: linear-gradient(45deg, #FF4500, #FFD700);
    animation: flame 0.5s infinite;
  }
  
  .particle-skull {
    background: #ffffff;
    clip-path: path('M10,30 Q15,0 30,15 Q45,0 50,30 Q25,40 10,30 Z');
  }
  
  .particle-blood {
    background: linear-gradient(45deg, #8B0000, #FF0000);
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  }
  
  @keyframes flame {
    0% { filter: drop-shadow(0 0 10px #ff4500) brightness(1); }
    50% { filter: drop-shadow(0 0 20px #ff8c00) brightness(1.2); }
    100% { filter: drop-shadow(0 0 10px #ff4500) brightness(1); }
  }
  
  /*
    =============================
    Flytande symboler och text
    =============================
    Animerade symboler och text som flyter över skärmen.
  */
  .floating-text, .floating-symbol {
    position: fixed;
    opacity: 0;
    pointer-events: none;
    z-index: 1; /* Säkerställer att texten ligger över andra element */
    animation: floatUp 10s linear infinite;
    color: var(--primary-color, #ff0000);
    font-size: 32px;
    animation-duration: calc(10s * var(--animation-speed-multiplier, 1));
  }
  
  .floating-text .berserk-icon {
    filter: invert(12%) sepia(100%) saturate(6000%) hue-rotate(0deg) brightness(120%) contrast(125%);
    transform: scale(1.2);
  }
  
  @keyframes floatUp {
    0% {
      transform: translateY(100vh) rotate(var(--rotation));
      opacity: 0;
    }
    10% {
      opacity: 0.5;
    }
    90% {
      opacity: 0.5;
    }
    100% {
      transform: translateY(-20vh) rotate(var(--rotation));
      opacity: 0;
    }
  }
  
  .floating-text.greek {
    font-size: 48px;
    font-family: 'Cinzel', serif;
    color: red;
    text-shadow: 0 0 5px rgba(255,0,0,0.5);
    animation: floating-greek 5s linear forwards;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .letter-svg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: -1;
    opacity: 0.5;
  }
  
  @keyframes floating-greek {
    from {
      transform: translateY(120vh) rotate(var(--rotation));
      opacity: var(--opacity, 0.9);
    }
    to {
      transform: translateY(-20vh) rotate(var(--rotation));
      opacity: 0;
    }
  }
  </style>