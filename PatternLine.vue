<script setup>
// Importerar defineProps för att ta emot props från föräldrakomponenten
import { defineProps } from 'vue';  
// Definierar prop "id" som används för att placera och animera linjen
const props = defineProps({
    id: Number
})
// Beräknar toppositionen för linjen baserat på id
const styleTop = (props.id * 100 / 8) + "%"
// Beräknar fördröjning för animationen så att linjerna startar vid olika tidpunkter
const animationDelay = (props.id * -0.5) + "s"
</script>
<template>
<!-- Enskild linje i bakgrundsmönstret, position och animation styrs av props -->
<div class="pattern-line" :style="
    'top: ' + styleTop + '; animation-delay: ' + animationDelay + ';'
">
</div>
</template>
<style scoped>
/*
  Stil för en linje i bakgrundsmönstret
  Absolut positionerad, sträcker sig över hela bredden
  Färg och transparens sätts med gradient och box-shadow
  Animeras med keyframes för att rotera och skapa rörelse
*/
.pattern-line {
  position: absolute;
  width: 200%;
  height: 2px;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 0, 85, 0.5),
      rgba(255, 0, 85, 0.8),
      rgba(255, 0, 85, 0.5),
      transparent);
  transform-origin: center;
  animation: patternRotate 20s linear infinite;
  box-shadow: 0 0 20px rgba(255, 0, 85, 0.5);
  opacity: 0.3;
}

/*
  Keyframes för att rotera och tona ut linjen över tid
*/
@keyframes patternRotate {
  0% {
    transform: rotate(0deg) translateY(-50%) scale(0.5);
    opacity: 0;
  }

  10% {
    opacity: 0.3;
  }

  90% {
    opacity: 0.3;
  }

  100% {
    transform: rotate(360deg) translateY(-50%) scale(1.5);
    opacity: 0;
  }
}
</style>