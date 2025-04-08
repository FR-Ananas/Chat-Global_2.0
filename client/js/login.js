function login() {
  const username = document.getElementById("username").value;
  if (username.trim() !== "") {
    localStorage.setItem("username", username);
    window.location.href = "chat.html";
  }
}
