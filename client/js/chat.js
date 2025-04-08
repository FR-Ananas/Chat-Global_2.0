const socket = io();
const username = localStorage.getItem("username") || "Anonyme";

// 🔊 Sons rétro
const explosionSound = new Audio("sfx/explosion.wav");
const menuSound = new Audio("sfx/menu.wav");

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
  playConnectionSound();
});

socket.on("user-disconnected", (user) => {
  addMessage({ username: "Système", text: `${user} a quitté le chat.` });
  playConnectionSound();
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
  const messagesContainer = document.getElementById("messages");
  messagesContainer.appendChild(msgEl);

  // 🐛 DEBUG : Affiche l'expéditeur pour analyse
  console.log("Message reçu de :", username);

  if (username.trim().toLowerCase() === "système") {
    msgEl.classList.add("system");
    typeText(msgEl, `${username} : ${text}`);
  } else {
    msgEl.textContent = `${username} : ${text}`;
    msgEl.classList.add("message-flash");
  }

  msgEl.scrollIntoView();
}

// 🔉 Son connexion / déconnexion
function playConnectionSound() {
  explosionSound.currentTime = 0;
  explosionSound.play();
}

// === GESTION DU POPUP UTILISATEURS ===
const popup = document.getElementById("user-popup");
const userList = document.getElementById("user-list");

function toggleUserPopup() {
  popup.classList.toggle("hidden");
  menuSound.currentTime = 0;
  menuSound.play();
}

// 🔄 Mise à jour des utilisateurs en live
socket.on("update-users", (userArray) => {
  userList.innerHTML = "";
  userArray.forEach(user => {
    const li = document.createElement("li");
    li.textContent = user;
    userList.appendChild(li);
  });
});

// 🧙 Animation lettre par lettre pour messages système
function typeText(element, text, delay = 15) {
  let i = 0;
  let currentText = "";
  let cursorVisible = true;

  // Crée le curseur animé `_`
  const cursor = document.createElement("span");
  cursor.textContent = "_";
  cursor.style.display = "inline";

  // Ajoute le curseur au message
  element.textContent = "";
  element.appendChild(cursor);

  // Animation clignotement curseur
  const blink = setInterval(() => {
    cursor.style.visibility = cursorVisible ? "visible" : "hidden";
    cursorVisible = !cursorVisible;
  }, 400);

  // Animation lettre par lettre
  const interval = setInterval(() => {
    currentText += text.charAt(i);
    element.childNodes[0].textContent = currentText;
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      clearInterval(blink);
      cursor.remove(); // Supprime le curseur à la fin
      element.textContent = currentText;
    }
  }, delay);
}
