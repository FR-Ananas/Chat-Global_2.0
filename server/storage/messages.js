const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "messages.json");

// Initialise les messages depuis le fichier s’il existe
function loadMessages() {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  }
  return [];
}

// Sauvegarde les messages dans le fichier
function saveMessages(messages) {
  fs.writeFileSync(filePath, JSON.stringify(messages.slice(-50), null, 2));
}

module.exports = {
  loadMessages,
  saveMessages,
};
