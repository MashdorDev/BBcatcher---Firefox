const REDIRECT_URL = browser.identity.getRedirectURL();
const CLIENT_ID =
  "597587515735-9gfojisq4ih1o5mi1cj9a8h0dpqu70a7.apps.googleusercontent.com";
const SCOPES = ["openid", "email", "profile", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"];
const AUTH_URL = `https://accounts.google.com/o/oauth2/auth\
?client_id=${CLIENT_ID}\
&response_type=token\
&redirect_uri=${encodeURIComponent(REDIRECT_URL)}\
&scope=${encodeURIComponent(SCOPES.join(" "))}`;
const VALIDATION_BASE_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo";

function extractAccessToken(redirectUri) {
  if (typeof redirectUri !== "string") {
    throw new Error("Expected a string for redirectUri");
  }

  const match = redirectUri.match(/[#?](.*)/);
  if (!match || match.length < 1) {
    throw new Error(`Authorization failure: Unable to extract access token from ${redirectUri}`);
  }

  const params = new URLSearchParams(match[1].split("#")[0]);
  return params.get("access_token");
}

async function checkResponse(response) {
  if (response.status !== 200) {
    throw new Error("Token validation error");
  }
  const json = await response.json();
  if (json.aud && json.aud === CLIENT_ID) {
    return json;
  } else {
    throw new Error("Token validation error");
  }
}

async function validate(redirectURL) {
  console.log("Type of someVariable:", typeof redirectURL);
  console.log("Value of someVariable:", redirectURL);
  const accessToken = extractAccessToken(redirectURL);
  const validationURL = `${VALIDATION_BASE_URL}?access_token=${accessToken}`;
  const response = await fetch(validationURL, { method: "GET" });
  const json = await checkResponse(response);

  // Include the actual access token in the object being returned
  return {
    ...json,
    access_token: accessToken,
  };
}

async function authorize() {
  const redirectURL = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: AUTH_URL,
  });
  return validate(redirectURL);
}

async function getAccessToken() {
  try {
    return await authorize();
  } catch (error) {
    console.error("Failed to get access token: ", error);
    throw error;
  }
}

