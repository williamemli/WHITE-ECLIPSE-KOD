<script setup lang="ts">
// Importerar playerStore och spellistan för att visa och styra musikspelaren
import { playerStore, playlist } from '../stores/playerStore'
</script>

<template>
  <!-- Huvudcontainer för spelaren -->
  <div class="player-widget">
    <!-- Visar användarnamn -->
    <div class="profile-info">
      <span class="username">{{ playerStore.userName }}</span>
    </div>
    
    <!-- Spelarkontroller och låtinfo -->
    <div class="player-controls">
      <div class="song-info">
        <!-- Omslagsbild för aktuell låt -->
        <img 
          :src="playlist[playerStore.currentSong.value].cover" 
          :alt="playlist[playerStore.currentSong.value].title"
          class="cover-image"
        />
        <div class="text-info">
          <!-- Visar låttitel och artist -->
          <div class="song-title">{{ playlist[playerStore.currentSong.value].title }}</div>
          <div class="artist">{{ playlist[playerStore.currentSong.value].artist }}</div>
        </div>
      </div>
      
      <!-- Kontrollknappar för föregående, spela/pausa och nästa -->
      <div class="controls">
        <button @click="playerStore.previous">⏮</button>
        <button @click="playerStore.isPlaying ? playerStore.pause() : playerStore.play()">
          {{ playerStore.isPlaying ? '⏸' : '▶' }}
        </button>
        <button @click="playerStore.next">⏭</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
  Stil för huvudcontainern till spelaren
  Fäst i övre vänstra hörnet, halvtransparent bakgrund
*/
.player-widget {
  position: fixed;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px;
  color: white;
  z-index: 1000;
  width: 180px;
  font-size: 0.9em;
}

/*
  Profilsektion med användarnamn
*/
.profile-info {
  margin-bottom: 5px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/*
  Flexbox för låtinfo och omslagsbild
*/
.song-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

/*
  Stil för omslagsbilden
*/
.cover-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.text-info {
  overflow: hidden;
}

/*
  Stil för låttitel
  Visar bara en rad, klipper om för lång
*/
.song-title {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/*
  Stil för artistnamn
*/
.artist {
  font-size: 0.8em;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/*
  Flexbox för kontrollknappar
*/
.controls {
  display: flex;
  justify-content: center;
  gap: 8px;
}

/*
  Stil för kontrollknappar
*/
.controls button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  font-size: 1em;
}

.controls button:hover {
  opacity: 0.8;
}
</style>
