<script setup>
// Importera komponenter och hooks
import BackgroundLines from '@/components/BackgroundLines.vue';
import { onMounted, useTemplateRef } from 'vue';

// Referenser till element
const sun = useTemplateRef('sun'); // Solen
const moon = useTemplateRef('moon'); // Månen
const menuText = useTemplateRef('menuText'); // Menytexten
const leftArrow = useTemplateRef('leftArrow'); // Vänsterpil
const rightArrow = useTemplateRef('rightArrow'); // Högerpil

// Färger för varje meny
const colors = [
  '#ffffff', // Hem (vit)
  '#ff0000', // Inställningar (röd)
  '#00a2ff', // Profil (blå)
  '#66ff66'  // Hjälp (grön)
];
// Menyval
const menuItems = ['Play', 'Settings', 'Profile', 'Help'];
let currentIndex = 0; // Nuvarande meny

const menuContainer = useTemplateRef("menu-container") // Behållare för menyn
let isTransitioning = false; // Om en animation pågår

// Skapa partikelbehållare
const particlesContainer = document.createElement('div');
particlesContainer.className = 'particles';

// Gamepad-stöd
let gamepadIndex = null;
const AXIS_THRESHOLD = 0.5; // Tröskel för styrspak
let canMove = true; // Om man kan byta meny

// Länkar för varje meny
const MENU_URLS = {
  'Play': '/Console',
  'Settings': '/settings',
  'Profile': '/profile',
  'Help': '/help'
};

// Skapa partiklar vid menyval
function createParticles(color) {
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.width = Math.random() * 10 + 5 + 'px';
    particle.style.height = particle.style.width;
    particle.style.color = color;
    const angle = (i / 12) * Math.PI * 2;
    const distance = 150;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    particle.style.left = '50%';
    particle.style.top = '50%';
    particle.style.setProperty('--tx', `${x}px`);
    particle.style.setProperty('--ty', `${y}px`);
    particle.style.animation = 'particleFade 1s ease-out forwards';
    particlesContainer.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }
}

// Kolla gamepadens input
function checkGamepad() {
  if (gamepadIndex !== null) {
    const gamepad = navigator.getGamepads()[gamepadIndex];
    if (gamepad) {
      // Vänster/höger på styrspak
      const axisValue = gamepad.axes[0];
      if (Math.abs(axisValue) > AXIS_THRESHOLD && canMove) {
        if (axisValue > AXIS_THRESHOLD) {
          startEclipse(1); // Nästa meny
        } else if (axisValue < -AXIS_THRESHOLD) {
          startEclipse(-1); // Föregående meny
        }
        canMove = false;
        setTimeout(() => { canMove = true; }, 500);
      } else if (Math.abs(axisValue) < 0.1) {
        canMove = true;
      }
      // A-knapp för att välja meny
      if (gamepad.buttons[0].pressed && !isTransitioning) {
        selectMenuItem();
      }
    }
  }
  requestAnimationFrame(checkGamepad);
}

// Skapa stiliserade linjer i bakgrunden
function createStylizedLines() {
  const styleLines = document.createElement('div');
  styleLines.className = 'style-lines';
  for (let i = 0; i < 8; i++) {
    const line = document.createElement('div');
    line.className = 'style-line';
    const rotation = (i * 22.5) - 90;
    line.style.setProperty('--rotation', `${rotation}deg`);
    line.style.top = `${(i * 100 / 8)}%`;
    line.style.transform = `rotate(${rotation}deg)`;
    styleLines.appendChild(line);
  }
  menuContainer.value.appendChild(styleLines);
}

// Uppdatera färg på linjer
function updateStyleLines(color) {
  const lines = document.querySelectorAll('.style-line');
  lines.forEach(line => {
    line.style.color = color;
  });
}

// Byt meny med eclipse-animation
function startEclipse(direction) {
  if (isTransitioning) return;
  isTransitioning = true;
  moon.value.classList.remove('moonAnimRight');
  moon.value.classList.remove('moonAnimLeft');
  moon.value.offsetHeight; // Tvinga omritning
  moon.value.classList.add(direction == 1 ? 'moonAnimRight' : 'moonAnimLeft');
  currentIndex = (currentIndex + direction + colors.length) % colors.length;
  menuText.value.style.transform = 'translate(-50%, -50%) scale(0.8)';
  menuText.value.style.opacity = '0';
  setTimeout(() => {
    menuText.value.innerText = menuItems[currentIndex];
    menuText.value.style.transform = 'translate(-50%, -50%) scale(1)';
    menuText.value.style.opacity = '1';
    const newColor = colors[currentIndex];
    // Uppdatera solens färg
    sun.value.style.backgroundColor = newColor;
    if (newColor === '#ffffff') {
      sun.value.style.boxShadow = `0 0 80px rgba(255,255,255,0.8), 0 0 150px rgba(255,255,255,0.4)`;
    } else {
      sun.value.style.boxShadow = `0 0 80px ${newColor}80, 0 0 150px ${newColor}40`;
    }
    // Uppdatera bakgrundslinjer
    const lines = document.querySelectorAll('.pattern-line');
    lines.forEach(line => {
      const lineElement = line;
      if (newColor === '#ffffff') {
        lineElement.style.background = `linear-gradient(90deg,transparent,rgba(255,255,255,0.3),rgba(255,255,255,0.5),rgba(255,255,255,0.3),transparent)`;
        lineElement.style.boxShadow = `0 0 20px rgba(255,255,255,0.4)`;
      } else {
        lineElement.style.background = `linear-gradient(90deg,transparent,${newColor}80,${newColor},${newColor}80,transparent)`;
        lineElement.style.boxShadow = `0 0 20px ${newColor}80`;
      }
    });
    // Uppdatera geometrisk form
    const shape = document.querySelector('.geometric-shape');
    if (shape) {
      if (newColor === '#ffffff') {
        shape.style.borderColor = 'rgba(255,255,255,0.2)';
      } else {
        shape.style.borderColor = `${newColor}20`;
      }
    }
    isTransitioning = false;
  }, 2000);
}

// Välj meny och navigera
function selectMenuItem() {
  const currentItem = menuItems[currentIndex];
  // Effekt när man väljer
  sun.value.style.transform = 'scale(1.2)';
  menuText.value.style.transform = 'translate(-50%, -50%) scale(1.2)';
  menuText.value.style.textShadow = '0 0 20px currentColor';
  createParticles(colors[currentIndex]); // Skapa partiklar
  // Flash-effekt
  const flash = document.createElement('div');
  flash.style.position = 'fixed';
  flash.style.top = '0';
  flash.style.left = '0';
  flash.style.right = '0';
  flash.style.bottom = '0';
  flash.style.backgroundColor = 'white';
  flash.style.opacity = '0';
  flash.style.transition = 'opacity 0.3s ease';
  flash.style.pointerEvents = 'none';
  flash.style.zIndex = '1000';
  document.body.appendChild(flash);
  requestAnimationFrame(() => {
    flash.style.opacity = '0.3';
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => {
        flash.remove();
        // Navigera till rätt sida
        const url = MENU_URLS[currentItem];
        if (url) {
          window.location.href = url;
        }
      }, 300);
    }, 100);
  });
}

// När komponenten är monterad
onMounted(() => {
  // Lyssna på gamepad
  window.addEventListener("gamepadconnected", (e) => {
    gamepadIndex = e.gamepad.index;
  });
  window.addEventListener("gamepaddisconnected", () => {
    gamepadIndex = null;
  });
  menuContainer.value.appendChild(particlesContainer); // Lägg till partiklar
  checkGamepad(); // Starta gamepad-koll
  leftArrow.value.addEventListener('click', () => {
    startEclipse(-1); // Vänster
  });
  rightArrow.value.addEventListener('click', () => {
    startEclipse(1); // Höger
  });
  createStylizedLines(); // Skapa linjer
  updateStyleLines(colors[currentIndex]); // Sätt färg
  // Tangentbordsstöd
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      startEclipse(-1);
    } else if (e.key === 'ArrowRight') {
      startEclipse(1);
    } else if (e.key === 'Enter' && !isTransitioning) {
      selectMenuItem();
    }
  });
  // Klick på menytext
  menuText.value.addEventListener('click', () => {
    if (!isTransitioning) {
      selectMenuItem();
    }
  });
  // Initiera startvärden när sidan laddas
  window.addEventListener('DOMContentLoaded', () => {
    menuText.value.innerText = menuItems[currentIndex];
    menuText.value.style.opacity = '1';
    const initialColor = colors[currentIndex];
    sun.value.style.backgroundColor = initialColor;
    sun.value.style.boxShadow = `0 0 80px ${initialColor}80, 0 0 150px ${initialColor}40`;
    const lines = document.querySelectorAll('.pattern-line');
    lines.forEach(line => {
      line.style.background = `linear-gradient(90deg,transparent,${initialColor}80,${initialColor},${initialColor}80,transparent)`;
      line.style.boxShadow = `0 0 20px ${initialColor}80`;
    });
    const shape = document.querySelector('.geometric-shape');
    if (shape) {
      shape.style.borderColor = `${initialColor}20`;
    }
  });
});
</script>

<template>
  <!-- Bakgrundslinjer -->
  <BackgroundLines/>
  <div class="menu-container-centering">
    <div class="menu-container" ref="menu-container">
      <div class="eclipse-container">
        <div class="sun" ref="sun">
          <div class="moon" ref="moon"></div>
        </div>
        <div class="menu-text" ref="menuText">Home</div>
      </div>
      <!-- Vänster och höger pil -->
      <button class="arrow left-arrow" ref="leftArrow" aria-label="Föregående meny">&#10094;</button>
      <button class="arrow right-arrow" ref="rightArrow" aria-label="Nästa meny">&#10095;</button>
    </div>
  </div>
</template>
<style scoped>
body {
  margin: 0;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  /* Space background */
}

.menu-container-centering {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.menu-container {
  position: relative;
  width: 400px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.eclipse-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sun {
  width: 300px;
  height: 300px;
  background-color: #ffcc00;
  position: relative;
  border-radius: 50%;
  box-shadow: 0 0 80px rgba(255, 204, 0, 0.8), 0 0 150px rgba(255, 204, 0, 0.6);
  transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  animation: sunPulse 4s infinite;
  transform: scale(1);
}

@keyframes sunPulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

.sun {
  transition: background-color 0.8s ease, box-shadow 0.8s ease;
}

.moon {
  width: 299px;
  height: 299px;
  background-color: #000;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 1;
  /* Visible initially */
  animation: none;
}
.moonAnimRight {
  animation: moonAnimation 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.moonAnimLeft {
  animation: moonReverseAnimation 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.menu-text {
  margin-top: 20px;
  font-size: 24px;
  color: #fff;
  font-family: Arial, sans-serif;
  transition: all 0.5s;
  opacity: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  text-shadow: 0 0 10px currentColor;
  letter-spacing: 2px;
}

.menu-text.active {
  animation: textPulse 0.5s ease-out;
}

@keyframes textPulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.8;
  }

  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

@keyframes moonAnimation {
  0% {
    left: 50%;
    opacity: 1;
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
  }

  30% {
    left: 200%;
    opacity: 1;
    transform: translate(-50%, -50%) rotate(360deg) scale(0.8);
  }

  31% {
    opacity: 0;
  }

  50% {
    left: -50%;
    opacity: 0;
    transform: translate(-50%, -50%) rotate(0deg) scale(0.8);
  }

  100% {
    left: 50%;
    opacity: 1;
    transform: translate(-50%, -50%) rotate(360deg) scale(1);
  }
}

@keyframes moonReverseAnimation {
  0% {
    left: 50%;
    opacity: 1;
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
  }

  30% {
    left: -50%;
    opacity: 1;
    transform: translate(-50%, -50%) rotate(-360deg) scale(0.8);
  }

  31% {
    opacity: 0;
  }

  50% {
    left: 200%;
    opacity: 0;
    transform: translate(-50%, -50%) rotate(0deg) scale(0.8);
  }

  100% {
    left: 50%;
    opacity: 1;
    transform: translate(-50%, -50%) rotate(-360deg) scale(1);
  }
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: transparent;
  border: none;
  font-size: 30px;
  cursor: pointer;
  color: aliceblue;
  transition: all 0.3s;
  text-shadow: 0 0 10px currentColor;
}

.arrow:hover {
  transform: translateY(-50%) scale(1.2);
  text-shadow: 0 0 20px currentColor;
}

.left-arrow {
  left: -50px;
}

.right-arrow {
  right: -50px;
}

/* Add these new effects */
.menu-container.transitioning {
  animation: containerShake 0.5s ease-out;
}

.sun.transitioning {
  animation: sunTransition 0.5s ease-out;
}

@keyframes containerShake {
  0% {
    transform: rotate(0deg) scale(1);
  }

  25% {
    transform: rotate(-2deg) scale(1.02);
  }

  75% {
    transform: rotate(2deg) scale(1.02);
  }

  100% {
    transform: rotate(0deg) scale(1);
  }
}

@keyframes sunTransition {
  0% {
    filter: brightness(1) contrast(1);
  }

  50% {
    filter: brightness(1.5) contrast(1.2);
  }

  100% {
    filter: brightness(1) contrast(1);
  }
}

/* Add particle effects container */
.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: currentColor;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
}

@keyframes particleFade {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }

  100% {
    transform: translate(var(--tx), var(--ty)) scale(0);
    opacity: 0;
  }
}

/* Add these new Persona-style effects */
.menu-text {
  /* Update existing styles */
  font-family: 'Arial', sans-serif;
  text-transform: uppercase;
  font-weight: bold;
  white-space: nowrap;
  animation: textFloat 3s ease-in-out infinite;
}

@keyframes textFloat {

  0%,
  100% {
    transform: translate(-50%, -50%) translateY(0);
  }

  50% {
    transform: translate(-50%, -50%) translateY(-10px);
  }
}

.menu-text::before {
  content: attr(data-text);
  position: absolute;
  left: 2px;
  text-shadow: -1px 0 #ff0066;
  top: 0;
  color: currentColor;
  overflow: hidden;
  clip-path: inset(0 0 0 0);
  animation: glitch-anim 2s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
  0% {
    clip-path: inset(40% 0 61% 0);
  }

  20% {
    clip-path: inset(92% 0 1% 0);
  }

  40% {
    clip-path: inset(43% 0 1% 0);
  }

  60% {
    clip-path: inset(25% 0 58% 0);
  }

  80% {
    clip-path: inset(54% 0 7% 0);
  }

  100% {
    clip-path: inset(58% 0 43% 0);
  }
}

/* Add stylish line effects */
.style-lines {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.style-line {
  position: absolute;
  background: currentColor;
  opacity: 0.3;
  transform-origin: center;
}

/* Add ripple effect */
.ripple {
  position: absolute;
  border: 2px solid currentColor;
  border-radius: 50%;
  animation: rippleEffect 1s linear infinite;
  opacity: 0;
}

@keyframes rippleEffect {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Enhanced particle effects */
.particle {
  background: linear-gradient(to right, currentColor, transparent);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  transform-origin: center;
}



.geometric-shape {
  position: absolute;
  border: 2px solid rgba(255, 255, 255, 0.1);
  animation: shapeFloat 15s linear infinite;
  opacity: 0.2;
}

@keyframes shapeFloat {
  0% {
    transform: rotate(0deg) scale(1);
  }

  50% {
    transform: rotate(180deg) scale(1.5);
  }

  100% {
    transform: rotate(360deg) scale(1);
  }
}

.pattern-circle {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: circleExpand 10s ease-in-out infinite;
}

@keyframes circleExpand {
  0% {
    transform: scale(0);
    opacity: 0.5;
  }

  50% {
    opacity: 0.2;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>

