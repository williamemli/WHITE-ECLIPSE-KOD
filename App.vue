<script setup lang="ts">
// Importerar PlayerWidget-komponenten för musikspelaren
import PlayerWidget from './components/PlayerWidget.vue'
// Importerar livscykel-funktioner från Vue
import { onMounted, onBeforeUnmount } from 'vue'
// Importerar stores för spelare och inställningar
import { playerStore } from './stores/playerStore'
import { settingsStore } from './stores/settingsStore'

// Körs när appen mountas (startas)
onMounted(() => {
  playerStore.init(); // Initierar ljudspelaren
  playerStore.play(); // Startar uppspelning direkt
  settingsStore.initializeSettings(); // Applicerar inställningar vid appstart
})

// Körs precis innan appen avmonteras (stängs)
onBeforeUnmount(() => {
  if (playerStore.audio.value) {
    playerStore.audio.value.pause(); // Pausar ljudet
    playerStore.audio.value = null;  // Rensar referensen
  }
})
</script>

<template>
  <main>
    <!-- Musikspelare-widget synlig överallt -->
    <PlayerWidget />
    <!-- Visar aktuell vy beroende på router -->
    <router-view></router-view>
  </main>
</template>

<style>
body {
  margin: 0;
}
main {
  position: fixed;
  inset: 0;
}
/* Lägg till globala stilar här */
</style>
