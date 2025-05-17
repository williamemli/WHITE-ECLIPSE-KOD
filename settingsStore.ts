// Importerar ref från Vue för reaktivitet
import { ref } from 'vue'
// Importerar playerStore för att kunna styra volym m.m.
import { playerStore } from './playerStore'

// Definierar typ för inställningar
interface Settings {
  graphicsQuality: number; // Ljusstyrka/grafikkvalitet
  soundVolume: number;    // Ljudvolym
  screenFilter: string;   // Skärmfilter (t.ex. sepia, blur)
  darkMode: boolean;      // Mörkt läge på/av
}

// Standardinställningar som används om inga sparade finns
const defaultSettings: Settings = {
  graphicsQuality: 3,
  soundVolume: 50,
  screenFilter: 'none',
  darkMode: false
}

// Funktion för att ladda sparade inställningar från localStorage
const loadSettings = (): Settings => {
  const saved = localStorage.getItem('appSettings')
  if (saved) {
    const parsedSettings = JSON.parse(saved)
    // Slår ihop sparade inställningar med standardvärden
    return {
      ...defaultSettings,
      ...parsedSettings
    }
  }
  return defaultSettings
}

// Store för applikationsinställningar
export const settingsStore = {
  settings: ref<Settings>(loadSettings()), // Reaktivt objekt med alla inställningar

  // Sparar nuvarande inställningar till localStorage
  saveSettings() {
    localStorage.setItem('appSettings', JSON.stringify(this.settings.value))
  },

  // Uppdaterar en enskild inställning och applicerar den direkt
  updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    this.settings.value[key] = value
    this.saveSettings()
    this.applySettings(key)
  },

  // Applicerar inställningar till UI och system (t.ex. filter, färger, volym)
  applySettings(specific?: keyof Settings) {
    if (!specific || specific === 'graphicsQuality') {
      // Sätter ljusstyrka baserat på graphicsQuality
      document.body.style.filter = `brightness(${(this.settings.value.graphicsQuality / 3) * 100}%)`;
    }
    if (!specific || specific === 'soundVolume') {
      // Sätter volymen i playerStore
      playerStore.setVolume(this.settings.value.soundVolume);
    }
    if (!specific || specific === 'darkMode') {
      // Växlar mellan mörkt och ljust läge genom att ändra CSS-variabler
      const root = document.documentElement;
      if (this.settings.value.darkMode) {
        root.style.setProperty('--background-color', '#000000');
        root.style.setProperty('--text-color', '#ffffff');
        root.style.setProperty('--primary-color', '#8B0000');
      } else {
        root.style.setProperty('--background-color', '#ffffff');
        root.style.setProperty('--text-color', '#000000');
        root.style.setProperty('--primary-color', '#ff4500');
      }
    }
    if (!specific || specific === 'screenFilter') {
      // Applicerar valt skärmfilter
      const filters = {
        'none': '',
        'sepia': 'sepia(0.8)',
        'blur': 'blur(1px)',
        'contrast': 'contrast(1.2)',
        'invert': 'invert(0.8)'
      };
      const currentFilter = this.settings.value.screenFilter as keyof typeof filters;
      if (currentFilter === 'none') {
        document.body.style.filter = 'none';
      } else {
        document.body.style.filter = filters[currentFilter];
      }
    }
  },

  // Anropas vid appstart för att applicera alla inställningar
  initializeSettings() {
    this.applySettings();
  }
}
