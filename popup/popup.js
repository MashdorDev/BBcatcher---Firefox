const browserAPI = window.browser || window.chrome;

const homeWork = document.getElementById("homework");
homeWork.addEventListener("click", getInfo);

function getInfo() {
  browserAPI.tabs.executeScript({ file: "../scripts/content_scripts.js" });
}

// Add event listener for the login button
document.getElementById("loginBtn").addEventListener("click", () => {
  browserAPI.runtime.sendMessage({ action: "getAuthToken" });
});

document.addEventListener("DOMContentLoaded", function () {

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const homeWorkButton = document.getElementById("homework");
  const userContent = document.getElementById("userContent");

  if (!localStorage.getItem("userInfo")) {
    loginBtn.style.display = "block";
    logoutBtn.style.display = "none";
    userContent.style.display = "none";
    homeWorkButton.style.display = "none";
  } else {
    loginBtn.style.display = "none";
    userContent.style.display = "block";
    logoutBtn.style.display = "block";
    homeWorkButton.style.display = "block";
  }

  // Retrieve user info and populate popup
  browserAPI.runtime
    .sendMessage({ action: "getUserInfo" })
    .then((user) => {
      document.getElementById("username").textContent = user.name;
      document.getElementById("userImage").src = user.image;
    })
    .catch((err) => {
      console.error("An error occurred:", err);
    });
});


document.getElementById("logoutBtn").addEventListener("click", () => {
  // Remove the access token from localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userInfo");
  // Optionally, send a message to background script to invalidate the token
  browserAPI.runtime.sendMessage({ action: "logout" });
  // Update UI to show login button and hide other elements
  document.getElementById("loginBtn").style.display = "block";
  document.getElementById("homework").style.display = "none";
  document.getElementById("username").textContent = "---";
  document.getElementById("userImage").src = "";
});

// Add event listener for the donate button
// Do not Delete - Dor
document.getElementById("donate").addEventListener("click", function () {
  const donate = document.getElementById("kofiframe");
  // switch on and off the disply of the iframe
  if (donate.style.display === "block") {
    donate.style.display = "none";
  } else {
    donate.style.display = "block";
  }
});

// Wrap the checkURL function in a named function expression
// so that you can remove the event listener later if needed.
const checkURLWrapper = function checkURL() {
  browserAPI.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    const url = tab.url;
    const homeWorkButton = document.getElementById("homework");

    // Clear previous event listeners to avoid stacking multiple listeners
    homeWorkButton.removeEventListener("click", navigateToBlackboard);

    if (url.includes("https://learn.humber.ca/ultra/")) {
      homeWorkButton.textContent = "Get Home Work";
    } else {
      homeWorkButton.textContent = "Take me to Blackboard";
      homeWorkButton.addEventListener("click", navigateToBlackboard);
    }
  });
};

// Define the navigation function separately to avoid redefining it every time
function navigateToBlackboard() {
  browserAPI.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    browserAPI.tabs.update(tab.id, { url: "https://learn.humber.ca/ultra/" });
  });
}

// Call checkURL initially to set up the button based on the current URL
checkURLWrapper();

// Set up listeners for tab URL and active tab changes to re-evaluate the button state
browserAPI.tabs.onUpdated.addListener(checkURLWrapper, { properties: ["url"] });
browserAPI.tabs.onActivated.addListener(checkURLWrapper);
