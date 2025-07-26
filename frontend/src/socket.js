import { io } from "socket.io-client";

const socket = io("https://syncro-crhm.onrender.com", {
    withCredentials: true,
    transports: ["websocket", "polling"], // Add polling as fallback
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
});

// Add connection event listeners for debugging
socket.on("connect", () => {
    console.log("Connected to server");
});

socket.on("disconnect", (reason) => {
    console.log(" Disconnected from server");
});

socket.on("connect_error", (error) => {
    console.error(" Connection error:", error.message);
});

export default socket;