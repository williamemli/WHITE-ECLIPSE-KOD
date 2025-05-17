// Importerar ref från Vue för reaktivitet
import { ref } from 'vue'

// Importerar ljudfiler direkt från public-mappen
// Varje fil representerar en låt i spellistan
import song1Audio from './../../public/kawakiwoameku.mp3'
import song2Audio from './../../public/kawakiwoameku copy 2.mp3'
import song3Audio from './../../public/kawakiwoameku copy 3.mp3'
import song4Audio from './../../public/kawakiwoameku copy.mp3'

// Definierar en typ för låtobjekt
interface Song {
  title: string // Titel på låten
  artist: string // Artistens namn
  file: string // Sökväg till ljudfilen
  cover: string // Sökväg till omslagsbilden
}

// Spellista med låtar och tillhörande metadata
export const playlist: Song[] = [
  {
    title: "The Berserker",
    artist: "WHITE ECLIPSE",
    file: song1Audio,
    cover: new URL('../assets/images/berserk.png', import.meta.url).href
  },
  {
    title: "The Elden Lord",
    artist: "WHITE ECLIPSE",
    file: song2Audio,
    cover: new URL('../assets/images/ER album.png', import.meta.url).href
  },
  {
    title: "The Persona", 
    artist: "WHITE ECLIPSE",
    file: song3Audio,
    cover: new URL('../assets/images/p3 album.png', import.meta.url).href
  },
  {
    title: "The DMX",
    artist: "WHITE ECLIPSE", 
    file: song4Audio,
    cover: new URL('../assets/images/DMX album.png', import.meta.url).href
  }
]

// Store för musikspelaren med reaktiva tillstånd och metoder
export const playerStore = {
  currentSong: ref(0), // Index för nuvarande låt
  isPlaying: ref(false), // Om spelaren spelar eller är pausad
  userName: ref(localStorage.getItem('profileName') || 'Guest'), // Användarnamn, hämtas från localStorage
  audio: ref<HTMLAudioElement | null>(null), // Referens till Audio-elementet
  volume: ref(50), // Volymkontroll (0-100)

  // Initierar ljudspelaren och sätter eventlyssnare
  init() {
    this.audio.value = new Audio();
    this.audio.value.preload = 'auto';
    this.audio.value.volume = this.volume.value / 100;
    this.audio.value.onerror = (error) => {
      console.error("Audio error:", error);
      this.isPlaying.value = false;
    };
    this.audio.value.onended = () => {
      this.next();
    };
  },

  // Startar uppspelning av nuvarande låt
  play() {
    if (this.audio.value) {
      this.audio.value.src = playlist[this.currentSong.value].file;
      this.audio.value.play()
        .then(() => {
          this.isPlaying.value = true;
          console.log("Playback started");
        })
        .catch(error => {
          console.error("Playback failed:", error);
          this.isPlaying.value = false;
        });
    } else {
      console.error("Audio element is null");
    }
  },

  // Pausar uppspelningen
  pause() {
    this.isPlaying.value = false
    this.audio.value?.pause()
  },

  // Spelar nästa låt i spellistan
  next() {
    this.currentSong.value = (this.currentSong.value + 1) % playlist.length
    if (this.isPlaying.value) {
      this.play();
    }
  },

  // Spelar föregående låt i spellistan
  previous() {
    this.currentSong.value = (this.currentSong.value - 1 + playlist.length) % playlist.length
    if (this.isPlaying.value) {
      this.play();
    }
  },

  // Sätter användarnamn och sparar i localStorage
  setUserName(name: string) {
    this.userName.value = name
    localStorage.setItem('profileName', name)
  },

  // Sätter volymen för spelaren
  setVolume(value: number) {
    this.volume.value = value;
    if (this.audio.value) {
      this.audio.value.volume = value / 100;
    }
  }
}
