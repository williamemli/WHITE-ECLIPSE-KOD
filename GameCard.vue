<template>
  <!-- Kortkomponent för spel, klickbar -->
  <div class="game-card" :class="{ selected }" @click="$emit('click')">
    <div class="game-card-content">
      <!-- Sektion för speltitel -->
      <div class="game-card-title-section">
        <div class="game-card-label">Title</div>
        <div class="game-card-title">{{ title }}</div>
      </div>
      <!-- Sektion för konsoltyp -->
      <div class="game-card-console-section">
        <div class="game-card-label">Console</div>
        <div class="game-card-console">PC</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Definierar props för titel och om kortet är markerat
defineProps<{ title: string; selected?: boolean }>();
</script>

<style scoped>
/*
  Huvudstil för spelkortet
  Sätter storlek, bakgrund, rundade hörn och skugga
  Kortet växer och får ljusare skugga när det är markerat
*/
.game-card {
  width: 260px;
  height: 350px; 
  margin: 0 20px 40px 20px; 
  background: #181a20;
  border-radius: 16px;
  color: white;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-size: 1.2rem;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  box-shadow: 0 4px 18px rgba(0,0,0,0.45);
  border: 1.5px solid #23272f;
  padding-bottom: 18px;
  position: relative;
}
.game-card.selected {
  /* Markerat kort får större skala och ljusare skugga */
  transform: scale(1.1);
  box-shadow: 0 6px 28px rgba(255,255,255,0.6);
  border-color: #ffffff;
}
/*
  Innehållscontainer för kortet
  Flexbox för att placera titel och konsol bredvid varandra
  Bakgrund med lätt transparens och rundade hörn
*/
.game-card-content {
  width: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background: rgba(30,32,40,0.92);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  padding: 32px 20px; 
  gap: 24px;
}
/*
  Sektioner för titel och konsol
  Staplar innehållet vertikalt
*/
.game-card-title-section, .game-card-console-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}
/*
  Etikett för sektion (t.ex. "Title", "Console")
*/
.game-card-label {
  font-size: 0.85rem;
  color: #fff;
  font-weight: 600;
  margin-bottom: 6px;
  letter-spacing: 1px;
  text-transform: uppercase;
}
/*
  Stil för speltitel
  Bryter ord om det är för långt
*/
.game-card-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  word-break: break-all;
  max-width: 120px;
}
/*
  Stil för konsoltext
*/
.game-card-console {
  font-size: 1.05rem;
  font-weight: 500;
  color: #bbb;
}
</style>
