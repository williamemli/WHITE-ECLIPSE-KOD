// Importerar nödvändiga funktioner från vue-router
import { createRouter, createWebHistory } from 'vue-router';
// Importerar vy-komponenter för varje rutt
import HomeScreenView from '@/views/HomeScreenView.vue';
import SettingsView from '@/views/SettingsView.vue';
import ProfileView from '@/views/ProfileView.vue';
import ConsoleView from '@/views/ConsoleView.vue';
import GamesView from '@/views/GamesView.vue';

// Definierar alla rutter i applikationen
const routes = [
  { path: '/', name: 'Home', component: HomeScreenView },
  { path: '/settings', name: 'Settings', component: SettingsView },
  { path: '/profile', name: 'Profile', component: ProfileView },
  { path: '/consoles', name: 'Consoles', component: ConsoleView },
  { path: '/games', name: 'Games', component: GamesView },
];

// Skapar router-instansen med historikläge och rutter
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Exporterar router-instansen för användning i appen
export default router;