import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BASE_URL, {
  transports: ["websocket"],
  reconnection: true,
  timeout: 5000,
});

export default socket;