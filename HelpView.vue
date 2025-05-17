<template>
 
  <div class="help-menu-container">
    <div class="eclipse-background"></div>
    <div class="moon-overlay"></div>
   
    <div class="help-title">Help Menu</div>
   
    <div class="how-to-use">
      <div class="section-title">How to Use</div>
      <div class="section-content">
        <p>To use this console, select a game category from the main menu, then choose the game you want to play.</p>
        <p>Use the directional keys to navigate, and press Enter to confirm your selection.</p>
      </div>
    </div>
   
    <div class="contact-support">
      <div class="section-title">Contact Support</div>
      <div class="section-content">
        <p>If you need help, feel free to reach out:</p>
        <p class="contact-info">Email: support@eclipseconsole.com</p>
        <p class="contact-info">Phone: +1 (555) 123-4567</p>
      </div>
    </div>
   
   
    <button class="back-button" tabindex="0">Back</button>
  </div>
  </template>
   
   
  <script setup>
      // Körs när DOM laddats
      document.addEventListener('DOMContentLoaded', () => {
          const backButton = document.querySelector('.back-button');
         
          // Autofokusera tillbaka-knappen vid sidladdning
          backButton.focus();
   
          // Variabler för gamepad
          let gamepadIndex = null;
          let prevAButtonPressed = false;
         
          // Lyssna på anslutning av gamepad
          window.addEventListener('gamepadconnected', (e) => {
              console.log('Gamepad connected:', e.gamepad);
              gamepadIndex = e.gamepad.index;
          });
   
          // Lyssna på frånkoppling av gamepad
          window.addEventListener('gamepaddisconnected', () => {
              console.log('Gamepad disconnected');
              gamepadIndex = null;
          });
   
          // Pollar gamepadens tillstånd för att upptäcka knapptryck
          function pollGamepad() {
              if (gamepadIndex !== null) {
                  const gamepad = navigator.getGamepads()[gamepadIndex];
                  if (gamepad && gamepad.buttons[0]) { // 0 är oftast A-knappen
                      const aPressed = gamepad.buttons[0].pressed;
                      if (aPressed && !prevAButtonPressed) {
                          // Om A trycks ned, klicka på tillbaka-knappen
                          backButton.click();
                      }
                      prevAButtonPressed = aPressed;
                  }
              }
              requestAnimationFrame(pollGamepad);
          }
          pollGamepad();
        
          // Hantera klick på tillbaka-knappen
          backButton.addEventListener('click', () => {
              window.location.href = '/';
          });
      });
  </script>
   
  <style scoped>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
   
  body {
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    background: #000;
    overflow: hidden;
    font-family: 'Arial', sans-serif;
    color: #fff;
  }
   
  /* Behållare för hjälpmenyn */
  .help-menu-container {
    position: relative;
    width: 85%;
    max-width: 100%;
    height: auto;
    min-height: 80vh;
    padding: 15px;
    margin: 12vh auto;
    background: rgba(0, 0, 0, 0.95);
    border: 2px solid #2be23a;
    clip-path: polygon(
      0 15px, 15px 0,
      calc(100% - 15px) 0, 100% 15px,
      100% calc(100% - 15px), calc(100% - 15px) 100%,
      15px 100%, 0 calc(100% - 15px)
    );
    box-shadow: 0 0 30px rgba(43, 226, 58, 0.3);
  }
   
  /* Eclipse-bakgrundseffekt */
  .eclipse-background {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, #00ff55, #00ff62, #000);
    box-shadow: 0 0 60px #00ff40, 0 0 100px #00ff22;
    z-index: -1;
    opacity: 0.6;
  }
   
  /* Mån-overlay för att skapa eclipse-effekt */
  .moon-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 295px;
    height: 295px;
    background-color: #000;
    border-radius: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
    z-index: -1;
  }
   
  /* Titel för hjälpmenyn */
  .help-title {
    font-size: 36px;
    font-weight: bold;
    margin-top: 40px;
    margin-bottom: 20px;
    color: #fff;
    text-shadow: 0 0 10px #2be23a;
    transform: skew(-5deg);
    letter-spacing: 2px;
  }
   
  /* Instruktionssektioner */
  .how-to-use,
  .contact-support {
    background: rgba(43, 226, 58, 0.1);
    padding: 15px;
    margin: 15px 0;
    position: relative;
    clip-path: polygon(
      0 10px, 10px 0,
      calc(100% - 10px) 0, 100% 10px,
      100% calc(100% - 10px), calc(100% - 10px) 100%,
      10px 100%, 0 calc(100% - 10px)
    );
    border: 1px solid rgba(43, 226, 58, 0.3);
  }
   
  /* Extra marginal för första sektionen */
  .how-to-use {
    margin-top: 40px;
  }
   
  /* Extra marginal för kontaktsektionen */
  .contact-support {
    margin-top: 30px;
  }
   
  /* Titel för sektioner */
  .section-title {
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #2be23a;
    transform: skew(-5deg);
    letter-spacing: 1px;
  }
   
  /* Innehåll i sektioner */
  .section-content {
    font-size: 14px;
    line-height: 1.4;
    color: #fff;
  }
   
  /* Kontaktinformation */
  .contact-info {
    font-weight: bold;
    color: #2be23a;
    margin: 10px 0;
    transform: skew(-5deg);
    letter-spacing: 1px;
  }
   
  /* Hover-effekter för sektioner */
  .how-to-use:hover,
  .contact-support:hover {
    background: rgba(43, 226, 58, 0.15);
    transition: all 0.3s ease;
  }
   
  /* Stilar för tillbaka-knappen */
  .back-button {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 30px;
    background: rgba(43, 226, 58, 0.15);
    border: 2px solid #2be23a;
    color: #2be23a;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    clip-path: polygon(
      0 15px, 15px 0,
      calc(100% - 15px) 0, 100% 15px,
      100% calc(100% - 15px), calc(100% - 15px) 100%,
      15px 100%, 0 calc(100% - 15px)
    );
    text-transform: uppercase;
    letter-spacing: 2px;
    transition: all 0.3s ease;
  }
   
  /* Hover, fokus och vald stil för tillbaka-knappen */
  .back-button:hover,
  .back-button:focus,
  .back-button.selected {
    background: rgba(43, 226, 58, 0.3);
    outline: none;
    transform: translateX(-50%) scale(1.1);
    letter-spacing: 4px;
    text-shadow: 0 0 10px rgba(43, 226, 58, 0.7);
    border-color: rgba(43, 226, 58, 0.8);
    animation: pulsate 1.5s ease-in-out infinite;
  }
   
  /* Animation för pulserande effekt på knapp */
  @keyframes pulsate {
    0% {
      box-shadow:
        0 0 20px rgba(43, 226, 58, 0.4),
        0 0 40px rgba(43, 226, 58, 0.2);
    }
    50% {
      box-shadow:
        0 0 25px rgba(43, 226, 58, 0.6),
        0 0 50px rgba(43, 226, 58, 0.4);
    }
    100% {
      box-shadow:
        0 0 20px rgba(43, 226, 58, 0.4),
        0 0 40px rgba(43, 226, 58, 0.2);
    }
  }
   
  /* Stil för knapp-prompt (t.ex. gamepad) */
  .button-prompt {
    position: absolute;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(43, 226, 58, 0.7);
    font-size: 12px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  </style>