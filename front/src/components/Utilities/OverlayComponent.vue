<template>
  <v-app>
    <v-overlay
      :model-value="overlayTrigger"
      class="align-center justify-center"
      absolute
      persistent
    >
      <div class="loader-container">
        <div class="dot dot-1" />
        <div class="dot dot-2" />
        <div class="dot dot-3" />
      </div>
  
      <!-- SVG filter definition -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        style="position: absolute; width: 0; height: 0;"
      >
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -7"
            />
          </filter>
        </defs>
      </svg>
    </v-overlay>
  </v-app>
</template>
  
  <script>
  export default {
    props: {
      overlayTrigger: Boolean
    }
  }
  </script>
  
  <style scoped>
  .loader-container {
    width: 200px;
    height: 200px;
    position: relative;
    filter: url('#goo');
    animation: rotate-move 2s ease-in-out infinite;
    z-index: 10;
  }
  
  .dot { 
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background-color: #000;
    position: absolute;
    margin: auto;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
  
  .dot-3 {
    background-color: #3788bf;
    animation: dot-3-move 2s ease infinite, index 3s ease infinite;
  }
  
  .dot-2 {
    background-color: #18578c;
    animation: dot-2-move 2s ease infinite, index 3s -3s ease infinite;
  }
  
  .dot-1 {
    background-color: #86CBFFFF;
    animation: dot-1-move 2s ease infinite, index 3s -2s ease infinite;
  }
  
  @keyframes dot-3-move {
    20% {transform: scale(1);}
    45% {transform: translateY(-18px) scale(.45);}
    60% {transform: translateY(-90px) scale(.45);}
    80% {transform: translateY(-90px) scale(.45);}
    100% {transform: translateY(0px) scale(1);}
  }
  
  @keyframes dot-2-move {
    20% {transform: scale(1);}
    45% {transform: translate(-16px, 12px) scale(.45);}
    60% {transform: translate(-80px, 60px) scale(.45);}
    80% {transform: translate(-80px, 60px) scale(.45);}
    100% {transform: translateY(0px) scale(1);}
  }
  
  @keyframes dot-1-move {
    20% {transform: scale(1);}
    45% {transform: translate(16px, 12px) scale(.45);}
    60% {transform: translate(80px, 60px) scale(.45);}
    80% {transform: translate(80px, 60px) scale(.45);}
    100% {transform: translateY(0px) scale(1);}
  }
  
  @keyframes rotate-move {
    55% {transform: rotate(0deg);}
    80% {transform: rotate(360deg);}
    100% {transform: rotate(360deg);}
  }
  
  @keyframes index {
    0%, 100% {z-index: 3;}
    33.3% {z-index: 2;}
    66.6% {z-index: 1;}
  }
  </style>