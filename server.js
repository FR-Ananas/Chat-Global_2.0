const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const { loadMessages, saveMessages } = require("./server/storage/messages");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "client")));

app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// --- État serveur ---
let messages = loadMessages();  // ← on charge les messages au démarrage
let users = {};  // socket.id ➜ pseudo

io.on("connection", (socket) => {
  console.log("👤 Nouvelle connexion");

  // 🎯 Nouvelle gestion des utilisateurs avec liste synchronisée
  socket.on("new-user", (username, callback) => {
    if (Object.values(users).includes(username)) {
      return callback({ success: false, message: "Ce pseudo est déjà utilisé." });
    }

    users[socket.id] = username;
    socket.broadcast.emit("user-connected", username);
    socket.emit("chat-history", messages);

    // 🔄 Mise à jour de la liste des utilisateurs pour tous
    io.emit("update-users", Object.values(users));
    callback({ success: true });
  });

  socket.on("send-message", (msg) => {
    const username = users[socket.id] || "Anonyme";
    const message = { username, text: msg };

    messages.push(message);
    if (messages.length > 50) messages.shift();

    saveMessages(messages);  // ← on persiste à chaque message
    io.emit("chat-message", message);
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    delete users[socket.id];

    if (username) {
      io.emit("user-disconnected", username);
      // 🔄 Mise à jour de la liste après déconnexion
      io.emit("update-users", Object.values(users));
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
