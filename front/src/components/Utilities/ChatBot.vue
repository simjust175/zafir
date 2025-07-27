<template>
  <v-card
    class="pa-4 glass-card"
    height="100%"
    elevation="10"
    rounded="xl"
  >
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="text-h6 font-weight-bold text-neon">
        🤖 AI Assistant
      </div>
      <v-icon
        class="text-grey-lighten-1"
        style="cursor: pointer"
        @click="$emit('close')"
      >
        mdi-close
      </v-icon>
    </v-card-title>
  
    <v-divider class="mb-2" />
  
    <v-card-text class="chat-log">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="msg.sender === 'You' ? 'user-msg' : 'bot-msg'"
      >
        <span class="sender">{{ msg.sender }}:</span>
        <span class="text">{{ msg.text }}</span>
      </div>
    </v-card-text>
  
    <v-divider class="my-2" />
  
    <v-card-actions class="pa-0">
      <v-text-field
        v-model="input"
        label="Type your question..."
        class="flex-grow-1 rounded-pill input-glass"
        hide-details
        density="compact"
        variant="solo"
        color="primary"
        @keydown.enter="send"
      />
      <v-btn
        icon
        color="cyan-lighten-1"
        variant="flat"
        class="ml-2"
        @click="send"
      >
        <v-icon>mdi-send</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
  
  <script setup>
  import { ref } from 'vue';
  
  defineEmits(['close'])
  const input = ref('');
  const messages = ref([
    { sender: 'Bot', text: 'Hello! How can I help you with invoices or data today?' }
  ]);
  
  const send = () => {
    if (!input.value.trim()) return;
    messages.value.push({ sender: 'You', text: input.value });
    messages.value.push({
      sender: 'Bot',
      text: `Searching for "${input.value}"... (demo)`
    });
    input.value = '';
  };
  </script>
  
  <style scoped>
  .glass-card {
    background: rgba(30, 30, 30, 0.8);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .text-neon {
    color: #00ffe1;
    text-shadow: 0 0 5px #00ffe1aa;
  }
  
  .chat-log {
    max-height: 350px;
    overflow-y: auto;
    font-family: 'Segoe UI', Roboto, sans-serif;
    font-size: 0.9rem;
    padding-right: 4px;
  }
  
  .bot-msg {
    background: rgba(255, 255, 255, 0.05);
    border-left: 3px solid #00ffe1;
    margin-bottom: 10px;
    padding: 8px 12px;
    border-radius: 10px;
    color: #e0e0e0;
  }
  
  .user-msg {
    background: rgba(0, 255, 225, 0.1);
    border-left: 3px solid #00ffe1;
    margin-bottom: 10px;
    padding: 8px 12px;
    border-radius: 10px;
    color: #ffffff;
    text-align: right;
  }
  
  .sender {
    display: block;
    font-weight: 600;
    margin-bottom: 4px;
    font-size: 0.8rem;
    color: #aaa;
  }
  
  .input-glass input {
    background: rgba(255, 255, 255, 0.05) !important;
    color: white;
  }
  </style>