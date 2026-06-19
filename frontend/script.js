import { marked } from "marked";

const chatBox = document.getElementById("chat-box");
const dashboardView = document.getElementById("dashboard-view");
const chatView = document.getElementById("chat-view");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");

// Retrieve User Session Details
const user = JSON.parse(localStorage.getItem("user") || "{}");
const userId = user.id || "default";

// Dynamic Greeting
const welcomeMsg = document.getElementById("welcome-message");
if (welcomeMsg && user.name) {
  welcomeMsg.textContent = `Welcome ${user.name} ✨`;
}

// State Management for Health Insights & Recent Queries
let healthInsights = {
  symptoms: [],
  nextCheckup: "None",
  age: "",
  gender: "",
  bloodGroup: "",
  height: "",
  weight: ""
};

let recentQueries = [];

// Load State from localStorage
const storedInsights = localStorage.getItem(`health_insights_${userId}`);
if (storedInsights) {
  try {
    healthInsights = JSON.parse(storedInsights);
  } catch (e) {
    console.error("Error parsing health insights:", e);
  }
}

const storedQueries = localStorage.getItem(`recent_queries_${userId}`);
if (storedQueries) {
  try {
    recentQueries = JSON.parse(storedQueries);
  } catch (e) {
    console.error("Error parsing recent queries:", e);
  }
} else {
  // Pre-fill with default placeholders on first load
  recentQueries = ["Migraine cures", "Flu prevention", "Vitamin D sources"];
  localStorage.setItem(`recent_queries_${userId}`, JSON.stringify(recentQueries));
}

// Update Dashboard UI values
function updateDashboardUI() {
  const queriesList = document.getElementById("recent-queries-list");
  if (queriesList) {
    queriesList.innerHTML = "";
    if (recentQueries.length === 0) {
      queriesList.innerHTML = "<li>No recent queries yet</li>";
    } else {
      recentQueries.forEach(query => {
        const li = document.createElement("li");
        li.textContent = `• ${query}`;
        li.style.cursor = "pointer";
        li.onclick = () => runRecentQuery(query);
        queriesList.appendChild(li);
      });
    }
  }

  const insightSymptoms = document.getElementById("insight-symptoms");
  const insightCheckup = document.getElementById("insight-checkup");
  const insightProfile = document.getElementById("insight-profile");

  if (insightSymptoms) {
    const symptomCount = healthInsights.symptoms ? healthInsights.symptoms.length : 0;
    insightSymptoms.textContent = `• ${symptomCount} Active Symptoms`;
  }
  if (insightCheckup) {
    insightCheckup.textContent = `• Next checkup: ${healthInsights.nextCheckup || "None"}`;
  }
  if (insightProfile) {
    let filledFields = 2; // Default Name & Email
    if (healthInsights.age) filledFields++;
    if (healthInsights.gender) filledFields++;
    if (healthInsights.bloodGroup) filledFields++;
    if (healthInsights.height) filledFields++;
    if (healthInsights.weight) filledFields++;
    const percent = Math.round((filledFields / 7) * 100);
    insightProfile.textContent = `• Profile: ${percent}% Setup`;
  }
}

/* Save a new query asked to chatbot */
function saveRecentQuery(query) {
  // Keep only unique queries
  recentQueries = recentQueries.filter(q => q.toLowerCase() !== query.toLowerCase());
  // Prepend the new query to list
  recentQueries.unshift(query);
  // Keep only the 3 most recent questions (minimum questions)
  if (recentQueries.length > 3) {
    recentQueries = recentQueries.slice(0, 3);
  }
  localStorage.setItem(`recent_queries_${userId}`, JSON.stringify(recentQueries));
  updateDashboardUI();
}

/* Run recent query instantly */
function runRecentQuery(query) {
  const input = document.getElementById("user-input");
  if (input) {
    input.value = query;
    openChat();
    sendMessage();
  }
}

/* Health Insights Modal Functionality */
let tempSymptoms = []; // Temporary symptoms track

function openHealthInsightsModal() {
  const modal = document.getElementById("health-insights-modal");
  if (!modal) return;

  tempSymptoms = [...(healthInsights.symptoms || [])];

  document.getElementById("checkup-date-input").value = healthInsights.nextCheckup === "None" ? "" : healthInsights.nextCheckup;
  document.getElementById("profile-age").value = healthInsights.age || "";
  document.getElementById("profile-gender").value = healthInsights.gender || "";
  document.getElementById("profile-blood").value = healthInsights.bloodGroup || "";
  document.getElementById("profile-height").value = healthInsights.height || "";
  document.getElementById("profile-weight").value = healthInsights.weight || "";

  renderModalSymptoms();
  switchModalTab("tab-symptoms");

  modal.style.display = "flex";
}

function closeHealthInsightsModal() {
  const modal = document.getElementById("health-insights-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

function switchModalTab(tabId) {
  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.style.display = "none";
  });
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  const activePane = document.getElementById(tabId);
  if (activePane) {
    activePane.style.display = "flex";
  }

  let btnId = "btn-tab-symptoms";
  if (tabId === "tab-checkup") btnId = "btn-tab-checkup";
  if (tabId === "tab-profile") btnId = "btn-tab-profile";

  const activeBtn = document.getElementById(btnId);
  if (activeBtn) {
    activeBtn.classList.add("active");
  }
}

function renderModalSymptoms() {
  const list = document.getElementById("modal-symptom-list");
  if (!list) return;
  list.innerHTML = "";

  tempSymptoms.forEach((symptom, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${symptom}
      <button class="delete-symptom-btn" onclick="removeSymptom(${idx})">✕</button>
    `;
    list.appendChild(li);
  });
}

function addSymptomFromInput() {
  const input = document.getElementById("new-symptom-input");
  if (!input) return;
  const val = input.value.trim();
  if (val && !tempSymptoms.includes(val)) {
    tempSymptoms.push(val);
    input.value = "";
    renderModalSymptoms();
  }
}

function removeSymptom(index) {
  tempSymptoms.splice(index, 1);
  renderModalSymptoms();
}

function saveHealthInsights() {
  const checkupVal = document.getElementById("checkup-date-input").value.trim();
  healthInsights.nextCheckup = checkupVal === "" ? "None" : checkupVal;

  healthInsights.symptoms = [...tempSymptoms];
  healthInsights.age = document.getElementById("profile-age").value.trim();
  healthInsights.gender = document.getElementById("profile-gender").value;
  healthInsights.bloodGroup = document.getElementById("profile-blood").value.trim();
  healthInsights.height = document.getElementById("profile-height").value.trim();
  healthInsights.weight = document.getElementById("profile-weight").value.trim();

  localStorage.setItem(`health_insights_${userId}`, JSON.stringify(healthInsights));

  updateDashboardUI();
  closeHealthInsightsModal();
}

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

  // Save query to Recent Queries
  saveRecentQuery(message);

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
    const response = await fetch("https://public-health-chatbot-nuq7.onrender.com/api/chat", {
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
        ${marked.parse(data.reply)}
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

/* Logout Function */
function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// Initial DOM Load Hook
document.addEventListener("DOMContentLoaded", () => {
  updateDashboardUI();

  const symInput = document.getElementById("new-symptom-input");
  if (symInput) {
    symInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addSymptomFromInput();
      }
    });
  }
});

// Make functions available globally for HTML inline event handlers
window.openChat = openChat;
window.openDashboard = openDashboard;
window.toggleSidebar = toggleSidebar;
window.toggleDarkMode = toggleDarkMode;
window.clearChat = clearChat;
window.sendMessage = sendMessage;
window.logoutUser = logoutUser;
window.openHealthInsightsModal = openHealthInsightsModal;
window.closeHealthInsightsModal = closeHealthInsightsModal;
window.switchModalTab = switchModalTab;
window.addSymptomFromInput = addSymptomFromInput;
window.removeSymptom = removeSymptom;
window.saveHealthInsights = saveHealthInsights;
window.runRecentQuery = runRecentQuery;