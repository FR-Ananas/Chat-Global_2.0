const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Statique pour le frontend
app.use(express.static(path.join(__dirname, "client")));

// Messages stockés temporairement (50 max)
let messages = [];
let users = {};

io.on("connection", (socket) => {
  console.log("Nouvel utilisateur connecté");

  socket.on("new-user", (username) => {
    users[socket.id] = username;
    socket.broadcast.emit("user-connected", username);
    socket.emit("chat-history", messages);
  });

  socket.on("send-message", (msg) => {
    const username = users[socket.id] || "Anonyme";
    const message = { username, text: msg };

    messages.push(message);
    if (messages.length > 50) messages.shift(); // Garde les 50 derniers

    io.emit("chat-message", message);
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    delete users[socket.id];
    if (username) io.emit("user-disconnected", username);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
