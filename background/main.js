browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background script:", message);
  if (message.type === "CREATE_NOTIFICATION") {
    console.log("Creating notification...");
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
  }else  if (message.type === "ADD_TO_CALENDAR") {
    handleAddToTasks(message, sendResponse);
  } else if (message.action === "getAuthToken" || message.action === "getUserInfo") {
    checkOrGetAccessToken()
        .then(getUserInfo)
        .then((userInfo) => {
            // Notify the popup about the login state change
            browserAPI.runtime.sendMessage({ action: "loginStateChange", isLoggedIn: true, userInfo: userInfo });
            console.log("User info found in local storage: ", userInfo);
            // Optionally, you could call notifyUser here if desired:
            // notifyUser(userInfo);
        })
        .catch(logError);
}

//    else if (message.action === "getUserInfo") {
//     const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//     console.log("User info found in local storage: ", userInfo);

//     if (userInfo) {
//       // sendResponse({ name: userInfo.name, image: userInfo.picture });
//       browserAPI.runtime.sendMessage({ action: "loginStateChange", isLoggedIn: true, userInfo: message.user });
//     }
//   }
//  }
else if(message.action === "logout") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");

    sendResponse({ message: "User logged out" });

    browserAPI.runtime.sendMessage({ action: "loginStateChange", isLoggedIn: false });


  }else {
    console.error("No message type found");
  }
});

function checkOrGetAccessToken() {
  // Check if access token already exists in localStorage
  const tokenObj = localStorage.getItem('accessToken');
  if (tokenObj) {
      return Promise.resolve(JSON.parse(tokenObj).access_token);
  }
  // If not, fetch a new access token using getAccessToken
  return getAccessToken()
      .then((tokenObj) => {
          const actualToken = tokenObj.access_token; // Extract the actual token string
          localStorage.setItem("accessToken", JSON.stringify(tokenObj)); // Save the access token to local storage
          return actualToken;
      });
}

function getUserInfo(token) {
  // Assuming there's an endpoint at 'https://api.example.com/user'
  // that returns user info when provided with a valid token.
  const endpoint = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json';

  return fetch(endpoint, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${token}`,
      },
  })
      .then(response => {
          if (!response.ok) {
              throw new Error(`Failed to fetch user info: ${response.statusText}`);
          }
          return response.json();  // Parse and return the JSON response body
      })
      .then(userInfo => {
          // Save user info to local storage for later use
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          return userInfo;  // Return user info for further processing
      })
      .catch(error => {
          console.error(`Error fetching user info: ${error.message}`);
          throw error;  // Re-throw error to be caught by outer .catch() handler
      });
}


function notifyUser(user) {
  browserAPI.runtime.sendMessage({ action: "loginStateChange", isLoggedIn: true, user: user });
  browser.notifications.create({
    type: "basic",
    title: "You have logged in!",
    iconUrl: browser.runtime.getURL("icons/icon.png"),
    message: `Hi ${user.name} you are now connected to your google account`,
  });
}

async function handleAddToTasks(message, sendResponse) {
  console.log("Message received: ", message);

  try {
    const tokenObj = await getAccessToken();
    const actualToken = tokenObj.access_token;

    const taskPromises = message.data.map((taskData) => {
      const { courseName, courseCode, dueName, dueDate, dueTime, courseLink } =
        taskData;

      const title = `${courseName} - ${dueName}`;
      const notes = `Course Code: ${courseCode}, Due: ${dueName}`;
      const due = dueDate; // Replace with actual due date

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
  };

  // console.log("Task payload:", JSON.stringify(task));  // Debug log to check the payload

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
