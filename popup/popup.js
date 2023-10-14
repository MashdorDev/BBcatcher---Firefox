const browserAPI = window.browser || window.chrome;

// Cache DOM Elements
const elements = {
  loginBtn: document.getElementById("loginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  userContent: document.getElementById("userContent"),
  homeWorkButton: document.getElementById("homework"),
  username: document.getElementById("username"),
  userImage: document.getElementById("userImage"),
  donate: document.getElementById("donate"),
  kofiframe: document.getElementById("kofiframe"),
};

// Event Handlers
function handleLogin() {
  browserAPI.runtime.sendMessage({ action: "getAuthToken" });
}

function handleLogout() {
  browserAPI.runtime.sendMessage({ action: "logout" });
  updateUIOnLoginState(false);
}

function handleDonate() {
  elements.kofiframe.style.display =
    elements.kofiframe.style.display === "block" ? "none" : "block";
}

function handleLoginStateChange(message) {
  updateUIOnLoginState(message.isLoggedIn, message.userInfo);
}

function updateUIOnLoginState(isLoggedIn, userInfo) {
  const displayValue = isLoggedIn ? 'block' : 'none';
  updateDisplay(['logoutBtn', 'userContent', 'homeWorkButton'], displayValue);
  updateDisplay(['loginBtn'], isLoggedIn ? 'none' : 'block');

  if (isLoggedIn && userInfo) {
    setElementProperties('username', { textContent: userInfo.name });
    setElementProperties('userImage', { src: userInfo.picture });
  } else {
    setElementProperties('username', { textContent: '---' });
    setElementProperties('userImage', { src: '' });
  }
}


function navigateToBlackboard() {
  browserAPI.tabs.update({ url: "https://learn.humber.ca/ultra/" });
}

// Utility Functions
function updateDisplay(elementIds, displayValue) {
  elementIds.forEach((id) => {
    elements[id].style.display = displayValue;
  });
}

function setElementProperties(id, properties) {
  Object.keys(properties).forEach((key) => {
    elements[id][key] = properties[key];
  });
}

function checkURL() {
  browserAPI.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;
    const text = url.includes("https://learn.humber.ca/ultra/")
      ? "Get Home Work"
      : "Take me to Blackboard";
    setElementProperties("homeWorkButton", { textContent: text });
  });
}

// Initial Setup
document.addEventListener("DOMContentLoaded", function () {
  // Attach Event Listeners
  elements.loginBtn.addEventListener("click", handleLogin);
  elements.logoutBtn.addEventListener("click", handleLogout);
  elements.donate.addEventListener("click", handleDonate);
  elements.homeWorkButton.addEventListener("click", navigateToBlackboard);

  browserAPI.runtime.onMessage.addListener((message) => {
    if (message.action === "loginStateChange") {
      handleLoginStateChange(message);
    }
  });

  // Set Initial UI State
  const isLoggedIn = !!localStorage.getItem("userInfo");
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || null;  // Retrieve user info from local storage
  updateUIOnLoginState(isLoggedIn, userInfo);  // Pass userInfo as a second argument


  // Check URL
  checkURL();

  // Attach Tab Listeners
  browserAPI.tabs.onUpdated.addListener(checkURL, { properties: ["url"] });
  browserAPI.tabs.onActivated.addListener(checkURL);
});
