const socket = io();
const username = localStorage.getItem("username") || "Anonyme";

// 🎧 Son d'explosion 8-bit pour ambiance rétro
const explosionSound = new Audio("sfx/explosion.wav");

socket.emit("new-user", username, (response) => {
  if (!response.success) {
    alert(response.message);
    localStorage.removeItem("username");
    window.location.href = "login.html";
    return;
  }
});

socket.on("chat-history", (history) => {
  history.forEach(addMessage);
});

socket.on("chat-message", addMessage);

socket.on("user-connected", (user) => {
  addMessage({ username: "Système", text: `${user} a rejoint le chat.` });
});

socket.on("user-disconnected", (user) => {
  addMessage({ username: "Système", text: `${user} a quitté le chat.` });
});

document.getElementById("message-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (text !== "") {
    socket.emit("send-message", text);
    input.value = "";
  }
});

function addMessage({ username, text }) {
  const msgEl = document.createElement("div");
  msgEl.textContent = `${username} : ${text}`;
  
  if (username === "Système") {
    msgEl.classList.add("system");
  } else {
    // 🔊 Joue le son explosion rétro à chaque message utilisateur
    explosionSound.currentTime = 0;
    explosionSound.play();
  }

  document.getElementById("messages").appendChild(msgEl);
  msgEl.scrollIntoView();
}
