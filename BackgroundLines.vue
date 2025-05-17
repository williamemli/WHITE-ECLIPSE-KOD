<script setup>
// Importerar komponenten för enskild linje
import PatternLine from './PatternLine.vue';
</script>
<template>
    <!-- Bakgrundscontainer för linjer -->
    <div class="background-lines">
        <!-- Renderar nio linjer med PatternLine-komponenten -->
        <PatternLine v-for="i in 9" :id="i"></PatternLine>
    </div>
</template>

<style scoped>
/*
  Bakgrundscontainer för linjer
  Täcker hela skärmen, placerad längst bak (z-index -1)
  Använder perspektiv och 3D-transformering för djupkänsla
  Radial bakgrundsgradient för subtil effekt
*/
.background-lines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  perspective: 1000px;
  transform-style: preserve-3d;
  background: radial-gradient(circle at center, #000 0%, #1a1a1a 100%);
}
</style>