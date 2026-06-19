const chatBox = document.getElementById("chat-box");
const dashboardView = document.getElementById("dashboard-view");
const chatView = document.getElementById("chat-view");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");

/* View Navigation */
function openChat() {
    dashboardView.classList.add("hidden");
    chatView.classList.remove("hidden");
}

function openDashboard() {
    chatView.classList.add("hidden");
    dashboardView.classList.remove("hidden");
}

/* Sidebar Handling */
function toggleSidebar() {
    sidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
}

/* Dark Mode */
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

/* Clear Chat */
function clearChat() {
    chatBox.innerHTML = `
    <div class="message bot">
      👋 Chat cleared successfully. Start a new conversation!
    </div>
  `;
    toggleSidebar();
}

/* Chat functionality */
async function sendMessage() {
    const input = document.getElementById("user-input");
    const message = input.value.trim();

    if (message === "") return;

    // User Message
    chatBox.innerHTML += `
    <div class="message user">
      ${message}
    </div>
  `;

    input.value = "";

    // Typing Animation
    const typingId = "typing-" + Date.now();

    chatBox.innerHTML += `
    <div class="message bot" id="${typingId}">
      Typing...
    </div>
  `;

    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        console.log("Sending request...");
        const response = await fetch("http://192.168.43.192:5000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        document.getElementById(typingId).remove();

        chatBox.innerHTML += `
      <div class="message bot">
        ${data.reply}
      </div>
    `;

    } catch (error) {

        document.getElementById(typingId).remove();

        chatBox.innerHTML += `
      <div class="message bot">
        Backend Connection Error
      </div>
    `;

        console.log(error);
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}

/* Enter Key */
document
    .getElementById("user-input")
    .addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });