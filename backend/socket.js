import { Server } from "socket.io";

const connectedUsers = new Map();

export function setupSocket(server) {
    const io = new Server(server, {
        path: "/socket.io",
        cors: {
            origin: [
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:4173",
                'https://syncro-delta.vercel.app'
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        },
    });

    io.on("connection", (socket) => {
        // console.log(" User connected:", socket.id);

        socket.on("register", (userId) => {
            if (!userId) {
                // console.log(" Registration failed: No userId provided");
                return;
            }

            // console.log(`User ${userId} registered to socket ${socket.id}`);

            // Remove old socket if user was connected before
            const oldSocketId = connectedUsers.get(userId);
            // if (oldSocketId && oldSocketId !== socket.id) {
            //     console.log(` User ${userId} had old socket ${oldSocketId}, updating to ${socket.id}`);
            // }

            // Join user-specific room and store mapping
            socket.join(userId);
            connectedUsers.set(userId, socket.id);

            // console.log(`Total connected users: ${connectedUsers.size}`);
            // console.log(`Connected users map:`, Array.from(connectedUsers.entries()));

            // Confirm registration
            socket.emit("registered", {
                userId,
                socketId: socket.id,
                timestamp: new Date()
            });
        });

        socket.on("disconnect", (reason) => {
            // console.log("🔌 Socket disconnected:", socket.id, "Reason:", reason);

            // Find and remove user from connected users map
            let disconnectedUserId = null;
            for (let [userId, socketId] of connectedUsers.entries()) {
                if (socketId === socket.id) {
                    connectedUsers.delete(userId);
                    disconnectedUserId = userId;
                    break;
                }
            }

            // if (disconnectedUserId) {
            //     console.log(` User ${disconnectedUserId} removed from connected users`);
            // }

            // console.log(` Remaining connected users: ${connectedUsers.size}`);
        });

        // Add error handling
        socket.on("error", (error) => {
            console.error(" Socket error:", error);
        });
    });

    // Make io instance available globally for controllers
    setupSocket.io = io;

    return io;
}

// Export connected users for debugging
export { connectedUsers };