async function getUserInfo(accessToken) {
  const requestURL = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json";
  const requestHeaders = new Headers();
  requestHeaders.append('Authorization', `Bearer ${accessToken}`);
  const driveRequest = new Request(requestURL, {
    method: "GET",
    headers: requestHeaders
  });

  const response = await fetch(driveRequest);

  if (response.status === 200) {
    const user = await response.json();

    // Store the user info in local storage
    localStorage.setItem('userInfo', JSON.stringify(user));

    return user;
  } else {
    throw new Error(`Failed to fetch user info, status: ${response.status}`);
  }
}