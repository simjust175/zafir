import { io } from "socket.io-client";

const baseUrl = import.meta.env.VITE_BASE_URL;

const socket = io(baseUrl || 'http://localhost:3001', {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 3,
  reconnectionDelay: 5000,
  timeout: 5000,
  autoConnect: Boolean(baseUrl),
});

socket.on('connect_error', () => {
  console.debug('Socket: Backend not available, will retry silently')
})

export default socket;
