browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CREATE_NOTIFICATION") {
    browserAPI.notifications
      .create({
        type: "basic",
        title: "BBcatcher",
        message: message.message,
        iconUrl: browserAPI.runtime.getURL("icons/icon.png"),
      })
      .catch((error) => {
        console.error("Error creating notification:", error);
      });
  } else if (message.action === "navigateToBlackboard") {
        // Get the active tab
        browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
          // Check if there's an active tab
          if (tabs[0]) {
              browserAPI.tabs.update(tabs[0].id, { url: 'https://learn.humber.ca/ultra/calendar' });
          } else {
              console.error('No active tab found');
          }
      });
      return;
  }else if (message.action === "getHomework") {
    if (message.action === "getHomework") {
      const tabId = message.tabId; // Get the tab ID from the message
      if (typeof tabId !== "undefined") {
        // Forward the message to the content script
        browserAPI.tabs
          .sendMessage(tabId, { action: "getHomework" })
          .then((response) => {
            sendResponse(response);
          })
          .catch((error) => {
            console.error("Error sending message to content script:", error);
          });
        return true; // Keeps the message channel open for asynchronous response
      } else {
        console.error("No tab ID provided.");
      }
    }
  } else if (message.type === "ADD_TO_CALENDAR") {
    handleAddToTasks(message, sendResponse);
  } else if (
    message.action === "getAuthToken" ||
    message.action === "getUserInfo"
  ) {
    checkOrGetAccessToken()
      .then(getUserInfo)
      .then((userInfo) => {
        // Notify the popup about the login state change
        browserAPI.runtime.sendMessage({
          action: "loginStateChange",
          isLoggedIn: true,
          userInfo: userInfo,
        });
        // Optionally, you could call notifyUser here if desired:
        // notifyUser(userInfo);
      })
      .catch(logError);
  } else if (message.action === "logout") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");

    sendResponse({ message: "User logged out" });

    browserAPI.runtime.sendMessage({
      action: "loginStateChange",
      isLoggedIn: false,
    });
  } else {
    console.error("No message type found");
  }
});

function checkOrGetAccessToken() {
  // Check if access token already exists in localStorage
  const tokenObj = localStorage.getItem("accessToken");
  if (tokenObj) {
    return Promise.resolve(JSON.parse(tokenObj).access_token);
  }
  // If not, fetch a new access token using getAccessToken
  return getAccessToken().then((tokenObj) => {
    const actualToken = tokenObj.access_token; // Extract the actual token string
    localStorage.setItem("accessToken", JSON.stringify(tokenObj)); // Save the access token to local storage
    return actualToken;
  });
}

function getUserInfo(token) {
  // Assuming there's an endpoint at 'https://api.example.com/user'
  // that returns user info when provided with a valid token.
  const endpoint = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json";

  return fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.statusText}`);
      }
      return response.json(); // Parse and return the JSON response body
    })
    .then((userInfo) => {
      // Save user info to local storage for later use
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      return userInfo; // Return user info for further processing
    })
    .catch((error) => {
      console.error(`Error fetching user info: ${error.message}`);
      throw error; // Re-throw error to be caught by outer .catch() handler
    });
}

function notifyUser(user) {
  browserAPI.runtime.sendMessage({
    action: "loginStateChange",
    isLoggedIn: true,
    user: user,
  });
  browserAPI.notifications.create({
    type: "basic",
    title: "You have logged in!",
    iconUrl: browserAPI.runtime.getURL("icons/icon.png"),
    message: `Hi ${user.name} you are now connected to your google account`,
  });
}

async function handleAddToTasks(message, sendResponse) {
  try {
    const tokenObj = await getAccessToken();
    const actualToken = tokenObj.access_token;

    const taskPromises = message.data.map((taskData) => {
      const { courseName, courseCode, dueName, dueDate, dueTime, courseLink } =
        taskData;

      const title = `${courseName} - ${dueName}`;
      const notes = `
      Course Name: ${courseName}
      Course Code: ${courseCode}
      Assignment: ${dueName}
      Due Date: ${dueDate} ${dueTime.join(":")}
      [Course Link](${courseLink})
    `;
      const due = dueDate ;

      return createTask(actualToken, title, notes, due);
    });

    await Promise.all(taskPromises);

    sendResponse({ message: "All tasks added" });
  } catch (error) {
    logError(error);
  }
}

async function createTask(token, title, notes, due) {
  // Convert 'due' to a Date object if it's not already one
  if (!(due instanceof Date)) {
    if (typeof due === "string") {
      due = new Date(due);
    } else if (typeof due === "number") {
      due = new Date(due);
    } else {
      console.error(
        "Invalid 'due' type. Expected a Date object, string, or number."
      );
      return;
    }
  }

  // Prepare the task payload
  const task = {
    title: title, // Required
    notes: notes, // Optional
    due: due.toISOString().split("T")[0] + "T00:00:00.000Z", // Optional, only date part is used
    status: "needsAction", // Optional, either "needsAction" or "completed"
    links: [
      {
        type: "text/html",
        description: "Course Link",
        link: notes.match(/\(https:\/\/[^\)]+\)/)[0].slice(1, -1), // Extract URL from markdown link in notes
      },
    ],
  };

  const tasklistId = "@default"; // Replace with your task list ID if not using the default list

  // Make the API request
  const response = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    }
  );

  // Check the response
  if (!response.ok) {
    console.error(
      `Failed to create task. Status: ${response.status}, StatusText: ${response.statusText}`
    );
    const responseBody = await response.json();
    console.error(`Response Body: ${JSON.stringify(responseBody)}`);
    throw new Error(`Failed to create task: ${response.statusText}`);
  }

  return await response.json();
}

function logError(error, userInfo = null) {
  const timestamp = new Date().toISOString();
  let environmentInfo = "Environment info not available";

  if (typeof process !== "undefined" && process.version) {
    environmentInfo = `Node Version: ${process.version}`;
  } else if (typeof navigator !== "undefined") {
    environmentInfo = `Browser: ${navigator.userAgent}`;
  }

  const errorType = error.constructor.name;
  const errorCode = error.code || "N/A"; // Some errors have a 'code' property

  console.error(`--- Error Log Start ---`);
  console.error(`Timestamp: ${timestamp}`);
  console.error(`Error Type: ${errorType}`);
  console.error(`Error Code: ${errorCode}`);
  console.error(`Message: ${error.message}`);
  console.error(`Stack Trace: ${error.stack}`);
  console.error(`Environment: ${environmentInfo}`);

  if (userInfo) {
    console.error(`User Info: ${JSON.stringify(userInfo)}`);
  }

  console.error(`--- Error Log End ---`);
}
