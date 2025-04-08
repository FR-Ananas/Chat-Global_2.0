const socket = io();
const username = localStorage.getItem("username") || "Anonyme";

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
  
  // 🎯 Classe spéciale pour messages système
  if (username === "Système") {
    msgEl.classList.add("system");
  }

  document.getElementById("messages").appendChild(msgEl);
  msgEl.scrollIntoView();
}
