<script setup lang="ts">
// Importerar PlayerWidget-komponenten för musikspelaren
import PlayerWidget from './components/PlayerWidget.vue'
// Importerar livscykel-funktioner från Vue
import { onMounted, onBeforeUnmount, ref } from 'vue'
// Importerar stores för spelare och inställningar
import { playerStore } from './stores/playerStore'
import { settingsStore } from './stores/settingsStore'

// State to control boot video visibility, only show if not already played this session
const showBootVideo = ref(sessionStorage.getItem('bootPlayed') !== 'true')

function handleBootVideoEnd() {
  showBootVideo.value = false
  sessionStorage.setItem('bootPlayed', 'true')
}

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
    <!-- Boot video overlay -->
    <div v-if="showBootVideo" class="boot-video-overlay">
      <video
        src="/boot.mp4"  
        autoplay
        muted
        @ended="handleBootVideoEnd"
        class="boot-video"
      ></video>
    </div>
    <!-- Main app content -->
    <div v-else>
      <PlayerWidget />
      <router-view></router-view>
    </div>
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
.boot-video-overlay {
  position: fixed;
  inset: 0;
  background: black;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.boot-video {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
}
/* Lägg till globala stilar här */
</style>
