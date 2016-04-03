var ref = new Firebase("https://your-firebase-location.firebaseio.com");
ref.authWithOAuthPopup("google", function(error, authData) {
  if (error) {
    console.log("Authentication Failed!", error);
  } else {
    console.log("Authenticated successfully with payload:", authData);
  }
});
